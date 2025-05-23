import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import cron from "node-cron";
import {
  ProjectInfo,
  AnalysisReport,
  InvestmentProposal,
  InvestmentDecision,
  ProjectDiscoveryTask,
  ProposalTask,
  EVENT_TYPES,
} from "./investment_types";

/**
 * 投资经理模块 - 负责项目发现和投资提案
 * 工作流程：
 * 1. 定期寻找新项目
 * 2. 发现项目后请求分析师分析
 * 3. 接收分析报告后，创建投资提案
 * 4. 接收投资决策，做后续跟进
 */
class InvestmentManagerModule {
  private agent: Agent;
  private offListeners: Array<() => void> = [];
  private projectCounter: number = 0;
  private discoveredProjects: Map<string, ProjectInfo> = new Map();
  private receivedReports: Map<string, AnalysisReport> = new Map();
  private createdProposals: Map<string, InvestmentProposal> = new Map();
  private decisions: Map<string, InvestmentDecision> = new Map();

  constructor(agent: Agent) {
    this.agent = agent;
  }

  init() {
    console.log(`[投资经理] 初始化，ID: ${this.agent.agentId}`);

    // 设置定期寻找项目的任务
    this.setupProjectDiscovery();

    // 1. 监听分析报告 (来自分析师)
    const offReportListener = this.agent.groupSensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === EVENT_TYPES.ANALYSIS_COMPLETED) {
          const report = evt.payload as AnalysisReport;
          console.log(
            `[投资经理 ${this.agent.agentId}] 收到分析报告，项目: ${report.projectId}`
          );

          // 保存报告
          this.receivedReports.set(report.projectId, report);

          // 获取对应的项目信息
          const projectInfo = this.discoveredProjects.get(report.projectId);
          if (projectInfo) {
            // 创建投资提案
            this.createInvestmentProposal({ report, project: projectInfo });
          } else {
            console.log(
              `[投资经理 ${this.agent.agentId}] 错误: 找不到项目信息 ${report.projectId}`
            );
          }
        }
      }
    );
    this.offListeners.push(offReportListener);

    // 2. 监听投资决策 (来自合伙人)
    const offDecisionListener = this.agent.groupSensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === EVENT_TYPES.DECISION_MADE) {
          const decision = evt.payload as InvestmentDecision;
          console.log(
            `[投资经理 ${this.agent.agentId}] 收到投资决策，项目: ${decision.projectId}, ` +
              `结果: ${decision.approved ? "通过" : "拒绝"}`
          );

          // 保存决策
          this.decisions.set(decision.projectId, decision);

          // 这里可以添加后续跟进逻辑
          this.handleDecision(decision);
        }
      }
    );
    this.offListeners.push(offDecisionListener);
  }

  setupProjectDiscovery() {
    // 每15 seconds发现一个新项目;
    cron.schedule("*/15 * * * * *", () => {
      this.discoverProject();
    });
    // this.discoverProject();
  }

  discoverProject() {
    this.projectCounter++;
    const projectId = `proj-${Date.now()}-${this.projectCounter}`;

    // 随机生成项目信息
    const industries = [
      "人工智能",
      "清洁能源",
      "生物科技",
      "金融科技",
      "电子商务",
    ];
    const stages = ["种子轮", "天使轮", "A轮", "B轮", "C轮"];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const askingAmount = Math.floor(Math.random() * 50 + 1) * 100_0000; // 100万 - 5000万

    // 创建项目发现任务
    const task = this.agent.taskManager.createTask<ProjectInfo>({
      type: "DISCOVER_PROJECT",
      description: `发现新项目 ${projectId}`,
      payload: {
        projectId,
        name: `${industry}创新项目${this.projectCounter}`,
        industry,
        fundingStage: stage,
        askingAmount,
        description: `一个有前景的${industry}项目，正在寻求${stage}融资${
          askingAmount / 10000
        }万元。`,
        timestamp: Date.now(),
        sourceManager: this.agent.agentId,
      },
      callback: (project) => {
        console.log(
          `[投资经理 ${this.agent.agentId}] 发现项目: ${project.name}, ID: ${project.projectId}`
        );

        // 保存项目信息
        this.discoveredProjects.set(project.projectId, project);

        // 发布项目发现事件，请求分析
        this.agent.groupSensing.emitEvent({
          type: EVENT_TYPES.PROJECT_DISCOVERED,
          payload: project,
          timestamp: Date.now(),
          description: `投资经理 ${this.agent.agentId} 发现了新项目: ${project.name}`,
        });

        // 明确请求分析师分析
        this.requestAnalysis(project);

        return `成功发现项目: ${project.name}`;
      },
    }) as ProjectDiscoveryTask;
  }

  requestAnalysis(project: ProjectInfo) {
    // 发送分析请求事件
    this.agent.groupSensing.emitEvent({
      type: EVENT_TYPES.ANALYSIS_REQUESTED,
      payload: project,
      timestamp: Date.now(),
      description: `投资经理 ${this.agent.agentId} 请求对项目 ${project.name} 进行分析`,
    });

    console.log(
      `[投资经理 ${this.agent.agentId}] 已请求对项目 ${project.name} 进行分析`
    );
  }

  createInvestmentProposal(data: {
    report: AnalysisReport;
    project: ProjectInfo;
  }) {
    // 创建投资提案任务
    const task = this.agent.taskManager.createTask<{
      report: AnalysisReport;
      project: ProjectInfo;
    }>({
      type: "CREATE_INVESTMENT_PROPOSAL",
      description: `为项目 ${data.project.name} 创建投资提案`,
      payload: data,
      callback: (data) => {
        const { report, project } = data;

        console.log(
          `[投资经理 ${this.agent.agentId}] 正在创建项目 ${project.name} 的投资提案`
        );

        // 根据分析报告计算建议的投资金额
        let proposedAmount = project.askingAmount;
        if (report.recommendationScore >= 8) {
          // 高评分项目，全额投资
          proposedAmount = project.askingAmount;
        } else if (report.recommendationScore >= 6) {
          // 中评分项目，投资2/3
          proposedAmount = Math.floor((project.askingAmount * 2) / 3);
        } else {
          // 低评分项目，投资1/3或拒绝
          proposedAmount =
            report.recommendationScore > 3
              ? Math.floor((project.askingAmount * 1) / 3)
              : 0;
        }

        // 创建投资提案
        const proposal: InvestmentProposal = {
          projectId: project.projectId,
          manager: this.agent.agentId,
          projectSummary: `${project.name} (${project.industry}) - ${
            project.fundingStage
          }融资项目，融资需求${project.askingAmount / 10000}万元`,
          proposedInvestmentAmount: proposedAmount,
          expectedReturn: this.calculateExpectedReturn(
            report.recommendationScore
          ),
          supportingAnalysis: `基于分析师${report.analyst}的报告，综合评分${report.recommendationScore}/10。关键风险: ${report.riskAnalysis}`,
          timestamp: Date.now(),
        };

        // 保存提案
        this.createdProposals.set(project.projectId, proposal);

        // 发布提案创建事件
        this.agent.groupSensing.emitEvent({
          type: EVENT_TYPES.PROPOSAL_CREATED,
          payload: proposal,
          timestamp: Date.now(),
          description: `投资经理 ${this.agent.agentId} 为项目 ${project.name} 创建了投资提案`,
        });

        // 安排与合伙人的演示
        this.schedulePresentationWithPartner(proposal, report);

        return `成功创建投资提案: ${project.name}，建议投资金额: ${
          proposedAmount / 10000
        }万元`;
      },
    }) as ProposalTask;
  }

  calculateExpectedReturn(score: number): string {
    if (score >= 9) return "预期年回报率 30%+";
    if (score >= 7) return "预期年回报率 20-30%";
    if (score >= 5) return "预期年回报率 10-20%";
    return "预期年回报率 <10%";
  }

  schedulePresentationWithPartner(
    proposal: InvestmentProposal,
    report: AnalysisReport
  ) {
    // 发送演示安排事件
    this.agent.groupSensing.emitEvent({
      type: EVENT_TYPES.PRESENTATION_SCHEDULED,
      payload: {
        proposal,
        report,
        scheduledTime: Date.now() + 5000, // 模拟5秒后进行演示
      },
      timestamp: Date.now(),
      description: `投资经理 ${this.agent.agentId} 安排了项目 ${proposal.projectId} 的投资决策演示`,
    });

    console.log(
      `[投资经理 ${this.agent.agentId}] 已安排项目 ${proposal.projectId} 的投资决策演示`
    );
  }

  handleDecision(decision: InvestmentDecision) {
    // 创建一个内部任务来处理决策
    this.agent.taskManager.createTask({
      type: "HANDLE_INVESTMENT_DECISION",
      description: `处理项目 ${decision.projectId} 的投资决策`,
      payload: decision,
      callback: (decision) => {
        if (decision.approved) {
          console.log(
            `[投资经理 ${this.agent.agentId}] 项目 ${decision.projectId} 的投资获批! ` +
              `金额: ${
                decision.approvedAmount / 10000
              }万元。开始执行投资计划...`
          );
          // 这里可以添加后续执行逻辑
        } else {
          console.log(
            `[投资经理 ${this.agent.agentId}] 项目 ${decision.projectId} 的投资被拒绝。` +
              `原因: ${decision.comments}`
          );
          // 这里可以添加反馈或其他处理逻辑
        }
        return `成功处理投资决策: ${decision.projectId}`;
      },
    });
  }

  showStatus() {
    console.log(`\n[投资经理 ${this.agent.agentId}] 状态报告:`);
    console.log(`- 已发现项目: ${this.discoveredProjects.size}`);
    console.log(`- 已收到分析报告: ${this.receivedReports.size}`);
    console.log(`- 已创建投资提案: ${this.createdProposals.size}`);
    console.log(`- 已收到投资决策: ${this.decisions.size}`);

    console.log("\n最近项目状态:");

    // 获取最近5个项目
    const recentProjects = Array.from(this.discoveredProjects.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    recentProjects.forEach((project) => {
      const report = this.receivedReports.get(project.projectId);
      const proposal = this.createdProposals.get(project.projectId);
      const decision = this.decisions.get(project.projectId);

      console.log(`\n项目: ${project.name} (ID: ${project.projectId})`);
      console.log(
        `- 行业: ${project.industry}, 融资阶段: ${project.fundingStage}`
      );
      console.log(`- 融资需求: ${project.askingAmount / 10000}万元`);

      if (report) {
        console.log(`- 分析报告: 评分 ${report.recommendationScore}/10`);
      } else {
        console.log(`- 分析报告: 尚未收到`);
      }

      if (proposal) {
        console.log(
          `- 投资提案: 建议投资 ${
            proposal.proposedInvestmentAmount / 10000
          }万元`
        );
        console.log(`  预期回报: ${proposal.expectedReturn}`);
      } else {
        console.log(`- 投资提案: 尚未创建`);
      }

      if (decision) {
        console.log(
          `- 投资决策: ${decision.approved ? "通过" : "拒绝"}, ` +
            `金额: ${
              decision.approved
                ? decision.approvedAmount / 10000 + "万元"
                : "N/A"
            }`
        );
      } else {
        console.log(`- 投资决策: 尚未决策`);
      }
    });
  }

  teardown() {
    this.offListeners.forEach((off) => off());
    console.log(`[投资经理 ${this.agent.agentId}] 模块已关闭`);
  }
}

/**
 * 启用投资经理模块
 */
export function enableInvestmentManagerModule(agent: Agent) {
  const module = new InvestmentManagerModule(agent);
  module.init();
  console.log(`[投资经理模块] 已在Agent ${agent.agentId} 上启用`);

  return {
    showStatus: () => module.showStatus(),
    teardown: () => module.teardown(),
  };
}

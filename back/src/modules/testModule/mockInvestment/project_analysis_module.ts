import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import {
  ProjectInfo,
  AnalysisReport,
  AnalysisTask,
  ReportTask,
  EVENT_TYPES,
} from "./investment_types";

/**
 * 分析师模块 - 负责项目分析和报告生成
 * 工作流程：
 * 1. 接收投资经理发现的项目
 * 2. 对项目进行深入分析
 * 3. 生成分析报告并发布
 * 4. 协助投资经理进行演示
 */
class AnalystModule {
  private agent: Agent;
  private offListeners: Array<() => void> = [];
  private analyzedProjects: Map<string, ProjectInfo> = new Map();
  private generatedReports: Map<string, AnalysisReport> = new Map();

  constructor(agent: Agent) {
    this.agent = agent;
  }

  init() {
    console.log(`[分析师] 初始化，ID: ${this.agent.agentId}`);

    // 1. 监听项目发现事件
    const offProjectListener = this.agent.groupSensing.registerListener(
      (evt: AgentEvent) => {
        if (
          evt.type === EVENT_TYPES.PROJECT_DISCOVERED ||
          evt.type === EVENT_TYPES.ANALYSIS_REQUESTED
        ) {
          const project = evt.payload as ProjectInfo;

          // 如果已经分析过，就跳过
          if (this.analyzedProjects.has(project.projectId)) {
            return;
          }

          console.log(
            `[分析师 ${this.agent.agentId}] 接收到新项目: ${project.name}`
          );
          this.analyzeProject(project);
        }
      }
    );
    this.offListeners.push(offProjectListener);

    // 2. 监听演示安排事件，准备协助投资经理
    const offPresentationListener = this.agent.groupSensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === EVENT_TYPES.PRESENTATION_SCHEDULED) {
          const { proposal, report, scheduledTime } = evt.payload;

          // 检查是否是我生成的报告
          if (report.analyst === this.agent.agentId) {
            console.log(
              `[分析师 ${this.agent.agentId}] 注意到项目 ${proposal.projectId} ` +
                `的演示已安排，准备协助演示`
            );

            // 这里可以添加准备演示的逻辑
            this.preparePresentationSupport(proposal.projectId, scheduledTime);
          }
        }
      }
    );
    this.offListeners.push(offPresentationListener);
  }

  analyzeProject(project: ProjectInfo) {
    // 创建项目分析任务
    const task = this.agent.taskManager.createTask<ProjectInfo>({
      type: "ANALYZE_PROJECT",
      description: `分析项目 ${project.name}`,
      payload: project,
      callback: (project) => {
        console.log(
          `[分析师 ${this.agent.agentId}] 开始深入分析项目: ${project.name}`
        );

        // 保存项目信息
        this.analyzedProjects.set(project.projectId, project);

        // 使用agent的内部感知层通知自己生成报告
        this.agent.sensing.emitEvent({
          type: "INTERNAL_GENERATE_REPORT",
          payload: project,
          timestamp: Date.now(),
          description: `分析师内部流程: 为项目 ${project.name} 生成报告`,
        });

        return `开始分析项目: ${project.name}`;
      },
    }) as AnalysisTask;

    // 监听内部流程事件，生成报告
    const offReportListener = this.agent.sensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === "INTERNAL_GENERATE_REPORT") {
          const project = evt.payload as ProjectInfo;
          this.generateReport(project);
        }
      }
    );
    this.offListeners.push(offReportListener);
  }

  generateReport(project: ProjectInfo) {
    // 创建报告生成任务
    const task = this.agent.taskManager.createTask<ProjectInfo>({
      type: "GENERATE_REPORT",
      description: `为项目 ${project.name} 生成分析报告`,
      payload: project,
      callback: (project) => {
        console.log(
          `[分析师 ${this.agent.agentId}] 正在为项目 ${project.name} 生成分析报告`
        );

        // 根据项目信息生成分析结果
        const financialAnalysis = this.generateFinancialAnalysis(project);
        const marketAnalysis = this.generateMarketAnalysis(project);
        const riskAnalysis = this.generateRiskAnalysis(project);
        const recommendationScore = this.calculateRecommendationScore(project);

        // 创建分析报告
        const report: AnalysisReport = {
          projectId: project.projectId,
          analyst: this.agent.agentId,
          financialAnalysis,
          marketAnalysis,
          riskAnalysis,
          recommendationScore,
          timestamp: Date.now(),
        };

        // 保存报告
        this.generatedReports.set(project.projectId, report);

        // 发布报告完成事件
        this.agent.groupSensing.emitEvent({
          type: EVENT_TYPES.ANALYSIS_COMPLETED,
          payload: report,
          timestamp: Date.now(),
          description: `分析师 ${this.agent.agentId} 完成了项目 ${project.name} 的分析报告`,
        });

        return `成功生成项目 ${project.name} 的分析报告，评分: ${recommendationScore}/10`;
      },
    });
  }

  generateFinancialAnalysis(project: ProjectInfo): string {
    // 简化实现，根据项目信息生成模拟的财务分析
    const profitMargin = Math.floor(Math.random() * 30) + 5; // 5-35% 利润率
    const burnRate = Math.floor(Math.random() * 10) + 5; // 5-15个月 资金消耗

    if (
      project.fundingStage === "种子轮" ||
      project.fundingStage === "天使轮"
    ) {
      return `早期项目，尚无显著收入。月度消耗约${
        project.askingAmount / (burnRate * 10000)
      }万元，预计资金可维持${burnRate}个月。`;
    } else {
      const revenue = project.askingAmount * (0.5 + Math.random() * 1.5);
      return `年收入约${
        revenue / 10000
      }万元，毛利率${profitMargin}%，月度消耗约${
        project.askingAmount / (burnRate * 10000)
      }万元，预计融资可维持${burnRate}个月。`;
    }
  }

  generateMarketAnalysis(project: ProjectInfo): string {
    // 简化实现，根据行业生成市场分析
    const marketSizes = {
      人工智能: "全球AI市场规模预计2025年达到1900亿美元，年复合增长率42%。",
      清洁能源: "清洁能源市场预计2030年达到1.9万亿美元，政策支持强劲。",
      生物科技: "生物技术市场预计2025年达到7270亿美元，疫情后医疗需求增长。",
      金融科技: "金融科技市场预计2025年达到3050亿美元，传统银行转型加速。",
      电子商务: "电子商务市场持续增长，预计2025年全球交易额达到7.4万亿美元。",
    };

    const competitors = Math.floor(Math.random() * 20) + 3;
    const marketShare = Math.floor(Math.random() * 10) + 1;

    return `${
      marketSizes[project.industry as keyof typeof marketSizes] ||
      "该行业市场增长迅速。"
    } 行业内有约${competitors}家主要竞争对手，该项目有潜力获取${marketShare}%的市场份额。`;
  }

  generateRiskAnalysis(project: ProjectInfo): string {
    // 简化实现，生成风险分析
    const risks = [
      "技术开发不及预期",
      "市场接受度低于预期",
      "核心团队流失",
      "竞争对手快速跟进",
      "监管政策变化",
      "资金链断裂风险",
      "知识产权争议",
    ];

    // 随机选择2-3个风险
    const selectedRisks = [];
    const riskCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < riskCount; i++) {
      const randomIndex = Math.floor(Math.random() * risks.length);
      selectedRisks.push(risks[randomIndex]);
      risks.splice(randomIndex, 1);
    }

    return `主要风险: ${selectedRisks.join("; ")}。需要关注的是${
      selectedRisks[0]
    }。`;
  }

  calculateRecommendationScore(project: ProjectInfo): number {
    // 根据项目各方面情况计算推荐评分 (1-10分)
    let baseScore = 5; // 基础分

    // 行业加权
    const industryScores = {
      人工智能: 2,
      清洁能源: 1.5,
      生物科技: 1,
      金融科技: 0.5,
      电子商务: 0,
    };

    baseScore +=
      industryScores[project.industry as keyof typeof industryScores] || 0;

    // 融资阶段加权
    const stageScores = {
      种子轮: -1, // 风险较高
      天使轮: -0.5,
      A轮: 0,
      B轮: 0.5,
      C轮: 1, // 风险较低
    };

    baseScore +=
      stageScores[project.fundingStage as keyof typeof stageScores] || 0;

    // 随机因素 (-1 到 +1)
    baseScore += Math.random() * 2 - 1;

    // 确保分数在1-10之间
    return Math.max(1, Math.min(10, Math.round(baseScore)));
  }

  preparePresentationSupport(projectId: string, scheduledTime: number) {
    // 创建演示支持任务
    this.agent.taskManager.createTask({
      type: "PREPARE_PRESENTATION_SUPPORT",
      description: `准备协助项目 ${projectId} 的投资演示`,
      payload: {
        projectId,
        scheduledTime,
      },
      callback: (data) => {
        // 这里可以添加演示前的准备工作
        const timeUntilPresentation = data.scheduledTime - Date.now();

        if (timeUntilPresentation > 0) {
          console.log(
            `[分析师 ${this.agent.agentId}] 准备在${
              timeUntilPresentation / 1000
            }秒后协助项目 ` + `${data.projectId} 的投资演示`
          );
        } else {
          console.log(
            `[分析师 ${this.agent.agentId}] 项目 ${data.projectId} 的投资演示即将开始，` +
              `已准备好分析师支持材料`
          );
        }

        return `已准备好协助项目 ${data.projectId} 的投资演示`;
      },
    });
  }

  showStatus() {
    console.log(`\n[分析师 ${this.agent.agentId}] 状态报告:`);
    console.log(`- 已分析项目: ${this.analyzedProjects.size}`);
    console.log(`- 已生成报告: ${this.generatedReports.size}`);

    console.log("\n最近报告摘要:");

    // 获取最近5个报告
    const recentReports = Array.from(this.generatedReports.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    recentReports.forEach((report) => {
      const project = this.analyzedProjects.get(report.projectId);
      if (!project) return;

      console.log(`\n项目: ${project.name} (ID: ${report.projectId})`);
      console.log(`- 评分: ${report.recommendationScore}/10`);
      console.log(`- 财务分析: ${report.financialAnalysis}`);
      console.log(`- 市场分析: ${report.marketAnalysis}`);
      console.log(`- 风险分析: ${report.riskAnalysis}`);
    });
  }

  teardown() {
    this.offListeners.forEach((off) => off());
    console.log(`[分析师 ${this.agent.agentId}] 模块已关闭`);
  }
}

/**
 * 启用分析师模块
 */
export function enableAnalystModule(agent: Agent) {
  const module = new AnalystModule(agent);
  module.init();
  console.log(`[分析师模块] 已在Agent ${agent.agentId} 上启用`);

  return {
    showStatus: () => module.showStatus(),
    teardown: () => module.teardown(),
  };
}

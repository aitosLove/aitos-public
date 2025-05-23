import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";

// 投资决策载荷
export interface InvestmentDecisionPayload {
  projectId: string;
  projectName: string;
  industry: string;
  requestedFunding: number;
  partnerAgent: string;
  approved: boolean;
  reason: string;
  conditions?: string;
  decisionTime: number;
}

/**
 * 投资合伙人模块 - 负责做出最终投资决策
 */
class InvestmentPartnerModule {
  private agent: Agent;
  private offListeners: Array<() => void> = [];
  private decisions: InvestmentDecisionPayload[] = [];
  private pendingPresentations: Set<string> = new Set();

  constructor(agent: Agent) {
    this.agent = agent;
  }

  init() {
    console.log(`[合伙人-投资决策] 初始化，安装在Agent: ${this.agent.agentId}`);

    // 监听投资汇报准备完成事件
    const offPresentationReadyListener =
      this.agent.groupSensing.registerListener((evt: AgentEvent) => {
        if (evt.type === "PROJECT_PRESENTATION_READY") {
          console.log(
            `[合伙人 ${this.agent.agentId}] 收到项目汇报通知: ${evt.payload.projectName}`
          );

          // 添加到待审议列表
          this.pendingPresentations.add(evt.payload.projectId);

          // 评估项目并做出决策
          this.evaluateProject(evt.payload);
        }
      });

    this.offListeners.push(offPresentationReadyListener);
  }

  // 评估项目并做出决策
  evaluateProject(presentationData: any) {
    // 创建项目评估任务
    const task = this.agent.taskManager.createTask({
      type: "EVALUATE_INVESTMENT",
      description: `评估项目 ${presentationData.projectName} 的投资价值`,
      payload: presentationData,
      callback: (payload) => {
        console.log(
          `[合伙人 ${this.agent.agentId}] 正在评估项目: ${payload.projectName}`
        );

        // 模拟评估过程
        setTimeout(() => {
          // 基于推荐分数和随机因素做出决策
          const approved =
            payload.recommendationScore > 50 ||
            (payload.recommendationScore > 40 && Math.random() > 0.5);

          const decision: InvestmentDecisionPayload = {
            projectId: payload.projectId,
            projectName: payload.projectName,
            industry: payload.industry,
            requestedFunding: payload.requestedFunding || 5000000, // 默认值
            partnerAgent: this.agent.agentId,
            approved,
            reason: approved
              ? `项目符合我们的投资策略，${payload.recommendation}`
              : `项目风险较高，回报不确定，不符合当前投资方向`,
            conditions: approved ? "需在6个月内达成主要里程碑" : undefined,
            decisionTime: Date.now(),
          };

          // 从待审议列表中移除
          this.pendingPresentations.delete(payload.projectId);

          // 记录决策
          this.decisions.push(decision);

          // 发布投资决策
          this.agent.groupSensing.emitEvent({
            type: "INVESTMENT_DECISION",
            payload: decision,
            timestamp: Date.now(),
            description: `合伙人 ${this.agent.agentId} ${
              approved ? "批准" : "拒绝"
            }了项目 ${payload.projectName} 的投资`,
          });
        }, 15000); // 假设需要15秒做决策

        return `正在评估项目: ${payload.projectName}`;
      },
    });
  }

  showStatus() {
    console.log(`[合伙人 ${this.agent.agentId}] 状态:`);
    console.log(`- 已做出决策数: ${this.decisions.length}`);
    console.log(`- 待审议项目数: ${this.pendingPresentations.size}`);
    console.log(`- 最近决策:`);
    this.decisions.slice(-3).forEach((decision) => {
      console.log(
        `  项目: ${decision.projectName}, 决策: ${
          decision.approved ? "批准" : "拒绝"
        }, 原因: ${decision.reason}`
      );
    });
  }

  teardown() {
    this.offListeners.forEach((off) => off());
    console.log(`[合伙人-投资决策模块 ${this.agent.agentId}] 已关闭`);
  }
}

/**
 * 启用合伙人的投资决策模块
 */
export function enableInvestmentPartnerModule(agent: Agent) {
  const module = new InvestmentPartnerModule(agent);
  module.init();
  console.log(`[投资决策模块] 已在合伙人 ${agent.agentId} 上启用`);

  return {
    showStatus: () => module.showStatus(),
    teardown: () => module.teardown(),
  };
}

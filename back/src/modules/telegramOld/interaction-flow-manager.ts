/**
 * 交互流程管理器 - 管理复杂的用户交互流程
 */

import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";

export interface InteractionStep {
  id: string;
  type: "input" | "selection" | "confirmation" | "display";
  message: string;
  options?: string[];
  validation?: (input: string) => boolean;
  next?: string | ((input: string) => string | null) | null;
}

export interface InteractionFlow {
  id: string;
  name: string;
  description: string;
  steps: Map<string, InteractionStep>;
  startStep: string;
  onComplete?: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => Promise<void>;
}

export interface UserSession {
  userId: string;
  chatId: number;
  currentFlow?: string;
  currentStep?: string;
  data: Record<string, any>;
  lastActivity: number;
  isActive: boolean;
}

export class InteractionFlowManager {
  private agent: Agent;
  private botManager: EnhancedTelegramBotManager;
  private flows: Map<string, InteractionFlow> = new Map();
  private userSessions: Map<string, UserSession> = new Map();
  private sessionTimeout = 5 * 60 * 1000; // 5分钟会话超时

  constructor(agent: Agent, botManager: EnhancedTelegramBotManager) {
    this.agent = agent;
    this.botManager = botManager;
    this.setupDefaultFlows();
    this.setupSessionCleanup();
  }

  /**
   * 注册交互流程
   */
  public registerFlow(flow: InteractionFlow): void {
    this.flows.set(flow.id, flow);
    console.log(`[InteractionFlowManager] 注册交互流程: ${flow.name}`);
  }

  /**
   * 开始交互流程
   */
  public async startFlow(
    flowId: string, 
    userId: string, 
    chatId: number
  ): Promise<boolean> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      await this.botManager.sendMessageWithOptions(
        chatId,
        `❌ 未找到交互流程: ${flowId}`
      );
      return false;
    }

    // 创建或更新用户会话
    const session: UserSession = {
      userId,
      chatId,
      currentFlow: flowId,
      currentStep: flow.startStep,
      data: {},
      lastActivity: Date.now(),
      isActive: true,
    };

    this.userSessions.set(userId, session);

    // 开始第一步
    await this.executeStep(session, flow.startStep);
    return true;
  }

  /**
   * 处理用户输入
   */
  public async handleUserInput(
    userId: string, 
    input: string
  ): Promise<boolean> {
    const session = this.userSessions.get(userId);
    if (!session || !session.isActive || !session.currentFlow) {
      return false;
    }

    const flow = this.flows.get(session.currentFlow);
    if (!flow) {
      await this.cancelFlow(userId);
      return false;
    }

    const currentStep = flow.steps.get(session.currentStep!);
    if (!currentStep) {
      await this.cancelFlow(userId);
      return false;
    }

    // 更新活动时间
    session.lastActivity = Date.now();

    // 处理取消命令
    if (input.toLowerCase() === '/cancel' || input.toLowerCase() === '取消') {
      await this.cancelFlow(userId);
      return true;
    }

    // 验证输入
    if (currentStep.validation && !currentStep.validation(input)) {
      await this.botManager.sendMessageWithOptions(
        session.chatId,
        "❌ 输入格式不正确，请重新输入"
      );
      return true;
    }

    // 保存用户输入
    session.data[currentStep.id] = input;

    // 确定下一步
    let nextStepId: string | undefined;
    if (typeof currentStep.next === 'function') {
      const result = currentStep.next(input);
      nextStepId = result === null ? undefined : result;
    } else {
      nextStepId = currentStep.next === null ? undefined : currentStep.next;
    }

    if (nextStepId) {
      session.currentStep = nextStepId;
      await this.executeStep(session, nextStepId);
    } else {
      // 流程完成
      await this.completeFlow(session);
    }

    return true;
  }

  /**
   * 执行步骤
   */
  private async executeStep(session: UserSession, stepId: string): Promise<void> {
    const flow = this.flows.get(session.currentFlow!);
    if (!flow) return;

    const step = flow.steps.get(stepId);
    if (!step) return;

    // AI聊天流程的特殊处理
    if (flow.id === "ai_chat" && stepId === "process") {
      await this.handleAIChatProcess(session);
      return;
    }

    let message = step.message;
    
    // 替换变量
    message = this.replaceVariables(message, session.data);

    // 根据步骤类型发送消息
    switch (step.type) {
      case "selection":
        if (step.options) {
          const keyboard = {
            inline_keyboard: step.options.map((option, index) => [
              { text: option, callback_data: `flow_select_${index}` }
            ])
          };
          await this.botManager.sendMessageWithOptions(
            session.chatId,
            message,
            { reply_markup: keyboard }
          );
        }
        break;
      
      case "confirmation":
        const confirmKeyboard = {
          inline_keyboard: [
            [
              { text: "✅ 确认", callback_data: "flow_confirm_yes" },
              { text: "❌ 取消", callback_data: "flow_confirm_no" }
            ]
          ]
        };
        await this.botManager.sendMessageWithOptions(
          session.chatId,
          message,
          { reply_markup: confirmKeyboard }
        );
        break;

      default:
        await this.botManager.sendMessageWithOptions(session.chatId, message);
        break;
    }
  }

  /**
   * 处理 AI 聊天流程的 process 步骤
   */
  private async handleAIChatProcess(session: UserSession): Promise<void> {
    try {
      // 获取用户消息
      const userMessage = session.data.start || session.data.response;
      if (!userMessage) {
        await this.botManager.sendMessageWithOptions(
          session.chatId,
          "❌ 无法处理空消息"
        );
        return;
      }
      
      // 显示正在输入状态
      await this.botManager.sendChatAction(session.chatId, "typing");
      
      // 导入统一 AI 客户端
      const { aiClient } = await import('./ai-client');
      
      if (!aiClient) {
        throw new Error('AI 客户端未初始化');
      }
      
      console.log("[InteractionFlow] AI聊天处理中:", userMessage);
      
      // 记录请求开始时间
      const startTime = Date.now();
      
      // 从会话历史中提取对话上下文
      const conversationHistory = session.data.history || [];
      
      // 准备上下文消息
      const messages = [
        { 
          role: 'system', 
          content: '你是一个加密货币和投资方面的专业顾问。提供清晰、简洁且有见地的回答，尤其是关于市场分析、投资策略和风险管理的问题。'
        }
      ];
      
      // 添加历史消息
      if (conversationHistory.length > 0) {
        // 只取最近的几条对话记录
        const recentHistory = conversationHistory.slice(-4); 
        messages.push(...recentHistory);
      }
      
      // 添加当前用户消息
      messages.push({ role: 'user', content: userMessage });
      
      // 调用统一 AI 客户端
      const response = await aiClient.chat.completions.create({
        messages,
        model: process.env.TELEGRAM_CHAT_AI_ENDPOINT,
        temperature: 0.7,
        max_tokens: 800
      });
      
      // 计算响应时间
      const responseTime = Date.now() - startTime;
      console.log(`[InteractionFlow] AI 响应时间: ${responseTime}ms`);
      
      // 提取 AI 回复
      const aiResponse = response.choices?.[0]?.message?.content || "抱歉，我无法生成回复。";
      
      // 更新会话历史
      if (!session.data.history) {
        session.data.history = [];
      }
      
      // 添加用户消息和AI回复到历史
      session.data.history.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      );
      
      // 限制历史长度
      if (session.data.history.length > 10) {
        session.data.history = session.data.history.slice(-10);
      }
      
      // 保存结果并进入下一步
      session.data.aiResponse = aiResponse;
      session.data.responseTime = responseTime;
      session.currentStep = "response";
      
      // 执行响应步骤
      await this.executeStep(session, "response");
      
    } catch (error) {
      console.error("[InteractionFlow] AI聊天处理失败:", error);
      
      // 发送错误消息
      await this.botManager.sendMessageWithOptions(
        session.chatId,
        "❌ 处理您的请求时出现错误，请稍后再试。"
      );
      
      // 重新开始对话
      session.currentStep = "start";
      await this.executeStep(session, "start");
    }
  }

  /**
   * 取消流程
   */
  private async cancelFlow(userId: string): Promise<void> {
    const session = this.userSessions.get(userId);
    if (!session) return;

    const flow = this.flows.get(session.currentFlow!);
    if (flow?.onCancel) {
      await flow.onCancel();
    }

    session.isActive = false;
    await this.botManager.sendMessageWithOptions(
      session.chatId,
      "🚫 交互流程已取消"
    );
  }

  /**
   * 完成流程
   */
  private async completeFlow(session: UserSession): Promise<void> {
    const flow = this.flows.get(session.currentFlow!);
    if (flow?.onComplete) {
      await flow.onComplete(session.data);
    }

    session.isActive = false;
    await this.botManager.sendMessageWithOptions(
      session.chatId,
      "✅ 交互流程已完成"
    );
  }

  /**
   * 替换消息中的变量
   */
  private replaceVariables(message: string, data: Record<string, any>): string {
    return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * 设置默认交互流程
   */
  private setupDefaultFlows(): void {
    // AI对话流程
    this.registerFlow({
      id: "ai_chat",
      name: "AI智能对话",
      description: "与AI进行深度对话",
      steps: new Map([
        ["start", {
          id: "start",
          type: "input",
          message: "🤖 **AI对话模式**\n\n请输入您的问题，我会为您提供详细的分析和建议。\n\n💡 提示：输入 /cancel 可随时退出",
          next: "process"
        }],
        ["process", {
          id: "process",
          type: "display",
          message: "🤔 正在思考中...",
          next: "response"
        }],
        ["response", {
          id: "response",
          type: "input",
          message: "{{aiResponse}}\n\n---\n\n继续提问或输入 /cancel 退出",
          next: "process"
        }]
      ]),
      startStep: "start",
      onComplete: async (data) => {
        console.log("[InteractionFlow] AI对话完成:", data);
      }
    });

    // 投资组合分析流程
    this.registerFlow({
      id: "portfolio_analysis",
      name: "投资组合分析",
      description: "分析您的投资组合",
      steps: new Map([
        ["start", {
          id: "start",
          type: "input",
          message: "📊 **投资组合分析**\n\n请输入您想要分析的代币符号（如：BTC,ETH,SOL）",
          validation: (input: string) => /^[A-Za-z,\s]+$/.test(input),
          next: "confirm"
        }],
        ["confirm", {
          id: "confirm",
          type: "confirmation",
          message: "确认分析以下代币：{{start}}\n\n这可能需要几分钟时间。",
          next: (input: string) => input === "yes" ? "analyze" : null
        }],
        ["analyze", {
          id: "analyze",
          type: "display",
          message: "🔍 正在分析投资组合...",
          next: null
        }]
      ]),
      startStep: "start",
      onComplete: async (data) => {
        // 这里调用实际的投资组合分析逻辑
        console.log("[InteractionFlow] 投资组合分析:", data.start);
      }
    });

    // 市场调研流程
    this.registerFlow({
      id: "market_research",
      name: "市场调研",
      description: "深度市场调研",
      steps: new Map([
        ["start", {
          id: "start",
          type: "selection",
          message: "🔍 **市场调研**\n\n请选择调研类型：",
          options: ["代币分析", "DeFi协议研究", "市场趋势分析", "风险评估"],
          next: "topic"
        }],
        ["topic", {
          id: "topic",
          type: "input",
          message: "请输入具体的调研主题或代币名称：",
          next: "confirm"
        }],
        ["confirm", {
          id: "confirm",
          type: "confirmation",
          message: "确认进行 {{start}} - {{topic}} 的深度调研？",
          next: (input: string) => input === "yes" ? "research" : null
        }],
        ["research", {
          id: "research",
          type: "display",
          message: "📈 正在进行深度调研，预计需要2-3分钟...",
          next: null
        }]
      ]),
      startStep: "start",
      onComplete: async (data) => {
        // 这里调用实际的市场调研逻辑
        console.log("[InteractionFlow] 市场调研:", data);
      }
    });
  }

  /**
   * 设置会话清理
   */
  private setupSessionCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [userId, session] of this.userSessions.entries()) {
        if (now - session.lastActivity > this.sessionTimeout) {
          this.userSessions.delete(userId);
          console.log(`[InteractionFlowManager] 清理过期会话: ${userId}`);
        }
      }
    }, 60 * 1000); // 每分钟检查一次
  }

  /**
   * 获取用户会话状态
   */
  public getUserSession(userId: string): UserSession | undefined {
    return this.userSessions.get(userId);
  }

  /**
   * 获取所有活跃流程
   */
  public getAvailableFlows(): InteractionFlow[] {
    return Array.from(this.flows.values());
  }
}

/**
 * 增强的TG模块管理器 - 重新组织后的完整版本
 */

import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
import { NotificationManager } from "./notification-manager";
import { InteractiveCommands } from "./interactive-commands";
import { InteractionFlowManager } from "./interaction-flow-manager";
import { ContextManager } from "./context-manager";
import { db } from "@/db";

interface TGModuleConfig {
  enableNotifications: boolean;
  enableInteractiveCommands: boolean;
  enableInteractionFlows: boolean;
  enableContextManagement: boolean;
  autoStartBot: boolean;
  debugMode: boolean;
  aiChatEnabled: boolean;
}

export class EnhancedTelegramModule {
  private static instance: EnhancedTelegramModule | null = null;
  private readonly agent: Agent;
  private readonly botManager: EnhancedTelegramBotManager;
  private readonly contextManager: ContextManager;
  private readonly notificationManager: NotificationManager;
  private readonly interactiveCommands: InteractiveCommands;
  private readonly interactionFlowManager: InteractionFlowManager;
  private readonly config: TGModuleConfig;
  private isInitialized: boolean = false;

  private constructor(agent: Agent, config: Partial<TGModuleConfig> = {}) {
    this.agent = agent;
    this.config = {
      enableNotifications: true,
      enableInteractiveCommands: true,
      enableInteractionFlows: true,
      enableContextManagement: true,
      autoStartBot: true,
      debugMode: false,
      aiChatEnabled: true,
      ...config,
    };

    // 初始化核心组件
    this.botManager = EnhancedTelegramBotManager.getInstance();
    this.contextManager = new ContextManager(agent, this.botManager);
    this.notificationManager = new NotificationManager(agent, this.botManager);
    this.interactiveCommands = new InteractiveCommands(agent, this.botManager);
    this.interactionFlowManager = new InteractionFlowManager(agent, this.botManager);
  }

  // Updated event emission
  private emitStatusEvent(status: 'ready' | 'available'): void {
    this.agent.sensing.emitEvent({
      type: 'TG_MODULE_STATUS',
      description: `Enhanced Telegram Module is ${status}`,
      payload: { 
        moduleId: 'enhanced-tg',
        status: status,
        config: this.config 
      },
      timestamp: Date.now()
    });
  }

  public static getInstance(
    agent?: Agent, 
    config?: Partial<TGModuleConfig>
  ): EnhancedTelegramModule {
    if (!EnhancedTelegramModule.instance && agent) {
      EnhancedTelegramModule.instance = new EnhancedTelegramModule(agent, config);
    }
    
    if (!EnhancedTelegramModule.instance) {
      throw new Error("EnhancedTelegramModule not initialized. Please provide an agent.");
    }
    
    return EnhancedTelegramModule.instance;
  }

  /**
   * 初始化增强版TG模块
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("[EnhancedTelegramModule] 模块已经初始化过了");
      return;
    }

    try {
      console.log("[EnhancedTelegramModule] 开始初始化增强版Telegram模块");

      // 1. 初始化bot manager
      if (this.config.autoStartBot) {
        await this.botManager.initializeBot(this.agent);
        console.log("[EnhancedTelegramModule] Bot manager 初始化完成");
      }

      // 2. 初始化上下文管理器
      if (this.config.enableContextManagement) {
        // ContextManager 无需特殊初始化
        console.log("[EnhancedTelegramModule] 上下文管理器就绪");
      }

      // 3. 初始化通知管理器
      if (this.config.enableNotifications) {
        this.notificationManager.initialize();
        console.log("[EnhancedTelegramModule] 通知管理器初始化完成");
      }

      // 4. 初始化交互命令
      if (this.config.enableInteractiveCommands) {
        this.interactiveCommands.initialize();
        console.log("[EnhancedTelegramModule] 交互命令初始化完成");
      }

      // 5. 初始化交互流程管理器
      if (this.config.enableInteractionFlows) {
        // InteractionFlowManager 无需特殊初始化，在构造时已注册默认流程
        console.log("[EnhancedTelegramModule] 交互流程管理器就绪");
      }

      // 6. 设置模块级事件监听
      this.setupModuleEventListeners();

      // 7. 设置智能消息处理
      this.setupIntelligentMessageHandling();

      // 8. 发送启动通知
      await this.sendStartupNotification();

      this.isInitialized = true;
      console.log("[EnhancedTelegramModule] 🎉 增强版Telegram模块初始化完成");
      
      // 发出模块就绪事件
      this.agent.sensing.emitEvent({
        type: "ENHANCED_TG_MODULE_READY",
        description: "Enhanced Telegram Module has been initialized and is ready for use",
        payload: { moduleId: "enhanced-tg" },
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error("[EnhancedTelegramModule] 初始化失败:", error);
      throw error;
    }
  }

  /**
   * 设置模块级事件监听
   */
  private setupModuleEventListeners(): void {
    // 监听agent启动事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "AGENT_STARTED") {
        this.handleAgentStarted(evt.payload);
      }
    });

    // 监听agent关闭事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "AGENT_STOPPING") {
        this.handleAgentStopping(evt.payload);
      }
    });

    // 监听错误事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "AGENT_ERROR") {
        this.handleAgentError(evt.payload);
      }
    });

    // 监听重要系统事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (["SYSTEM_HEALTH_CHECK", "CRITICAL_ERROR", "MODULE_RESTART"].includes(evt.type)) {
        this.handleSystemEvent(evt);
      }
    });

    // 监听模块检测事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "CHECK_ENHANCED_TG_MODULE") {
        if (this.isInitialized) {
          this.agent.sensing.emitEvent({
            type: "ENHANCED_TG_MODULE_AVAILABLE",
            description: "Enhanced TG module is already initialized and available",
            payload: { moduleId: "enhanced-tg" },
            timestamp: Date.now()
          });
        }
      }
    });
  }

  /**
   * 设置智能消息处理
   */
  private setupIntelligentMessageHandling(): void {
    if (!this.botManager.bot) return;

    // 处理所有用户消息，进行智能分析和路由
    this.botManager.bot.on("message", async (msg: any) => {
      if (!msg.text || msg.text.startsWith("/")) return; // 跳过命令

      const userId = msg.from?.id.toString() || "unknown";
      const chatId = msg.chat.id;

      try {
        // 1. 获取或创建用户上下文
        const context = await this.contextManager.getOrCreateContext(userId, chatId);

        // 2. 添加用户消息到上下文
        await this.contextManager.addMessage(userId, {
          role: "user",
          content: msg.text,
          messageType: "text"
        });

        // 3. 检查是否在交互流程中
        if (this.config.enableInteractionFlows) {
          const handled = await this.interactionFlowManager.handleUserInput(userId, msg.text);
          if (handled) return; // 交互流程处理了消息，无需继续
        }

        // 4. 分析用户意图
        const intent = await this.contextManager.analyzeUserIntent(userId, msg.text);
        
        // 5. 生成智能回复
        if (this.config.aiChatEnabled && intent.intent === "general_chat") {
          await this.handleAIChat(userId, chatId, msg.text, context);
        } else {
          // 基于意图提供建议
          await this.handleIntentBasedResponse(userId, chatId, intent);
        }

      } catch (error) {
        console.error("[EnhancedTelegramModule] 智能消息处理失败:", error);
        await this.botManager.sendMessageWithOptions(
          chatId,
          "抱歉，消息处理遇到问题，请稍后再试。"
        );
      }
    });

    // 处理回调查询（内联键盘点击）
    this.botManager.bot.on("callback_query", async (query: any) => {
      const userId = query.from.id.toString();
      const data = query.data || "";

      try {
        if (data.startsWith("flow_")) {
          // 交互流程相关的回调
          await this.handleFlowCallback(userId, data, query);
        } else {
          // 其他回调处理
          await this.handleGeneralCallback(userId, data, query);
        }
      } catch (error) {
        console.error("[EnhancedTelegramModule] 回调处理失败:", error);
      }
    });
  }

  /**
   * 处理AI聊天
   */
  private async handleAIChat(
    userId: string,
    chatId: number,
    message: string,
    context: any
  ): Promise<void> {
    // 显示正在输入状态
    await this.botManager.sendChatAction(chatId, "typing");

    try {
      // 获取对话历史
      const history = this.contextManager.getConversationHistory(userId, 5);
      
      // 这里应该调用AI服务生成回复
      // 暂时使用简单的回复
      const aiResponse = await this.generateAIResponse(message, history);
      
      // 个性化回复
      const personalizedResponse = this.contextManager.generatePersonalizedResponse(
        userId, 
        aiResponse
      );

      // 添加AI回复到上下文
      await this.contextManager.addMessage(userId, {
        role: "assistant",
        content: personalizedResponse,
        messageType: "text"
      });

      await this.botManager.sendMessageWithOptions(chatId, personalizedResponse);

    } catch (error) {
      console.error("[EnhancedTelegramModule] AI聊天失败:", error);
      await this.botManager.sendMessageWithOptions(
        chatId,
        "抱歉，AI暂时无法回复，请稍后再试。"
      );
    }
  }

  /**
   * 生成AI回复（简单实现）
   */
  private async generateAIResponse(
    message: string, 
    history: any[]
  ): Promise<string> {
    // 这里应该集成真正的AI服务
    // 暂时返回一个智能的默认回复
    
    const responses = [
      "很有趣的问题！基于当前市场情况，我建议您关注风险管理。",
      "从技术分析角度来看，这是一个值得深入研究的话题。",
      "根据您的问题，我推荐您查看最新的市场洞察报告。",
      "这确实是一个复杂的问题，让我为您分析一下相关因素。"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 处理基于意图的回复
   */
  private async handleIntentBasedResponse(
    userId: string,
    chatId: number,
    intent: any
  ): Promise<void> {
    let response = "";
    let buttons: any[] = [];

    switch (intent.intent) {
      case "market_analysis":
        response = "📊 **市场分析请求**\n\n我来为您提供市场分析服务。";
        buttons = [
          [{ text: "📈 技术分析", callback_data: "cmd_analysis" }],
          [{ text: "📊 市场概况", callback_data: "cmd_market" }],
          [{ text: "💰 价格查询", callback_data: "cmd_price" }]
        ];
        break;

      case "portfolio_help":
        response = "💼 **投资组合服务**\n\n让我帮您管理和优化投资组合。";
        buttons = [
          [{ text: "📋 查看持仓", callback_data: "cmd_portfolio" }],
          [{ text: "⚖️ 风险分析", callback_data: "cmd_risk" }],
          [{ text: "💡 投资建议", callback_data: "cmd_suggestions" }]
        ];
        break;

      case "news_inquiry":
        response = "📰 **资讯服务**\n\n为您提供最新的加密货币资讯。";
        buttons = [
          [{ text: "🔥 热门新闻", callback_data: "cmd_news" }],
          [{ text: "🧠 AI洞察", callback_data: "cmd_insights" }],
          [{ text: "🔍 深度研究", callback_data: "cmd_research" }]
        ];
        break;

      default:
        response = "🤖 **我可以为您提供以下服务：**\n\n";
        response += intent.suggestedActions.map((action: string) => 
          `• ${action} - 使用此命令获取相关信息`
        ).join("\n");
        
        if (intent.suggestedActions.length === 0) {
          response += "使用 /help 查看所有可用命令";
        }
        break;
    }

    // 发送回复
    const replyOptions: any = { parse_mode: "Markdown" };
    if (buttons.length > 0) {
      replyOptions.reply_markup = { inline_keyboard: buttons };
    }

    await this.botManager.sendMessageWithOptions(chatId, response, replyOptions);
  }

  /**
   * 处理交互流程回调
   */
  private async handleFlowCallback(
    userId: string,
    data: string,
    query: any
  ): Promise<void> {
    if (data === "flow_confirm_yes") {
      await this.interactionFlowManager.handleUserInput(userId, "yes");
    } else if (data === "flow_confirm_no") {
      await this.interactionFlowManager.handleUserInput(userId, "no");
    } else if (data.startsWith("flow_select_")) {
      const index = parseInt(data.split("_")[2]);
      // 获取选项并处理
      await this.interactionFlowManager.handleUserInput(userId, index.toString());
    }

    // 确认回调
    await this.botManager.bot?.answerCallbackQuery(query.id);
  }

  /**
   * 处理一般回调
   */
  private async handleGeneralCallback(
    userId: string,
    data: string,
    query: any
  ): Promise<void> {
    // 处理命令回调
    if (data.startsWith("cmd_")) {
      const command = data.replace("cmd_", "");
      // 模拟命令执行
      await this.botManager.sendMessageWithOptions(
        query.message.chat.id,
        `正在执行: /${command}`
      );
    }

    await this.botManager.bot?.answerCallbackQuery(query.id);
  }

  /**
   * 处理agent启动事件
   */
  private async handleAgentStarted(payload: any): Promise<void> {
    if (this.config.debugMode) {
      await this.notificationManager.sendSystemAlert(
        `🤖 Agent 已启动\n` +
        `📊 时间: ${new Date().toLocaleString("zh-CN")}\n` +
        `🔧 配置: 通知=${this.config.enableNotifications}, 命令=${this.config.enableInteractiveCommands}, 流程=${this.config.enableInteractionFlows}`
      );
    }
  }

  /**
   * 处理agent停止事件
   */
  private async handleAgentStopping(payload: any): Promise<void> {
    await this.notificationManager.sendSystemAlert(
      `⚠️ Agent 正在关闭\n` +
      `📊 时间: ${new Date().toLocaleString("zh-CN")}\n` +
      `💾 正在保存状态...`
    );
  }

  /**
   * 处理agent错误事件
   */
  private async handleAgentError(payload: any): Promise<void> {
    const errorMessage = payload.error || "未知错误";
    await this.notificationManager.sendSystemAlert(
      `🚨 Agent错误报告\n\n` +
      `❌ **错误类型**: ${payload.type || "系统错误"}\n` +
      `📝 **错误描述**: ${errorMessage}\n` +
      `🕒 **时间**: ${new Date().toLocaleString("zh-CN")}\n\n` +
      `🔧 使用 /status 查看系统状态`
    );
  }

  /**
   * 处理系统事件
   */
  private async handleSystemEvent(evt: AgentEvent): Promise<void> {
    if (!this.config.debugMode) return;

    const eventMessages: Record<string, string> = {
      "SYSTEM_HEALTH_CHECK": "💊 系统健康检查完成",
      "CRITICAL_ERROR": "🚨 检测到严重错误",
      "MODULE_RESTART": "🔄 模块重启完成",
    };

    const message = eventMessages[evt.type] || `📢 系统事件: ${evt.type}`;
    await this.notificationManager.sendSystemAlert(
      `${message}\n` +
      `📊 时间: ${new Date().toLocaleString("zh-CN")}\n` +
      `📝 描述: ${evt.description}`
    );
  }

  /**
   * 发送启动通知
   */
  private async sendStartupNotification(): Promise<void> {
    const startupMessage = 
      `🚀 **Wonderland Enhanced Agent 已启动**\n\n` +
      `🤖 **Agent**: ${this.agent.name || "Wonderland-AI"}\n` +
      `📊 **启动时间**: ${new Date().toLocaleString("zh-CN")}\n\n` +
      `✅ **已启用功能**:\n` +
      `${this.config.enableNotifications ? "📢" : "❌"} 智能通知推送\n` +
      `${this.config.enableInteractiveCommands ? "💬" : "❌"} 交互式命令\n` +
      `${this.config.enableInteractionFlows ? "🔄" : "❌"} 交互流程管理\n` +
      `${this.config.enableContextManagement ? "🧠" : "❌"} 上下文记忆\n` +
      `${this.config.aiChatEnabled ? "🤖" : "❌"} AI智能对话\n\n` +
      `💡 输入任何消息开始对话，或使用 /help 查看命令\n` +
      `📊 输入 /status 查看系统状态`;

    await this.botManager.sendMessageWithOptions(
      this.botManager.getChatId(),
      startupMessage,
      { parse_mode: "Markdown" }
    );
  }

  /**
   * 优雅关闭
   */
  public async shutdown(): Promise<void> {
    console.log("[EnhancedTelegramModule] 开始关闭模块...");
    
    try {
      // 发送关闭通知
      await this.notificationManager.sendSystemAlert(
        "🔄 **系统正在关闭**\n\n" +
        "所有服务将在片刻后停止。\n" +
        "感谢您的使用！"
      );

      // 停止bot polling
      if (this.botManager.bot) {
        await this.botManager.bot.stopPolling();
      }

      this.isInitialized = false;
      console.log("[EnhancedTelegramModule] 模块已关闭");
      
    } catch (error) {
      console.error("[EnhancedTelegramModule] 关闭时出错:", error);
    }
  }

  /**
   * 获取模块状态
   */
  public getModuleStatus(): {
    isInitialized: boolean;
    config: TGModuleConfig;
    contextStats: any;
  } {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      contextStats: this.contextManager.getContextStats()
    };
  }

  // Getter methods
  public getBotManager(): EnhancedTelegramBotManager {
    return this.botManager;
  }

  public getNotificationManager(): NotificationManager {
    return this.notificationManager;
  }

  public getInteractiveCommands(): InteractiveCommands {
    return this.interactiveCommands;
  }

  public getInteractionFlowManager(): InteractionFlowManager {
    return this.interactionFlowManager;
  }

  public getContextManager(): ContextManager {
    return this.contextManager;
  }
}

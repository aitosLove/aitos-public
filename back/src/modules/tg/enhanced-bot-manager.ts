import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import {
  getContentInsightsByAgent,
  getRecentPerplexitySearches,
} from "../contentProcess/ContentDbOp";

// 增强的命令处理器接口
interface EnhancedCommandHandler {
  command: string;
  description: string;
  category: "crypto" | "content" | "portfolio" | "system" | "ai";
  permissions?: string[];
  cooldown?: number; // 冷却时间（秒）
  handler: (
    msg: TelegramBot.Message,
    args?: string,
    context?: CommandContext
  ) => Promise<void>;
}

// 命令执行上下文
interface CommandContext {
  agent: Agent;
  agentId: string;
  userId: string;
  lastCommand?: string;
  conversationHistory: ConversationMessage[];
}

// 对话消息
interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  messageId?: number;
}

// 用户会话数据
interface UserSession {
  userId: string;
  conversationHistory: ConversationMessage[];
  lastActivity: number;
  preferences: UserPreferences;
  activeCommands: Set<string>;
}

// 用户偏好设置
interface UserPreferences {
  language: "en" | "zh" | "auto";
  notificationLevel: "all" | "important" | "none";
  cryptoWatchlist: string[];
  defaultCurrency: "USD" | "CNY" | "EUR";
  timezone: string;
}

export class EnhancedTelegramBotManager {
  private static instance: EnhancedTelegramBotManager;
  public bot: TelegramBot | null = null;
  private chatId: string;
  private token: string;
  private commandHandlers: Map<string, EnhancedCommandHandler> = new Map();
  private userSessions: Map<string, UserSession> = new Map();
  private commandCooldowns: Map<string, number> = new Map();
  private agent: Agent | null = null;

  private constructor() {
    this.token = process.env.TELEGRAM_TOKEN!;
    this.chatId = process.env.USER_CHAT_ID!;
    this.validateConfig();
  }

  public static getInstance(): EnhancedTelegramBotManager {
    if (!EnhancedTelegramBotManager.instance) {
      EnhancedTelegramBotManager.instance = new EnhancedTelegramBotManager();
    }
    return EnhancedTelegramBotManager.instance;
  }

  private validateConfig() {
    if (!this.token || !this.chatId) {
      throw new Error(
        "Missing Telegram config. Required ENV vars: TELEGRAM_TOKEN, USER_CHAT_ID"
      );
    }
  }

  public async initializeBot(agent: Agent): Promise<TelegramBot> {
    if (!this.bot) {
      this.agent = agent;
      
      this.bot = new TelegramBot(this.token, {
        polling: true,
      });

      // 设置错误处理
      this.bot.on("polling_error", (error) => {
        console.error("[Telegram] Polling error:", error);
      });

      // 注册系统监听器
      this.registerSystemListeners(agent);
      
      // 注册增强的默认命令
      await this.registerEnhancedCommands(agent);
      
      // 注册消息处理器
      this.registerMessageHandler(agent);
      
      // 启动会话清理任务
      this.startSessionCleanup();

      console.log("🤖 Enhanced Telegram Bot initialized successfully!");
    }
    return this.bot;
  }

  private registerSystemListeners(agent: Agent) {
    // 监听内容洞察事件
    agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "CONTENT_INSIGHT_AVAILABLE_EVENT") {
        this.handleContentInsightEvent(evt);
      }
    });

    // 监听深度搜索完成事件
    agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "PERPLEXITY_SEARCH_COMPLETED_EVENT") {
        this.handleSearchCompletedEvent(evt);
      }
    });

    // 监听投资组合更新事件
    agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "PORTFOLIO_UPDATED_EVENT") {
        this.handlePortfolioUpdateEvent(evt);
      }
    });
  }

  private async registerEnhancedCommands(agent: Agent) {
    // AI 聊天命令 - 使用上下文记忆
    this.registerCommand({
      command: "chat",
      description: "💬 与 AI 助手聊天（支持上下文记忆）",
      category: "ai",
      handler: async (msg, args, context) => {
        if (!args) {
          await this.sendFormattedMessage(
            msg.chat.id,
            "💬 请提供您想要聊天的内容\n\n例如：`/chat 比特币今天的走势如何？`",
            { parse_mode: "Markdown" }
          );
          return;
        }

        // 显示正在输入状态
        await this.bot!.sendChatAction(msg.chat.id, "typing");

        const session = this.getOrCreateSession(msg.from!.id.toString());
        
        // 添加用户消息到历史
        session.conversationHistory.push({
          role: "user",
          content: args,
          timestamp: Date.now(),
          messageId: msg.message_id,
        });

        try {
          // 构建上下文提示
          const contextPrompt = this.buildContextPrompt(session, context!);
          
          const response = await agent.thinking.response({
            input: args,
            model: "large",
            platform: "qwen",
            systemPrompt: contextPrompt,
          });

          // 添加助手回复到历史
          session.conversationHistory.push({
            role: "assistant",
            content: response,
            timestamp: Date.now(),
          });

          // 限制历史记录长度
          if (session.conversationHistory.length > 20) {
            session.conversationHistory = session.conversationHistory.slice(-10);
          }

          await this.sendFormattedMessage(msg.chat.id, response);
        } catch (error) {
          console.error("[Telegram] Chat error:", error);
          await this.sendErrorMessage(
            msg.chat.id,
            "抱歉，处理您的消息时出现了错误，请稍后再试。"
          );
        }
      },
    });

    // 内容洞察命令
    this.registerCommand({
      command: "insights",
      description: "📊 获取最新的内容洞察分析",
      category: "content",
      cooldown: 30,
      handler: async (msg, args, context) => {
        await this.bot!.sendChatAction(msg.chat.id, "typing");

        try {
          const insights = await getContentInsightsByAgent(context!.agentId, 5);
          
          if (insights.length === 0) {
            await this.sendFormattedMessage(
              msg.chat.id,
              "📊 暂无内容洞察数据\n\n请等待系统收集和分析更多内容。"
            );
            return;
          }

          let response = "📊 **最新内容洞察**\n\n";
          
          insights.forEach((insight, index) => {
            const date = new Date(insight.createdAt).toLocaleDateString("zh-CN");
            const hasValue = insight.hasValue ? "🟢 有价值" : "🔴 无价值";
            
            response += `**${index + 1}. ${insight.username}**\n`;
            response += `${hasValue} | ${insight.category}\n`;
            response += `📝 ${insight.summary}\n`;
            
            if (insight.entity) {
              response += `🏷️ 实体: ${insight.entity}\n`;
            }
            
            if (insight.event) {
              response += `📅 事件: ${insight.event}\n`;
            }
            
            response += `🕒 ${date}\n\n`;
          });

          await this.sendFormattedMessage(msg.chat.id, response, {
            parse_mode: "Markdown",
          });
        } catch (error) {
          console.error("[Telegram] Insights error:", error);
          await this.sendErrorMessage(msg.chat.id, "获取内容洞察时出现错误");
        }
      },
    });

    // 深度搜索结果命令
    this.registerCommand({
      command: "research",
      description: "🔍 查看最新的深度研究结果",
      category: "content",
      cooldown: 30,
      handler: async (msg, args, context) => {
        await this.bot!.sendChatAction(msg.chat.id, "typing");

        try {
          const searches = await getRecentPerplexitySearches(context!.agentId, 3);
          
          if (searches.length === 0) {
            await this.sendFormattedMessage(
              msg.chat.id,
              "🔍 暂无深度研究数据\n\n系统会自动对有价值的内容进行深度研究。"
            );
            return;
          }

          for (const search of searches) {
            const date = new Date(search.metadata.timestamp).toLocaleString("zh-CN");
            
            let response = `🔍 **深度研究报告**\n\n`;
            response += `**查询:** ${search.query}\n\n`;
            response += `**分析结果:**\n${search.response}\n\n`;
            
            if (search.citations.length > 0) {
              response += `**参考来源:**\n`;
              search.citations.forEach((citation, index) => {
                response += `${index + 1}. [${citation.title}](${citation.url})\n`;
              });
              response += `\n`;
            }
            
            response += `🤖 ${search.metadata.model} | ⏱️ ${date}\n`;
            response += `📊 令牌: ${search.metadata.usage.total_tokens}`;

            await this.sendFormattedMessage(msg.chat.id, response, {
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            });
          }
        } catch (error) {
          console.error("[Telegram] Research error:", error);
          await this.sendErrorMessage(msg.chat.id, "获取研究结果时出现错误");
        }
      },
    });

    // 系统状态命令
    this.registerCommand({
      command: "status",
      description: "⚡ 查看系统运行状态",
      category: "system",
      handler: async (msg, args, context) => {
        const session = this.getOrCreateSession(msg.from!.id.toString());
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);

        let response = `⚡ **系统状态报告**\n\n`;
        response += `🤖 Agent ID: \`${context!.agentId}\`\n`;
        response += `👤 用户 ID: \`${context!.userId}\`\n`;
        response += `⏱️ 运行时间: ${uptimeHours}h ${uptimeMinutes}m\n`;
        response += `💬 对话历史: ${session.conversationHistory.length} 条\n`;
        response += `🔧 注册命令: ${this.commandHandlers.size} 个\n`;
        response += `👥 活跃会话: ${this.userSessions.size} 个\n\n`;
        
        response += `**模块状态:**\n`;
        response += `✅ 内容处理模块\n`;
        response += `✅ 深度搜索模块\n`;
        response += `✅ Telegram 机器人\n`;

        await this.sendFormattedMessage(msg.chat.id, response, {
          parse_mode: "Markdown",
        });
      },
    });

    // 帮助命令（按分类显示）
    this.registerCommand({
      command: "help",
      description: "❓ 显示所有可用命令",
      category: "system",
      handler: async (msg) => {
        const categories = {
          ai: "🤖 AI 助手",
          content: "📊 内容分析",
          crypto: "💰 加密货币",
          portfolio: "📈 投资组合",
          system: "⚙️ 系统功能",
        };

        let response = "🤖 **命令帮助菜单**\n\n";

        for (const [categoryKey, categoryName] of Object.entries(categories)) {
          const categoryCommands = Array.from(this.commandHandlers.values())
            .filter((cmd) => cmd.category === categoryKey);

          if (categoryCommands.length > 0) {
            response += `**${categoryName}**\n`;
            categoryCommands.forEach((cmd) => {
              response += `/${cmd.command} - ${cmd.description}\n`;
            });
            response += `\n`;
          }
        }

        response += `💡 **提示:** 使用 \`/chat\` 命令可以与 AI 助手进行自然对话`;

        await this.sendFormattedMessage(msg.chat.id, response, {
          parse_mode: "Markdown",
        });
      },
    });
  }

  private registerMessageHandler(agent: Agent) {
    if (!this.bot) return;

    this.bot.on("message", async (msg) => {
      const userId = msg.from!.id.toString();
      const session = this.getOrCreateSession(userId);
      session.lastActivity = Date.now();

      if (msg.text && msg.text.startsWith("/")) {
        await this.handleCommand(msg, agent);
      } else if (msg.text) {
        // 处理普通消息 - 自动转为聊天
        await this.handleRegularMessage(msg, agent);
      }
    });
  }

  private async handleCommand(msg: TelegramBot.Message, agent: Agent) {
    const [commandText, ...args] = msg.text!.slice(1).split(" ");
    const commandName = commandText.toLowerCase();
    const userId = msg.from!.id.toString();

    // 检查命令是否存在
    const handler = this.commandHandlers.get(commandName);
    if (!handler) {
      await this.sendErrorMessage(
        msg.chat.id,
        `❌ 未知命令: \`/${commandName}\`\n\n使用 /help 查看所有可用命令`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    // 检查冷却时间
    const cooldownKey = `${userId}_${commandName}`;
    const lastUsed = this.commandCooldowns.get(cooldownKey) || 0;
    const now = Date.now();

    if (handler.cooldown && now - lastUsed < handler.cooldown * 1000) {
      const remainingSeconds = Math.ceil(
        (handler.cooldown * 1000 - (now - lastUsed)) / 1000
      );
      await this.sendErrorMessage(
        msg.chat.id,
        `⏳ 命令冷却中，请等待 ${remainingSeconds} 秒后再试`
      );
      return;
    }

    // 设置冷却时间
    if (handler.cooldown) {
      this.commandCooldowns.set(cooldownKey, now);
    }

    try {
      console.log(`[Telegram] Executing command: ${commandName}`);
      
      const context: CommandContext = {
        agent,
        agentId: agent.agentId,
        userId,
        conversationHistory: this.getOrCreateSession(userId).conversationHistory,
      };

      await handler.handler(msg, args.join(" "), context);
    } catch (error) {
      console.error(`[Telegram] Error executing command ${commandName}:`, error);
      await this.sendErrorMessage(
        msg.chat.id,
        `❌ 执行命令时出现错误: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  private async handleRegularMessage(msg: TelegramBot.Message, agent: Agent) {
    // 将普通消息转为聊天命令
    const fakeCommand = {
      ...msg,
      text: `/chat ${msg.text}`,
    };
    await this.handleCommand(fakeCommand, agent);
  }

  private getOrCreateSession(userId: string): UserSession {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        userId,
        conversationHistory: [],
        lastActivity: Date.now(),
        preferences: {
          language: "auto",
          notificationLevel: "all",
          cryptoWatchlist: [],
          defaultCurrency: "USD",
          timezone: "Asia/Shanghai",
        },
        activeCommands: new Set(),
      });
    }
    return this.userSessions.get(userId)!;
  }

  private buildContextPrompt(session: UserSession, context: CommandContext): string {
    let prompt = `你是一个专业的加密货币 AI 助手，名字叫 Wonderland AI。你具有以下能力：

1. 🔍 内容分析：能够分析社交媒体内容，识别有价值的加密货币信息
2. 📊 深度研究：能够进行深度搜索和分析，提供详细的市场洞察
3. 💰 投资建议：基于数据分析提供专业的投资参考（非投资建议）
4. 🌐 实时信息：掌握最新的市场动态和行业趋势

当前上下文：
- Agent ID: ${context.agentId}
- 用户 ID: ${context.userId}
- 时间: ${new Date().toLocaleString("zh-CN")}

`;

    // 添加最近的对话历史
    if (session.conversationHistory.length > 0) {
      prompt += `\n最近的对话历史:\n`;
      const recentHistory = session.conversationHistory.slice(-6);
      recentHistory.forEach((msg) => {
        const role = msg.role === "user" ? "用户" : "助手";
        prompt += `${role}: ${msg.content}\n`;
      });
    }

    prompt += `\n请用中文回复，保持专业、友好且有用的语调。如果用户询问技术分析或投资建议，请提醒这仅供参考，不构成投资建议。`;

    return prompt;
  }

  // 事件处理方法
  private async handleContentInsightEvent(evt: AgentEvent) {
    const { contentInsight } = evt.payload;
    
    if (contentInsight && contentInsight.hasValue) {
      const message = `🔍 **发现有价值内容**\n\n` +
        `👤 作者: ${contentInsight.username}\n` +
        `📂 类别: ${contentInsight.category}\n` +
        `📝 摘要: ${contentInsight.summary}\n\n` +
        `🔗 [查看原文](${contentInsight.source})`;

      try {
        await this.sendFormattedMessage(this.chatId, message, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        });
      } catch (error) {
        console.error("[Telegram] Error sending insight notification:", error);
      }
    }
  }

  private async handleSearchCompletedEvent(evt: AgentEvent) {
    const { searchResult } = evt.payload;
    
    const message = `🔍 **深度研究完成**\n\n` +
      `🔎 查询: ${searchResult.query}\n` +
      `📊 发现 ${searchResult.citations.length} 个相关来源\n\n` +
      `使用 /research 命令查看详细结果`;

    try {
      await this.sendFormattedMessage(this.chatId, message, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("[Telegram] Error sending search notification:", error);
    }
  }

  private async handlePortfolioUpdateEvent(evt: AgentEvent) {
    // 投资组合更新通知
    const message = `📈 **投资组合已更新**\n\n使用 /portfolio 命令查看最新状态`;
    
    try {
      await this.sendFormattedMessage(this.chatId, message, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("[Telegram] Error sending portfolio notification:", error);
    }
  }

  // 工具方法
  public async sendFormattedMessage(
    chatId: string | number,
    text: string,
    options?: TelegramBot.SendMessageOptions
  ) {
    try {
      return await this.bot!.sendMessage(chatId, text, {
        ...options,
        disable_web_page_preview: options?.disable_web_page_preview ?? true,
      });
    } catch (error) {
      console.error("[Telegram] Error sending message:", error);
      throw error;
    }
  }

  public async sendErrorMessage(
    chatId: string | number,
    errorText: string,
    options?: TelegramBot.SendMessageOptions
  ) {
    const message = `❌ **错误**\n\n${errorText}`;
    return this.sendFormattedMessage(chatId, message, {
      parse_mode: "Markdown",
      ...options,
    });
  }

  public async sendChatAction(chatId: string | number, action: string) {
    if (!this.bot) {
      throw new Error("Enhanced Telegram bot not initialized");
    }

    try {
      await this.bot.sendChatAction(chatId, action as any);
    } catch (error) {
      console.error("[Telegram] Error sending chat action:", error);
      throw error;
    }
  }

  public async sendMessageWithOptions(
    chatId: string | number,
    text: string,
    options?: TelegramBot.SendMessageOptions
  ) {
    return this.sendFormattedMessage(chatId, text, options);
  }

  public registerCommand(handler: EnhancedCommandHandler) {
    this.commandHandlers.set(handler.command, handler);
    console.log(
      `[Telegram] Registered enhanced command: ${handler.command} (${handler.category})`
    );
  }

  private startSessionCleanup() {
    // 每小时清理一次过期会话
    setInterval(() => {
      const now = Date.now();
      const expiredThreshold = 24 * 60 * 60 * 1000; // 24小时

      for (const [userId, session] of this.userSessions.entries()) {
        if (now - session.lastActivity > expiredThreshold) {
          this.userSessions.delete(userId);
          console.log(`[Telegram] Cleaned expired session for user: ${userId}`);
        }
      }
    }, 60 * 60 * 1000);
  }

  public async sendMessage(content: string): Promise<boolean> {
    if (!this.bot) {
      throw new Error("Enhanced Telegram bot not initialized");
    }

    try {
      await this.sendFormattedMessage(this.chatId, content);
      return true;
    } catch (error) {
      console.error("[Telegram] Message send failed:", error);
      return false;
    }
  }

  /**
   * 获取聊天ID
   */
  public getChatId(): number {
    return parseInt(this.chatId);
  }

  /**
   * 公共版本的发送错误消息方法
   */
  public async sendErrorMessageToChat(chatId: number, error: string): Promise<boolean> {
    const errorMessage = `❌ **错误**\n\n${error}\n\n🕒 ${new Date().toLocaleString("zh-CN")}`;
    try {
      await this.sendFormattedMessage(chatId, errorMessage, {
        parse_mode: "Markdown",
      });
      return true;
    } catch (err) {
      console.error("[Telegram] Error sending error message:", err);
      return false;
    }
  }

  /**
   * 获取通知统计 - 临时实现
   */
  public getNotificationStats(): any {
    return {
      total_sent: this.commandCooldowns.size,
      active_sessions: this.userSessions.size,
      commands_registered: this.commandHandlers.size,
    };
  }
}

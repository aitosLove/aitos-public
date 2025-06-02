import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import { AIService } from "./ai-client";

interface CommandHandler {
  command: string;
  description: string;
  handler: (msg: TelegramBot.Message, args?: string) => Promise<void>;
}

/**
 * Telegram Bot 管理器
 * 处理与用户的交互，包括消息接收和发送
 */
export class TelegramBotManager {
  private static instance: TelegramBotManager;
  public bot: TelegramBot | null = null;
  private token: string;
  private chatId: string;
  private aiService: AIService;
  private commandHandlers: CommandHandler[] = [];

  private constructor() {
    this.token = process.env.TELEGRAM_TOKEN!;
    this.chatId = process.env.USER_CHAT_ID!;
    this.aiService = new AIService();
    this.validateConfig();
  }

  public static getInstance(): TelegramBotManager {
    if (!TelegramBotManager.instance) {
      TelegramBotManager.instance = new TelegramBotManager();
    }
    return TelegramBotManager.instance;
  }

  private validateConfig() {
    if (!this.token || !this.chatId) {
      console.error("❌ Telegram配置缺失!");
      console.error("必需的环境变量:");
      console.error("- TELEGRAM_TOKEN: Telegram Bot Token");
      console.error("- USER_CHAT_ID: 用户Chat ID");
      console.error("- QWEN_API_KEY: Qwen API密钥");
      console.error("\n获取方法:");
      console.error("1. 与@BotFather对话创建bot获取token");
      console.error("2. 向bot发送消息后访问 https://api.telegram.org/bot<TOKEN>/getUpdates 获取chat_id");
      console.error("3. 在阿里云DashScope申请Qwen API密钥");
      
      throw new Error("Missing Telegram config. Required ENV vars: TELEGRAM_TOKEN, USER_CHAT_ID, QWEN_API_KEY");
    }
  }

  /**
   * 初始化Bot，设置监听器
   */
  public initializeBot(agent: Agent) {
    if (!this.bot) {
      this.bot = new TelegramBot(this.token, { polling: true });
      
      this.registerDefaultCommands();
      this.registerMessageHandler(agent);
      this.registerEventListener(agent);
      
      console.log("[Telegram Bot] Initialized successfully");
    }
    return this.bot;
  }

  /**
   * 注册默认命令
   */
  private registerDefaultCommands() {
    this.registerCommand({
      command: "help",
      description: "显示可用命令",
      handler: async (msg) => {
        const helpText = this.generateHelpText();
        await this.sendMessage(helpText);
      }
    });

    this.registerCommand({
      command: "status",
      description: "显示系统状态",
      handler: async (msg) => {
        await this.sendMessage("✅ 系统运行正常");
      }
    });
  }

  /**
   * 注册新命令
   */
  public registerCommand(handler: CommandHandler) {
    this.commandHandlers.push(handler);
    console.log(`[Telegram Bot] Registered command: ${handler.command}`);
  }

  /**
   * 注册消息处理器
   */
  private registerMessageHandler(agent: Agent) {
    if (!this.bot) return;

    this.bot.on("message", async (msg) => {
      const text = msg.text;
      if (!text) return;

      console.log(`[Telegram Bot] Received message: ${text}`);

      // 处理命令
      if (text.startsWith("/")) {
        await this.handleCommand(msg, text);
      } else {
        // 处理普通消息
        await this.handleUserMessage(agent, text);
      }
    });
  }

  /**
   * 处理命令
   */
  private async handleCommand(msg: TelegramBot.Message, text: string) {
    const [commandText, ...args] = text.slice(1).split(" ");
    const commandName = commandText.toLowerCase();

    const handler = this.commandHandlers.find(h => h.command === commandName);
    
    if (handler) {
      try {
        await handler.handler(msg, args.join(" "));
      } catch (error) {
        console.error(`[Telegram Bot] Command error:`, error);
        await this.sendMessage(`命令执行失败: ${error instanceof Error ? error.message : "未知错误"}`);
      }
    } else {
      await this.sendMessage(`未知命令: ${commandName}。输入 /help 查看可用命令。`);
    }
  }

  /**
   * 处理用户普通消息
   */
  private async handleUserMessage(agent: Agent, text: string) {
    try {
      // 1. 发送用户消息到agent事件池
      agent.sensing.emitEvent({
        type: "USER_MESSAGE",
        description: "User sent a message via Telegram",
        payload: { message: text, source: "telegram" },
        timestamp: Date.now()
      });

      // 2. 使用AI服务生成回复
      const aiResponse = await this.aiService.chatResponse(text);
      await this.sendMessage(aiResponse);

    } catch (error) {
      console.error("[Telegram Bot] Message handling error:", error);
      await this.sendMessage("抱歉，处理您的消息时出现了错误。");
    }
  }

  /**
   * 注册Agent事件监听器
   */
  private registerEventListener(agent: Agent) {
    agent.sensing.registerListener(async (event: AgentEvent) => {
      try {
        console.log(`[Telegram Bot] Received event: ${event.type}`);
        
        // 使用AI分析事件是否值得推送
        const analysis = await this.aiService.analyzeEvent(event.type, event.payload);
        
        if (analysis.shouldNotify) {
          const priorityEmoji = {
            high: "🚨",
            medium: "📢", 
            low: "ℹ️"
          };
          
          const message = `${priorityEmoji[analysis.priority]} **${event.type}**\n${analysis.summary || event.description}`;
          await this.sendMessage(message);
        }
      } catch (error) {
        console.error("[Telegram Bot] Event processing error:", error);
      }
    });
  }

  /**
   * 发送消息给用户
   */
  public async sendMessage(content: string): Promise<boolean> {
    if (!this.bot) {
      console.error("[Telegram Bot] Bot not initialized");
      return false;
    }

    try {
      await this.bot.sendMessage(this.chatId, content);
      console.log(`[Telegram Bot] Message sent: ${content.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error("[Telegram Bot] Send message failed:", error);
      return false;
    }
  }

  /**
   * 生成帮助文本
   */
  private generateHelpText(): string {
    let helpText = "🤖 **可用命令**\n\n";
    this.commandHandlers.forEach(handler => {
      helpText += `/${handler.command} - ${handler.description}\n`;
    });
    helpText += "\n💬 发送任何消息与我聊天";
    return helpText;
  }

  /**
   * 清理资源
   */
  public cleanup() {
    if (this.bot) {
      this.bot.stopPolling();
      this.bot = null;
      console.log("[Telegram Bot] Cleanup completed");
    }
  }
}

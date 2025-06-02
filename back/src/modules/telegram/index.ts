import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { AIService } from "./ai-client";

export interface TelegramModuleConfig {
  botToken: string;
  allowedUsers?: number[]; // 允许的用户ID列表，如果不设置则允许所有用户
}

/**
 * Telegram 模块
 * 专注于 Telegram 信息交互，通过事件池与 Agent Framework 通信
 */
export class TelegramModule {
  private bot: TelegramBot;
  private agent: Agent;
  private aiService: AIService;
  private config: TelegramModuleConfig;
  private isEnabled = false;

  constructor(agent: Agent, config: TelegramModuleConfig) {
    this.agent = agent;
    this.config = config;
    this.aiService = new AIService();
    
    // 初始化 Telegram Bot
    this.bot = new TelegramBot(config.botToken, { polling: true });
    
    console.log("[Telegram Module] Initialized");
  }

  /**
   * 启用模块
   */
  enable() {
    if (this.isEnabled) {
      console.log("[Telegram Module] Already enabled");
      return;
    }

    this.setupTelegramHandlers();
    this.setupAgentEventListener();
    this.isEnabled = true;
    
    console.log("[Telegram Module] Enabled");
  }

  /**
   * 禁用模块
   */
  disable() {
    if (!this.isEnabled) {
      console.log("[Telegram Module] Already disabled");
      return;
    }

    this.bot.removeAllListeners();
    this.isEnabled = false;
    
    console.log("[Telegram Module] Disabled");
  }

  /**
   * 设置 Telegram 消息处理器
   */
  private setupTelegramHandlers() {
    // 处理文本消息
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const text = msg.text;

      // 检查用户权限
      if (this.config.allowedUsers && userId && !this.config.allowedUsers.includes(userId)) {
        await this.bot.sendMessage(chatId, '抱歉，您没有使用此机器人的权限。');
        return;
      }

      if (!text) return;

      console.log(`[Telegram Module] Received message from ${userId}: ${text}`);

      // 处理命令
      if (text.startsWith('/')) {
        await this.handleCommand(chatId, text, userId);
      } else {
        // 普通聊天消息，使用 AI 服务处理
        await this.handleChatMessage(chatId, text, userId);
      }
    });

    // 错误处理
    this.bot.on('error', (error) => {
      console.error('[Telegram Module] Bot error:', error);
    });
  }

  /**
   * 处理命令
   */
  private async handleCommand(chatId: number, command: string, userId?: number) {
    try {
      switch (command.toLowerCase()) {
        case '/start':
          await this.bot.sendMessage(chatId, '🤖 欢迎使用智能助手！\n\n可用命令：\n/help - 显示帮助\n/status - 查看状态\n\n或者直接发送消息与我聊天！');
          break;

        case '/help':
          await this.bot.sendMessage(chatId, '📖 帮助信息：\n\n/start - 开始使用\n/help - 显示此帮助\n/status - 查看系统状态\n\n💬 你也可以直接发送消息与我聊天！');
          break;

        case '/status':
          await this.bot.sendMessage(chatId, '✅ 系统运行正常\n🤖 AI 服务就绪\n📡 事件监听已启用');
          
          // 发送状态查询事件到 Agent
          this.agent.sensing.emitEvent({
            type: "TG_STATUS_REQUEST",
            description: "User requested system status via Telegram",
            payload: { chatId, userId, command },
            timestamp: Date.now(),
          });
          break;

        default:
          await this.bot.sendMessage(chatId, '❓ 未知命令。输入 /help 查看可用命令。');
          
          // 发送未知命令事件到 Agent
          this.agent.sensing.emitEvent({
            type: "TG_UNKNOWN_COMMAND",
            description: "User sent unknown command via Telegram",
            payload: { chatId, userId, command },
            timestamp: Date.now(),
          });
      }
    } catch (error) {
      console.error('[Telegram Module] Command handling error:', error);
      await this.bot.sendMessage(chatId, '❌ 处理命令时出现错误，请稍后重试。');
    }
  }

  /**
   * 处理聊天消息
   */
  private async handleChatMessage(chatId: number, message: string, userId?: number) {
    try {
      // 发送用户消息事件到 Agent
      this.agent.sensing.emitEvent({
        type: "TG_USER_MESSAGE",
        description: "User sent message via Telegram",
        payload: { chatId, userId, message },
        timestamp: Date.now(),
      });

      // 显示正在输入状态
      await this.bot.sendChatAction(chatId, 'typing');

      // 使用 AI 服务生成回复
      const aiResponse = await this.aiService.chatResponse(message);

      // 发送回复
      await this.bot.sendMessage(chatId, aiResponse);

      // 发送回复事件到 Agent
      this.agent.sensing.emitEvent({
        type: "TG_AI_RESPONSE",
        description: "AI responded to user message via Telegram",
        payload: { chatId, userId, userMessage: message, aiResponse },
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('[Telegram Module] Chat message handling error:', error);
      await this.bot.sendMessage(chatId, '❌ 处理消息时出现错误，请稍后重试。');
    }
  }

  /**
   * 设置 Agent 事件监听器
   */
  private setupAgentEventListener() {
    this.agent.sensing.registerListener(async (evt) => {
      console.log(`[Telegram Module] Received event: ${evt.type}`, evt.payload);

      // 分析事件是否值得推送给用户
      try {
        const analysis = await this.aiService.analyzeEvent(evt.type, evt.payload);
        
        if (analysis.shouldNotify && analysis.summary) {
          // 这里可以根据优先级决定发送给哪些用户
          // 目前简单处理：如果有配置的用户，发给第一个用户
          if (this.config.allowedUsers && this.config.allowedUsers.length > 0) {
            const targetUserId = this.config.allowedUsers[0];
            
            let priorityIcon = '';
            switch (analysis.priority) {
              case 'high': priorityIcon = '🔴'; break;
              case 'medium': priorityIcon = '🟡'; break;
              case 'low': priorityIcon = '🟢'; break;
            }

            const notificationMessage = `${priorityIcon} 系统通知\n\n📋 事件类型: ${evt.type}\n📝 摘要: ${analysis.summary}\n⏰ 时间: ${new Date(evt.timestamp).toLocaleString('zh-CN')}`;
            
            await this.bot.sendMessage(targetUserId, notificationMessage);
          }
        }
      } catch (error) {
        console.error('[Telegram Module] Event analysis error:', error);
      }
    });
  }

  /**
   * 主动发送消息给指定用户
   */
  async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.sendMessage(chatId, message);
      console.log(`[Telegram Module] Sent message to ${chatId}: ${message}`);
    } catch (error) {
      console.error('[Telegram Module] Send message error:', error);
      throw error;
    }
  }

  /**
   * 广播消息给所有允许的用户
   */
  async broadcast(message: string) {
    if (!this.config.allowedUsers || this.config.allowedUsers.length === 0) {
      console.log('[Telegram Module] No allowed users configured for broadcast');
      return;
    }

    const promises = this.config.allowedUsers.map(userId => 
      this.sendMessage(userId, message).catch(error => 
        console.error(`[Telegram Module] Failed to send broadcast to ${userId}:`, error)
      )
    );

    await Promise.all(promises);
    console.log(`[Telegram Module] Broadcast sent to ${this.config.allowedUsers.length} users`);
  }
}

/**
 * 启用 Telegram 模块的便捷函数
 */
export function enableTelegramModule(agent: Agent, config: TelegramModuleConfig): TelegramModule {
  const telegramModule = new TelegramModule(agent, config);
  telegramModule.enable();
  return telegramModule;
}
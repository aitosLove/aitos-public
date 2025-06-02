/**
 * 精简版 Telegram 机器人
 * 专注于 Telegram 信息交互和 Agent 事件处理
 */

import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import { aiClient } from "./ai-client";

export interface TelegramBotConfig {
  token: string;
  chatId: string;
  agentId: string;
}

export class SimplifiedTelegramBot {
  private bot: TelegramBot;
  private agent: Agent;
  private chatId: string;
  private agentId: string;
  private isListening = false;

  constructor(agent: Agent, config: TelegramBotConfig) {
    this.agent = agent;
    this.chatId = config.chatId;
    this.agentId = config.agentId;
    
    // 初始化 Telegram Bot
    this.bot = new TelegramBot(config.token, { polling: true });
    
    console.log(`🤖 Telegram Bot 初始化成功 (Agent: ${this.agentId})`);
  }

  /**
   * 启动机器人
   */
  public async start(): Promise<void> {
    try {
      // 设置错误处理
      this.setupErrorHandling();
      
      // 设置消息处理
      this.setupMessageHandling();
      
      // 设置命令处理
      this.setupCommandHandling();
      
      // 设置 Agent 事件监听
      this.setupAgentEventListener();
      
      this.isListening = true;
      
      const botInfo = await this.bot.getMe();
      console.log(`✅ Telegram Bot 启动成功: @${botInfo.username}`);
      
      // 发送启动通知
      await this.sendMessage("🚀 Wonderland Telegram Bot 已启动\n\n使用 /help 查看可用命令");
      
    } catch (error) {
      console.error("❌ Telegram Bot 启动失败:", error);
      throw error;
    }
  }

  /**
   * 停止机器人
   */
  public async stop(): Promise<void> {
    this.isListening = false;
    await this.bot.stopPolling();
    console.log("🛑 Telegram Bot 已停止");
  }

  /**
   * 发送消息到指定聊天
   */
  public async sendMessage(text: string, options?: any): Promise<void> {
    try {
      await this.bot.sendMessage(this.chatId, text, {
        parse_mode: "Markdown",
        ...options
      });
    } catch (error) {
      console.error("❌ 发送消息失败:", error);
    }
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    this.bot.on("error", (error) => {
      console.error("🚨 Telegram Bot 错误:", error);
    });

    this.bot.on("polling_error", (error) => {
      console.error("🚨 Telegram Bot 轮询错误:", error);
    });
  }

  /**
   * 设置消息处理
   */
  private setupMessageHandling(): void {
    this.bot.on("message", async (msg) => {
      // 只处理文本消息和来自指定聊天的消息
      if (!msg.text || msg.chat.id.toString() !== this.chatId) {
        return;
      }

      // 跳过命令消息（由命令处理器处理）
      if (msg.text.startsWith("/")) {
        return;
      }

      console.log(`📩 收到用户消息: ${msg.text}`);

      try {
        // 向 Agent 事件池发送用户消息事件
        this.agent.sensing.emitEvent({
          type: "USER_MESSAGE_EVENT",
          description: "用户发送了消息",
          payload: {
            userId: msg.from?.id?.toString() || "unknown",
            username: msg.from?.username || "unknown",
            message: msg.text,
            chatId: msg.chat.id,
            timestamp: new Date().toISOString(),
            messageId: msg.message_id
          },
          timestamp: Date.now()
        });

        // 显示正在输入状态
        await this.bot.sendChatAction(msg.chat.id, "typing");

        // 使用 AI 生成回复
        const aiResponse = await this.generateAIResponse(msg.text);
        
        // 发送回复
        await this.sendMessage(aiResponse);

      } catch (error) {
        console.error("❌ 处理用户消息失败:", error);
        await this.sendMessage("❌ 处理您的消息时出现错误，请稍后再试。");
      }
    });
  }

  /**
   * 设置命令处理
   */
  private setupCommandHandling(): void {
    // 帮助命令
    this.bot.onText(/\/help/, async (msg) => {
      if (msg.chat.id.toString() !== this.chatId) return;
      
      const helpText = `🤖 **Wonderland Telegram Bot**\n\n` +
        `📋 **可用命令:**\n` +
        `/help - 显示此帮助信息\n` +
        `/status - 查看系统状态\n` +
        `/search <关键词> - 搜索相关内容\n` +
        `/analyze <内容> - 分析指定内容\n` +
        `/insights - 获取最新洞察\n\n` +
        `💬 **提示:** 您也可以直接发送消息与我对话`;
      
      await this.sendMessage(helpText);
    });

    // 状态命令
    this.bot.onText(/\/status/, async (msg) => {
      if (msg.chat.id.toString() !== this.chatId) return;
      
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);
      
      const statusText = `📊 **系统状态**\n\n` +
        `🤖 Agent ID: ${this.agentId}\n` +
        `⏱️ 运行时间: ${uptimeHours}h ${uptimeMinutes}m\n` +
        `🔄 监听状态: ${this.isListening ? '正常' : '停止'}\n` +
        `✅ 系统状态: 正常运行`;
      
      await this.sendMessage(statusText);

      // 发送状态查询事件到 Agent
      this.agent.sensing.emitEvent({
        type: "STATUS_QUERY_EVENT",
        description: "用户查询系统状态",
        payload: {
          userId: msg.from?.id?.toString() || "unknown",
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now()
      });
    });

    // 搜索命令
    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() !== this.chatId) return;
      
      const query = match?.[1];
      if (!query) {
        await this.sendMessage("❌ 请提供搜索关键词\n\n用法: /search <关键词>");
        return;
      }

      await this.sendMessage(`🔍 正在搜索: "${query}"`);

      // 发送搜索事件到 Agent
      this.agent.sensing.emitEvent({
        type: "SEARCH_REQUEST_EVENT",
        description: "用户请求搜索",
        payload: {
          userId: msg.from?.id?.toString() || "unknown",
          query: query,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now()
      });
    });

    // 分析命令
    this.bot.onText(/\/analyze (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() !== this.chatId) return;
      
      const content = match?.[1];
      if (!content) {
        await this.sendMessage("❌ 请提供要分析的内容\n\n用法: /analyze <内容>");
        return;
      }

      await this.sendMessage(`📊 正在分析: "${content}"`);

      // 发送分析事件到 Agent
      this.agent.sensing.emitEvent({
        type: "ANALYSIS_REQUEST_EVENT",
        description: "用户请求分析",
        payload: {
          userId: msg.from?.id?.toString() || "unknown",
          content: content,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now()
      });
    });

    // 洞察命令
    this.bot.onText(/\/insights/, async (msg) => {
      if (msg.chat.id.toString() !== this.chatId) return;
      
      await this.sendMessage("📈 正在获取最新洞察...");

      // 发送洞察请求事件到 Agent
      this.agent.sensing.emitEvent({
        type: "INSIGHTS_REQUEST_EVENT",
        description: "用户请求获取洞察",
        payload: {
          userId: msg.from?.id?.toString() || "unknown",
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now()
      });
    });
  }

  /**
   * 设置 Agent 事件监听器
   */
  private setupAgentEventListener(): void {
    console.log("🔄 设置 Agent 事件监听器...");

    this.agent.sensing.registerListener(async (event: AgentEvent) => {
      try {
        // 使用 AI 分析事件是否有价值
        const shouldNotify = await this.analyzeEventValue(event);
        
        if (shouldNotify) {
          const message = await this.formatEventMessage(event);
          await this.sendMessage(message);
        }
      } catch (error) {
        console.error("❌ 处理 Agent 事件失败:", error);
      }
    });

    console.log("✅ Agent 事件监听器设置完成");
  }

  /**
   * 使用 AI 分析事件是否有价值
   */
  private async analyzeEventValue(event: AgentEvent): Promise<boolean> {
    try {
      // 某些事件类型直接跳过
      const skipEvents = [
        "AGENT_HEARTBEAT",
        "SYSTEM_DEBUG",
        "INTERNAL_LOG"
      ];

      if (skipEvents.includes(event.type)) {
        return false;
      }

      // 构建分析提示
      const analysisPrompt = `分析以下事件是否对用户有价值，值得推送给用户：

事件类型: ${event.type}
事件描述: ${event.description}
事件载荷: ${JSON.stringify(event.payload, null, 2)}

请判断这个事件是否：
1. 包含重要的市场信息、洞察或分析结果
2. 对投资决策有帮助
3. 包含错误或警告信息需要用户知晓
4. 包含用户直接请求的信息

如果值得推送，回复 "YES"，否则回复 "NO"。只回复 YES 或 NO，不要其他内容。`;

      const response = await aiClient.chat.completions.create({
        messages: [
          { role: "system", content: "你是一个事件价值分析专家，帮助判断哪些事件值得推送给用户。" },
          { role: "user", content: analysisPrompt }
        ],
        model: process.env.TELEGRAM_CHAT_AI_ENDPOINT || "gpt-3.5-turbo",
        temperature: 0.1,
        max_tokens: 10
      });

      const decision = response.choices?.[0]?.message?.content?.trim().toUpperCase();
      
      console.log(`🔍 事件价值分析 - ${event.type}: ${decision}`);
      
      return decision === "YES";

    } catch (error) {
      console.error("❌ 分析事件价值失败:", error);
      // 发生错误时，对重要事件类型默认推送
      const importantEvents = [
        "CONTENT_INSIGHT_AVAILABLE_EVENT",
        "PERPLEXITY_SEARCH_COMPLETED_EVENT",
        "DEFI_ANALYSIS_COMPLETED_EVENT",
        "SYSTEM_ERROR_EVENT",
        "ANALYSIS_COMPLETED_EVENT",
        "SEARCH_COMPLETED_EVENT"
      ];
      
      return importantEvents.includes(event.type);
    }
  }

  /**
   * 格式化事件消息
   */
  private async formatEventMessage(event: AgentEvent): Promise<string> {
    try {
      const formatPrompt = `请将以下事件信息格式化为用户友好的 Telegram 消息：

事件类型: ${event.type}
事件描述: ${event.description}
事件载荷: ${JSON.stringify(event.payload, null, 2)}
发生时间: ${new Date(event.timestamp).toLocaleString()}

要求：
1. 使用 Markdown 格式
2. 简洁明了，重点突出
3. 包含必要的 emoji 图标
4. 如果是分析结果或洞察，要突出关键信息
5. 如果是错误信息，要清楚标明问题
6. 消息长度控制在 500 字符以内

请直接返回格式化后的消息内容。`;

      const response = await aiClient.chat.completions.create({
        messages: [
          { role: "system", content: "你是一个专业的消息格式化专家，擅长将技术信息转换为用户友好的格式。" },
          { role: "user", content: formatPrompt }
        ],
        model: process.env.TELEGRAM_CHAT_AI_ENDPOINT || "gpt-3.5-turbo",
        temperature: 0.3,
        max_tokens: 300
      });

      const formattedMessage = response.choices?.[0]?.message?.content?.trim();
      
      return formattedMessage || this.getFallbackMessage(event);

    } catch (error) {
      console.error("❌ 格式化事件消息失败:", error);
      return this.getFallbackMessage(event);
    }
  }

  /**
   * 获取备用消息格式
   */
  private getFallbackMessage(event: AgentEvent): string {
    const timestamp = new Date(event.timestamp).toLocaleString();
    
    return `🔔 **系统通知**\n\n` +
      `📋 **事件**: ${event.type}\n` +
      `📝 **描述**: ${event.description}\n` +
      `⏰ **时间**: ${timestamp}`;
  }

  /**
   * 使用 AI 生成回复
   */
  private async generateAIResponse(userMessage: string): Promise<string> {
    try {
      const response = await aiClient.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "你是 Wonderland 的专业加密货币和投资顾问助手。提供清晰、有见地的回答，特别是关于市场分析、投资策略和风险管理。回答要简洁明了，适合 Telegram 聊天环境。"
          },
          { role: "user", content: userMessage }
        ],
        model: process.env.TELEGRAM_CHAT_AI_ENDPOINT || "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices?.[0]?.message?.content || "抱歉，我暂时无法回复您的消息。";

    } catch (error) {
      console.error("❌ 生成 AI 回复失败:", error);
      return "❌ 处理您的消息时出现错误，请稍后再试。";
    }
  }
}

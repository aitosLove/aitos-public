/**
 * 智能上下文管理器 - 管理用户对话上下文和状态
 */

import { Agent } from "@/src/agent";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
import { db } from "@/db";
import { tgMessageTable } from "@/db/schema/moduleSchema/tgSchema";
import { desc, eq } from "drizzle-orm";

export interface ConversationContext {
  userId: string;
  chatId: number;
  sessionId: string;
  messages: ConversationMessage[];
  currentTopic?: string;
  userPreferences: UserProfile;
  lastActivity: number;
  metadata: Record<string, any>;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  messageType: "text" | "command" | "notification";
  metadata?: Record<string, any>;
}

export interface UserProfile {
  userId: string;
  name?: string;
  timezone: string;
  language: "zh" | "en";
  interests: string[];
  tradingLevel: "beginner" | "intermediate" | "advanced";
  riskTolerance: "conservative" | "moderate" | "aggressive";
  portfolioSize: "small" | "medium" | "large";
  preferredAnalysisDepth: "quick" | "detailed" | "comprehensive";
  notificationPreferences: {
    marketUpdates: boolean;
    portfolioAlerts: boolean;
    newsDigest: boolean;
    technicalAnalysis: boolean;
  };
}

export class ContextManager {
  private agent: Agent;
  private botManager: EnhancedTelegramBotManager;
  private contexts: Map<string, ConversationContext> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private contextTimeout = 30 * 60 * 1000; // 30分钟上下文超时

  constructor(agent: Agent, botManager: EnhancedTelegramBotManager) {
    this.agent = agent;
    this.botManager = botManager;
    this.setupContextCleanup();
  }

  /**
   * 获取或创建用户上下文
   */
  public async getOrCreateContext(
    userId: string, 
    chatId: number
  ): Promise<ConversationContext> {
    let context = this.contexts.get(userId);
    
    if (!context) {
      // 加载历史消息
      const recentMessages = await this.loadRecentMessages(userId);
      
      // 获取或创建用户配置
      const userProfile = await this.getOrCreateUserProfile(userId);

      context = {
        userId,
        chatId,
        sessionId: this.generateSessionId(),
        messages: recentMessages,
        userPreferences: userProfile,
        lastActivity: Date.now(),
        metadata: {},
      };

      this.contexts.set(userId, context);
    }

    context.lastActivity = Date.now();
    return context;
  }

  /**
   * 添加消息到上下文
   */
  public async addMessage(
    userId: string,
    message: Omit<ConversationMessage, "id" | "timestamp">
  ): Promise<void> {
    const context = await this.getOrCreateContext(userId, 0);
    
    const fullMessage: ConversationMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now(),
    };

    context.messages.push(fullMessage);
    
    // 保持最近50条消息
    if (context.messages.length > 50) {
      context.messages = context.messages.slice(-50);
    }

    // 保存到数据库
    await this.saveMessageToDb(userId, fullMessage);

    // 更新上下文话题
    if (message.role === "user") {
      await this.updateContextTopic(context, message.content);
    }
  }

  /**
   * 获取对话历史用于AI分析
   */
  public getConversationHistory(
    userId: string, 
    limit: number = 10
  ): ConversationMessage[] {
    const context = this.contexts.get(userId);
    if (!context) return [];

    return context.messages
      .filter(msg => msg.role !== "system")
      .slice(-limit);
  }

  /**
   * 获取用户偏好设置
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * 更新用户偏好设置
   */
  public async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    const profile = await this.getOrCreateUserProfile(userId);
    Object.assign(profile, updates);
    this.userProfiles.set(userId, profile);

    // 这里可以保存到数据库
    console.log(`[ContextManager] 更新用户配置: ${userId}`, updates);
  }

  /**
   * 分析用户意图
   */
  public async analyzeUserIntent(
    userId: string,
    message: string
  ): Promise<{
    intent: string;
    confidence: number;
    entities: Record<string, any>;
    suggestedActions: string[];
  }> {
    const context = this.contexts.get(userId);
    const profile = await this.getUserProfile(userId);

    // 简单的意图识别逻辑
    const intents = {
      "market_analysis": {
        keywords: ["分析", "市场", "价格", "趋势", "技术分析"],
        confidence: 0
      },
      "portfolio_help": {
        keywords: ["投资组合", "持仓", "配置", "建议", "优化"],
        confidence: 0
      },
      "news_inquiry": {
        keywords: ["新闻", "消息", "事件", "发生", "最新"],
        confidence: 0
      },
      "trading_signal": {
        keywords: ["买入", "卖出", "交易", "信号", "机会"],
        confidence: 0
      },
      "learning": {
        keywords: ["学习", "教程", "怎么", "如何", "解释"],
        confidence: 0
      },
      "general_chat": {
        keywords: ["你好", "谢谢", "再见", "聊天"],
        confidence: 0
      }
    };

    // 计算意图置信度
    const lowerMessage = message.toLowerCase();
    for (const [intent, config] of Object.entries(intents)) {
      config.confidence = config.keywords.reduce((score, keyword) => {
        return lowerMessage.includes(keyword) ? score + 1 : score;
      }, 0) / config.keywords.length;
    }

    // 找到最高置信度的意图
    const bestIntent = Object.entries(intents)
      .sort(([,a], [,b]) => b.confidence - a.confidence)[0];

    // 提取实体（简单实现）
    const entities = this.extractEntities(message);

    // 根据用户配置和历史生成建议
    const suggestedActions = this.generateSuggestedActions(
      bestIntent[0], 
      entities, 
      profile
    );

    return {
      intent: bestIntent[0],
      confidence: bestIntent[1].confidence,
      entities,
      suggestedActions
    };
  }

  /**
   * 生成个性化回复
   */
  public generatePersonalizedResponse(
    userId: string,
    baseResponse: string
  ): string {
    const profile = this.userProfiles.get(userId);
    if (!profile) return baseResponse;

    // 根据用户等级调整回复详细程度
    let response = baseResponse;
    
    if (profile.tradingLevel === "beginner") {
      response += "\n\n💡 **新手提示**: 投资有风险，建议从小额开始，多学习基础知识。";
    } else if (profile.tradingLevel === "advanced") {
      response += "\n\n📊 如需更深入的技术分析，请使用 /analysis 命令。";
    }

    // 根据风险偏好添加建议
    if (profile.riskTolerance === "conservative") {
      response += "\n\n🛡️ 基于您的保守风险偏好，建议优先考虑稳定性较高的投资选项。";
    }

    return response;
  }

  /**
   * 从数据库加载最近消息
   */
  private async loadRecentMessages(userId: string): Promise<ConversationMessage[]> {
    try {
      const messages = await db
        .select()
        .from(tgMessageTable)
        .where(eq(tgMessageTable.userId, userId))
        .orderBy(desc(tgMessageTable.timestamp))
        .limit(20);

      return messages.map(msg => ({
        id: msg.id.toString(),
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
        messageType: msg.messageType as "text" | "command" | "notification",
        metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined
      })).reverse();
    } catch (error) {
      console.error("[ContextManager] 加载历史消息失败:", error);
      return [];
    }
  }

  /**
   * 保存消息到数据库
   */
  private async saveMessageToDb(
    userId: string, 
    message: ConversationMessage
  ): Promise<void> {
    try {
      await db.insert(tgMessageTable).values({
        userId,
        role: message.role,
        content: message.content,
        messageType: message.messageType,
        timestamp: new Date(message.timestamp),
        metadata: message.metadata ? JSON.stringify(message.metadata) : null
      });
    } catch (error) {
      console.error("[ContextManager] 保存消息失败:", error);
    }
  }

  /**
   * 获取或创建用户配置
   */
  private async getOrCreateUserProfile(userId: string): Promise<UserProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        timezone: "Asia/Shanghai",
        language: "zh",
        interests: [],
        tradingLevel: "intermediate",
        riskTolerance: "moderate",
        portfolioSize: "medium",
        preferredAnalysisDepth: "detailed",
        notificationPreferences: {
          marketUpdates: true,
          portfolioAlerts: true,
          newsDigest: true,
          technicalAnalysis: false,
        }
      };

      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * 更新上下文话题
   */
  private async updateContextTopic(
    context: ConversationContext,
    message: string
  ): Promise<void> {
    // 简单的话题识别
    const topics = {
      "Bitcoin": ["btc", "bitcoin", "比特币"],
      "Ethereum": ["eth", "ethereum", "以太坊"],
      "DeFi": ["defi", "去中心化金融", "流动性"],
      "Trading": ["交易", "买卖", "投资"],
      "Market": ["市场", "行情", "价格"]
    };

    const lowerMessage = message.toLowerCase();
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        context.currentTopic = topic;
        break;
      }
    }
  }

  /**
   * 提取实体
   */
  private extractEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // 提取代币符号
    const tokenRegex = /\b([A-Z]{2,10})\b/g;
    const tokens = message.match(tokenRegex) || [];
    if (tokens.length > 0) {
      entities.tokens = tokens;
    }

    // 提取数字
    const numberRegex = /\b\d+\.?\d*\b/g;
    const numbers = message.match(numberRegex) || [];
    if (numbers.length > 0) {
      entities.numbers = numbers.map(n => parseFloat(n));
    }

    return entities;
  }

  /**
   * 生成建议操作
   */
  private generateSuggestedActions(
    intent: string,
    entities: Record<string, any>,
    profile?: UserProfile | null
  ): string[] {
    const actions: string[] = [];

    switch (intent) {
      case "market_analysis":
        actions.push("/market", "/analysis");
        if (entities.tokens) {
          actions.push(`/price ${entities.tokens[0]}`);
        }
        break;
      
      case "portfolio_help":
        actions.push("/portfolio", "/holding", "/suggestions");
        break;
      
      case "news_inquiry":
        actions.push("/news", "/insights", "/research");
        break;
      
      case "trading_signal":
        actions.push("/signals", "/opportunities");
        break;
      
      case "learning":
        actions.push("/help", "/guide");
        break;
    }

    return actions;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 设置上下文清理
   */
  private setupContextCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [userId, context] of this.contexts.entries()) {
        if (now - context.lastActivity > this.contextTimeout) {
          this.contexts.delete(userId);
          console.log(`[ContextManager] 清理过期上下文: ${userId}`);
        }
      }
    }, 10 * 60 * 1000); // 每10分钟检查一次
  }

  /**
   * 获取上下文统计
   */
  public getContextStats(): {
    activeContexts: number;
    totalMessages: number;
    averageMessageLength: number;
  } {
    const activeContexts = this.contexts.size;
    const allMessages = Array.from(this.contexts.values())
      .flatMap(ctx => ctx.messages);
    
    const totalMessages = allMessages.length;
    const averageMessageLength = totalMessages > 0 
      ? allMessages.reduce((sum, msg) => sum + msg.content.length, 0) / totalMessages
      : 0;

    return {
      activeContexts,
      totalMessages,
      averageMessageLength: Math.round(averageMessageLength)
    };
  }
}

/**
 * 智能通知管理器 - 负责处理所有类型的推送通知
 */

import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
import {
  getContentInsightsByAgent,
  getRecentPerplexitySearches,
} from "../contentProcess/ContentDbOp";
import { db } from "@/db";
import { 
  insightStateTable, 
  defiInsightTable
} from "@/db/schema/moduleSchema/defiSchema";
import { tgMessageTable } from "@/db/schema/moduleSchema/tgSchema";
import { desc, eq, and, gt } from "drizzle-orm";

// 通知类型定义
export type NotificationType = 
  | "MARKET_INSIGHT" 
  | "DEFI_INSIGHT" 
  | "CONTENT_INSIGHT" 
  | "DEEP_SEARCH" 
  | "SYSTEM_ALERT";

// 通知配置接口
interface NotificationConfig {
  enabled: boolean;
  priority: "high" | "medium" | "low";
  cooldown: number; // 冷却时间（秒）
  maxPerHour: number; // 每小时最大推送数量
}

// 通知模板接口
interface NotificationTemplate {
  title: string;
  format: (data: any) => string;
  parseMode?: "HTML" | "Markdown";
  buttons?: any[];
}

// 用户通知设置
type UserNotificationSettings = {
  [key in NotificationType]: NotificationConfig;
}

export class NotificationManager {
  private agent: Agent;
  private botManager: EnhancedTelegramBotManager;
  private notificationHistory: Map<string, number[]> = new Map(); // 存储发送历史
  private lastNotificationTime: Map<NotificationType, number> = new Map();
  
  // 默认通知设置
  private defaultSettings: UserNotificationSettings = {
    MARKET_INSIGHT: {
      enabled: true,
      priority: "high",
      cooldown: 300, // 5分钟
      maxPerHour: 6,
    },
    DEFI_INSIGHT: {
      enabled: true,
      priority: "high",
      cooldown: 300,
      maxPerHour: 6,
    },
    CONTENT_INSIGHT: {
      enabled: true,
      priority: "medium",
      cooldown: 600, // 10分钟
      maxPerHour: 4,
    },
    DEEP_SEARCH: {
      enabled: true,
      priority: "medium",
      cooldown: 900, // 15分钟
      maxPerHour: 3,
    },
    SYSTEM_ALERT: {
      enabled: true,
      priority: "high",
      cooldown: 60,
      maxPerHour: 10,
    },
  };

  // 通知模板
  private templates: Record<NotificationType, NotificationTemplate> = {
    MARKET_INSIGHT: {
      title: "📈 市场洞察更新",
      format: (insight: any) => 
        `📈 **市场洞察更新**\n\n` +
        `${insight.insight}\n\n` +
        `🕒 ${new Date(insight.timestamp).toLocaleString("zh-CN")}\n` +
        `💡 使用 /insights 查看更多洞察`,
      parseMode: "Markdown",
    },
    DEFI_INSIGHT: {
      title: "🔗 DeFi策略洞察",
      format: (insight: any) => 
        `🔗 **DeFi策略洞察**\n\n` +
        `${insight.insight}\n\n` +
        `🕒 ${new Date(insight.timestamp).toLocaleString("zh-CN")}\n` +
        `📊 使用 /defi 查看策略详情`,
      parseMode: "Markdown",
    },
    CONTENT_INSIGHT: {
      title: "🎯 有价值内容发现",
      format: (insight: any) => 
        `🎯 **发现有价值内容**\n\n` +
        `👤 **@${insight.username}**\n` +
        `📝 **类别**: ${this.getCategoryEmoji(insight.category)} ${insight.category}\n\n` +
        `💡 **摘要**: ${insight.summary}\n\n` +
        `${insight.entity && insight.entity.length > 0 ? `🏷️ **相关实体**: ${insight.entity.join(", ")}\n\n` : ""}` +
        `🔗 [查看原文](${insight.source})\n` +
        `🕒 ${new Date(insight.createdAt).toLocaleString("zh-CN")}`,
      parseMode: "Markdown",
    },
    DEEP_SEARCH: {
      title: "🔍 深度研究完成",
      format: (search: any) => 
        `🔍 **深度研究报告**\n\n` +
        `❓ **研究问题**: ${search.query}\n\n` +
        `📊 **分析结果**:\n${search.response}\n\n` +
        `🤖 **模型**: ${search.model}\n` +
        `⏱️ **时间**: ${new Date(search.timestamp).toLocaleString("zh-CN")}\n\n` +
        `使用 /research 查看更多研究`,
      parseMode: "Markdown",
    },
    SYSTEM_ALERT: {
      title: "⚠️ 系统提醒",
      format: (alert: any) => 
        `⚠️ **系统提醒**\n\n${alert.message}\n\n🕒 ${new Date().toLocaleString("zh-CN")}`,
      parseMode: "Markdown",
    },
  };

  constructor(agent: Agent, botManager: EnhancedTelegramBotManager) {
    this.agent = agent;
    this.botManager = botManager;
  }

  /**
   * 初始化通知管理器，设置事件监听
   */
  public initialize(): void {
    console.log("[NotificationManager] 初始化通知管理器");

    // 监听市场洞察更新事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "MARKET_INSIGHT_UPDATED") {
        this.handleMarketInsightUpdate(evt.payload);
      }
    });

    // 监听DeFi洞察更新事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "DEFI_INSIGHT_UPDATED") {
        this.handleDefiInsightUpdate(evt.payload);
      }
    });

    // 监听内容洞察事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "CONTENT_INSIGHT_GENERATED") {
        this.handleContentInsightUpdate(evt.payload);
      }
    });

    // 监听深度搜索完成事件
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "DEEP_SEARCH_COMPLETED") {
        this.handleDeepSearchUpdate(evt.payload);
      }
    });

    // 定期检查并推送未推送的洞察
    this.setupPeriodicCheck();
  }

  /**
   * 处理市场洞察更新
   */
  private async handleMarketInsightUpdate(payload: any): Promise<void> {
    try {
      const canSend = await this.canSendNotification("MARKET_INSIGHT");
      if (!canSend) return;

      const latestInsight = await db
        .select()
        .from(insightStateTable)
        .where(eq(insightStateTable.agentId, this.agent.agentId))
        .orderBy(desc(insightStateTable.timestamp))
        .limit(1);

      if (latestInsight.length > 0) {
        await this.sendNotification("MARKET_INSIGHT", latestInsight[0]);
      }
    } catch (error) {
      console.error("[NotificationManager] 市场洞察推送失败:", error);
    }
  }

  /**
   * 处理DeFi洞察更新
   */
  private async handleDefiInsightUpdate(payload: any): Promise<void> {
    try {
      const canSend = await this.canSendNotification("DEFI_INSIGHT");
      if (!canSend) return;

      const latestDefiInsight = await db
        .select()
        .from(defiInsightTable)
        .where(eq(defiInsightTable.agentId, this.agent.agentId))
        .orderBy(desc(defiInsightTable.timestamp))
        .limit(1);

      if (latestDefiInsight.length > 0) {
        await this.sendNotification("DEFI_INSIGHT", latestDefiInsight[0]);
      }
    } catch (error) {
      console.error("[NotificationManager] DeFi洞察推送失败:", error);
    }
  }

  /**
   * 处理内容洞察更新
   */
  private async handleContentInsightUpdate(payload: any): Promise<void> {
    try {
      const canSend = await this.canSendNotification("CONTENT_INSIGHT");
      if (!canSend) return;

      // 获取最新的有价值内容洞察
      // Get insights and filter for valuable ones
      const insights = await getContentInsightsByAgent(this.agent.agentId, 5);
      const valuableInsights = insights.filter(insight => insight.hasValue === true).slice(0, 1);

      if (valuableInsights.length > 0) {
        await this.sendNotification("CONTENT_INSIGHT", valuableInsights[0]);
      }
    } catch (error) {
      console.error("[NotificationManager] 内容洞察推送失败:", error);
    }
  }

  /**
   * 处理深度搜索更新
   */
  private async handleDeepSearchUpdate(payload: any): Promise<void> {
    try {
      const canSend = await this.canSendNotification("DEEP_SEARCH");
      if (!canSend) return;

      const recentSearches = await getRecentPerplexitySearches(this.agent.agentId, 1);

      if (recentSearches.length > 0) {
        await this.sendNotification("DEEP_SEARCH", recentSearches[0]);
      }
    } catch (error) {
      console.error("[NotificationManager] 深度搜索推送失败:", error);
    }
  }

  /**
   * 发送通知
   */
  private async sendNotification(
    type: NotificationType, 
    data: any
  ): Promise<boolean> {
    try {
      const template = this.templates[type];
      const formattedMessage = template.format(data);

      const success = await this.botManager.sendMessageWithOptions(
        this.botManager.getChatId(), 
        formattedMessage,
        { parse_mode: template.parseMode || "Markdown" }
      );

      if (success) {
        // 记录通知历史
        this.recordNotification(type);
        
        // 保存到数据库
        await this.saveNotificationRecord(type, formattedMessage);
        
        console.log(`[NotificationManager] ${type} 通知发送成功`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[NotificationManager] ${type} 通知发送失败:`, error);
      return false;
    }
  }

  /**
   * 检查是否可以发送通知（基于冷却时间和频率限制）
   */
  private async canSendNotification(type: NotificationType): Promise<boolean> {
    const config = this.defaultSettings[type];
    
    if (!config.enabled) return false;

    // 检查冷却时间
    const lastTime = this.lastNotificationTime.get(type) || 0;
    const now = Date.now();
    
    if (now - lastTime < config.cooldown * 1000) {
      console.log(`[NotificationManager] ${type} 仍在冷却期内`);
      return false;
    }

    // 检查小时频率限制
    const hourAgo = now - 60 * 60 * 1000;
    const recentNotifications = this.notificationHistory.get(type) || [];
    const recentCount = recentNotifications.filter(time => time > hourAgo).length;

    if (recentCount >= config.maxPerHour) {
      console.log(`[NotificationManager] ${type} 已达到小时推送限制`);
      return false;
    }

    return true;
  }

  /**
   * 记录通知历史
   */
  private recordNotification(type: NotificationType): void {
    const now = Date.now();
    const history = this.notificationHistory.get(type) || [];
    
    // 只保留最近24小时的记录
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const filteredHistory = history.filter(time => time > dayAgo);
    
    filteredHistory.push(now);
    this.notificationHistory.set(type, filteredHistory);
    this.lastNotificationTime.set(type, now);
  }

  /**
   * 保存通知记录到数据库
   */
  private async saveNotificationRecord(
    type: NotificationType, 
    content: string
  ): Promise<void> {
    try {
      await db.insert(tgMessageTable).values({
        userId: this.agent.agentId,
        role: "system",
        content: `[${type}] ${content}`,
        messageType: "notification",
        status: "sent",
      });
    } catch (error) {
      console.error("[NotificationManager] 保存通知记录失败:", error);
    }
  }

  /**
   * 设置定期检查
   */
  private setupPeriodicCheck(): void {
    // 每10分钟检查一次是否有未推送的重要内容
    setInterval(async () => {
      await this.checkAndPushPendingNotifications();
    }, 10 * 60 * 1000);
  }

  /**
   * 检查并推送待处理的通知
   */
  private async checkAndPushPendingNotifications(): Promise<void> {
    try {
      // 检查是否有新的有价值内容洞察
      // Get insights and filter for recent valuable ones
      const recentInsights = await getContentInsightsByAgent(
        this.agent.agentId, 
        10
      );
      const recentValueInsights = recentInsights.filter(insight => insight.hasValue === true).slice(0, 3);

      for (const insight of recentValueInsights) {
        const timeSinceCreated = Date.now() - new Date(insight.createdAt).getTime();
        
        // 如果是最近30分钟内生成的，尝试推送
        if (timeSinceCreated < 30 * 60 * 1000) {
          const canSend = await this.canSendNotification("CONTENT_INSIGHT");
          if (canSend) {
            await this.sendNotification("CONTENT_INSIGHT", insight);
            break; // 一次只推送一个
          }
        }
      }
    } catch (error) {
      console.error("[NotificationManager] 定期检查失败:", error);
    }
  }

  /**
   * 获取分类emoji
   */
  private getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      "trading_idea": "💰",
      "project_intro": "🚀", 
      "market_insight": "📊",
      "none": "📝",
    };
    return emojiMap[category] || "📝";
  }

  /**
   * 手动发送系统提醒
   */
  public async sendSystemAlert(message: string): Promise<boolean> {
    return await this.sendNotification("SYSTEM_ALERT", { message });
  }

  /**
   * 更新通知设置
   */
  public updateNotificationSettings(
    type: NotificationType, 
    config: Partial<NotificationConfig>
  ): void {
    this.defaultSettings[type] = {
      ...this.defaultSettings[type],
      ...config,
    };
  }

  /**
   * 获取通知统计
   */
  public getNotificationStats(): Record<NotificationType, number> {
    const stats: Record<NotificationType, number> = {} as any;
    
    for (const type of Object.keys(this.defaultSettings) as NotificationType[]) {
      const history = this.notificationHistory.get(type) || [];
      const hourAgo = Date.now() - 60 * 60 * 1000;
      stats[type] = history.filter(time => time > hourAgo).length;
    }
    
    return stats;
  }
}

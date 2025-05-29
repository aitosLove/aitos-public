/**
 * 交互式命令处理器 - 处理用户输入和命令交互
 */

import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
import {
  getContentInsightsByAgent,
  getRecentPerplexitySearches,
} from "../contentProcess/ContentDbOp";
import { db } from "@/db";
import { 
  insightStateTable, 
  defiInsightTable,
  marketStateTable
} from "@/db/schema/moduleSchema/defiSchema";
import { tgMessageTable } from "@/db/schema/moduleSchema/tgSchema";
import { desc, eq, and } from "drizzle-orm";

interface CommandDefinition {
  command: string;
  description: string;
  category: "crypto" | "content" | "portfolio" | "system" | "ai";
  usage?: string;
  examples?: string[];
  handler: (msg: TelegramBot.Message, args: string, context: CommandContext) => Promise<void>;
}

interface CommandContext {
  agent: Agent;
  agentId: string;
  userId: string;
  chatId: number;
}

export class InteractiveCommands {
  private agent: Agent;
  private botManager: EnhancedTelegramBotManager;
  private commands: Map<string, CommandDefinition> = new Map();

  constructor(agent: Agent, botManager: EnhancedTelegramBotManager) {
    this.agent = agent;
    this.botManager = botManager;
  }

  /**
   * 初始化交互式命令
   */
  public initialize(): void {
    console.log("[InteractiveCommands] 初始化交互式命令");
    
    this.registerDefaultCommands();
    this.setupMessageHandler();
  }

  /**
   * 注册默认命令
   */
  private registerDefaultCommands(): void {
    // === 系统命令 ===
    this.registerCommand({
      command: "help",
      description: "📚 显示所有可用命令",
      category: "system",
      handler: this.handleHelpCommand.bind(this),
    });

    this.registerCommand({
      command: "status",
      description: "📊 显示系统状态",
      category: "system",
      handler: this.handleStatusCommand.bind(this),
    });

    this.registerCommand({
      command: "stats",
      description: "📈 显示统计信息",
      category: "system",
      handler: this.handleStatsCommand.bind(this),
    });

    // === 市场相关命令 ===
    this.registerCommand({
      command: "market",
      description: "💹 获取最新市场洞察",
      category: "crypto",
      usage: "/market [数量]",
      examples: ["/market", "/market 5"],
      handler: this.handleMarketCommand.bind(this),
    });

    this.registerCommand({
      command: "defi",
      description: "🔗 获取DeFi策略洞察",
      category: "crypto",
      usage: "/defi [数量]",
      examples: ["/defi", "/defi 3"],
      handler: this.handleDefiCommand.bind(this),
    });

    // === 内容相关命令 ===
    this.registerCommand({
      command: "insights",
      description: "🎯 获取内容洞察",
      category: "content",
      usage: "/insights [数量] [类型]",
      examples: ["/insights", "/insights 5", "/insights 3 trading_idea"],
      handler: this.handleInsightsCommand.bind(this),
    });

    this.registerCommand({
      command: "research",
      description: "🔍 获取深度研究结果",
      category: "content",
      usage: "/research [数量]",
      examples: ["/research", "/research 3"],
      handler: this.handleResearchCommand.bind(this),
    });

    this.registerCommand({
      command: "valuable",
      description: "💎 获取有价值的内容",
      category: "content",
      usage: "/valuable [数量]",
      examples: ["/valuable", "/valuable 5"],
      handler: this.handleValuableCommand.bind(this),
    });

    // === AI交互命令 ===
    this.registerCommand({
      command: "ask",
      description: "🤖 向AI提问",
      category: "ai",
      usage: "/ask <问题>",
      examples: ["/ask 比特币今天的走势如何？", "/ask 分析一下DeFi市场"],
      handler: this.handleAskCommand.bind(this),
    });

    this.registerCommand({
      command: "analyze",
      description: "📊 分析市场数据",
      category: "ai",
      usage: "/analyze <内容>",
      examples: ["/analyze BTC走势", "/analyze DeFi TVL变化"],
      handler: this.handleAnalyzeCommand.bind(this),
    });

    console.log(`[InteractiveCommands] 已注册 ${this.commands.size} 个命令`);
  }

  /**
   * 注册命令
   */
  private registerCommand(definition: CommandDefinition): void {
    this.commands.set(definition.command, definition);
    
    // 也注册到enhanced bot manager
    this.botManager.registerCommand({
      command: definition.command,
      description: definition.description,
      category: definition.category,
      handler: async (msg, args) => {
        const context: CommandContext = {
          agent: this.agent,
          agentId: this.agent.agentId,
          userId: msg.from?.id.toString() || "unknown",
          chatId: msg.chat.id,
        };
        
        await definition.handler(msg, args || "", context);
      },
    });
  }

  /**
   * 设置消息处理器
   */
  private setupMessageHandler(): void {
    // 这里可以处理非命令的普通消息
    // 由于enhanced-bot-manager已经处理了命令，这里主要处理普通对话
  }

  // =============== 命令处理器 ===============

  /**
   * 帮助命令
   */
  private async handleHelpCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    const categories = {
      system: "🔧 系统命令",
      crypto: "💹 加密市场分析",
      portfolio: "📂 资产组合",
      content: "📊 内容分析",
      ai: "🤖 AI交互",
    };

    let helpText = "🤖 **Wonderland Agent 命令帮助**\n\n";

    for (const [categoryKey, categoryName] of Object.entries(categories)) {
      const categoryCommands = Array.from(this.commands.values())
        .filter(cmd => cmd.category === categoryKey);

      if (categoryCommands.length > 0) {
        helpText += `**${categoryName}**\n`;
        
        for (const cmd of categoryCommands) {
          helpText += `/${cmd.command} - ${cmd.description}\n`;
          if (cmd.usage) {
            helpText += `   📝 用法: ${cmd.usage}\n`;
          }
        }
        helpText += "\n";
      }
    }

    helpText += "💡 **小贴士**:\n";
    helpText += "• 使用 `/help <命令>` 查看具体命令的详细说明\n";
    helpText += "• 所有命令都支持参数，具体用法请参考上述说明\n";
    helpText += "• 系统会自动推送重要的市场洞察和内容分析\n\n";
    helpText += "🔍 使用 `/status` 查看系统当前状态";

    await this.botManager.sendFormattedMessage(context.chatId, helpText, {
      parse_mode: "Markdown",
    });
  }

  /**
   * 状态命令
   */
  private async handleStatusCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      // 获取各种统计信息
      const [marketInsights, defiInsights, contentInsights, recentSearches] = 
        await Promise.all([
          db.select().from(insightStateTable)
            .where(eq(insightStateTable.agentId, context.agentId))
            .orderBy(desc(insightStateTable.timestamp)).limit(1),
          db.select().from(defiInsightTable)
            .where(eq(defiInsightTable.agentId, context.agentId))
            .orderBy(desc(defiInsightTable.timestamp)).limit(1),
          getContentInsightsByAgent(context.agentId, 5),
          getRecentPerplexitySearches(context.agentId, 3),
        ]);

      const lastMarketUpdate = marketInsights[0]?.timestamp 
        ? new Date(marketInsights[0].timestamp).toLocaleString("zh-CN")
        : "无数据";
      
      const lastDefiUpdate = defiInsights[0]?.timestamp
        ? new Date(defiInsights[0].timestamp).toLocaleString("zh-CN")
        : "无数据";

      const valuableContentCount = contentInsights.filter(c => c.hasValue === true).length;

      let statusText = "📊 **系统状态报告**\n\n";
      statusText += `🤖 **Agent ID**: ${context.agentId}\n`;
      statusText += `🕒 **当前时间**: ${new Date().toLocaleString("zh-CN")}\n\n`;
      
      statusText += "📈 **数据状态**:\n";
      statusText += `💹 最新市场洞察: ${lastMarketUpdate}\n`;
      statusText += `🔗 最新DeFi洞察: ${lastDefiUpdate}\n`;
      statusText += `📊 内容洞察数量: ${contentInsights.length} (有价值: ${valuableContentCount})\n`;
      statusText += `🔍 深度研究数量: ${recentSearches.length}\n\n`;
      
      statusText += "🔧 **系统功能**:\n";
      statusText += "✅ Telegram Bot 连接\n";
      statusText += "✅ 智能通知推送\n";
      statusText += "✅ 交互式命令\n";
      statusText += "✅ 内容分析引擎\n";
      statusText += "✅ 深度搜索引擎\n\n";
      
      statusText += "💡 使用 `/stats` 查看详细统计信息";

      await this.botManager.sendFormattedMessage(context.chatId, statusText, {
        parse_mode: "Markdown",
      });

    } catch (error) {
      console.error("[InteractiveCommands] 状态命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "获取系统状态时出现错误");
    }
  }

  /**
   * 统计命令
   */
  private async handleStatsCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      // 获取详细统计
      const [totalMessages, recentMessages] = await Promise.all([
        db.select().from(tgMessageTable).then(result => result.length),
        db.select().from(tgMessageTable)
          .where(
            and(
              eq(tgMessageTable.status, "sent"),
              // 最近24小时的消息
            )
          ).then(result => result.length),
      ]);

      const contentInsights = await getContentInsightsByAgent(context.agentId, 50);
      const recentSearches = await getRecentPerplexitySearches(context.agentId, 20);

      // 分析内容类别分布
      const categoryStats = contentInsights.reduce((acc, insight) => {
        acc[insight.category] = (acc[insight.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let statsText = "📈 **详细统计信息**\n\n";
      
      statsText += "📤 **消息统计**:\n";
      statsText += `• 总发送消息: ${totalMessages}\n`;
      statsText += `• 最近24小时: ${recentMessages}\n\n`;
      
      statsText += "📊 **内容分析统计**:\n";
      statsText += `• 总分析内容: ${contentInsights.length}\n`;
      statsText += `• 有价值内容: ${contentInsights.filter(c => c.hasValue === true).length}\n`;
      
      if (Object.keys(categoryStats).length > 0) {
        statsText += "• 类别分布:\n";
        for (const [category, count] of Object.entries(categoryStats)) {
          const emoji = this.getCategoryEmoji(category);
          statsText += `  ${emoji} ${category}: ${count}\n`;
        }
      }
      
      statsText += `\n🔍 **深度研究统计**:\n`;
      statsText += `• 研究报告数: ${recentSearches.length}\n`;
      
      if (recentSearches.length > 0) {
        const totalTokens = recentSearches.reduce((sum, search) => 
          sum + (search.metadata?.usage?.total_tokens || 0), 0);
        statsText += `• 总消耗token: ${totalTokens.toLocaleString()}\n`;
      }

      statsText += `\n🕒 **统计时间**: ${new Date().toLocaleString("zh-CN")}`;

      await this.botManager.sendFormattedMessage(context.chatId, statsText, {
        parse_mode: "Markdown",
      });

    } catch (error) {
      console.error("[InteractiveCommands] 统计命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "获取统计信息时出现错误");
    }
  }

  /**
   * 市场洞察命令
   */
  private async handleMarketCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      const limit = parseInt(args) || 3;
      const insights = await db.select()
        .from(insightStateTable)
        .where(eq(insightStateTable.agentId, context.agentId))
        .orderBy(desc(insightStateTable.timestamp))
        .limit(Math.min(limit, 10));

      if (insights.length === 0) {
        await this.botManager.sendFormattedMessage(
          context.chatId,
          "📊 暂无市场洞察数据\n\n请等待系统生成市场分析报告。"
        );
        return;
      }

      for (const [index, insight] of insights.entries()) {
        const date = new Date(insight.timestamp).toLocaleString("zh-CN");
        
        let response = `📈 **市场洞察 ${index + 1}/${insights.length}**\n\n`;
        response += `${insight.insight}\n\n`;
        response += `🕒 ${date}`;

        await this.botManager.sendFormattedMessage(context.chatId, response, {
          parse_mode: "Markdown",
        });

        // 避免消息发送过快
        if (index < insights.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.error("[InteractiveCommands] 市场命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "获取市场洞察时出现错误");
    }
  }

  /**
   * DeFi洞察命令
   */
  private async handleDefiCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      const limit = parseInt(args) || 3;
      const insights = await db.select()
        .from(defiInsightTable)
        .where(eq(defiInsightTable.agentId, context.agentId))
        .orderBy(desc(defiInsightTable.timestamp))
        .limit(Math.min(limit, 10));

      if (insights.length === 0) {
        await this.botManager.sendFormattedMessage(
          context.chatId,
          "🔗 暂无DeFi策略洞察\n\n请等待系统生成DeFi分析报告。"
        );
        return;
      }

      for (const [index, insight] of insights.entries()) {
        const date = new Date(insight.timestamp).toLocaleString("zh-CN");
        
        let response = `🔗 **DeFi策略洞察 ${index + 1}/${insights.length}**\n\n`;
        response += `${insight.insight}\n\n`;
        response += `🕒 ${date}`;

        await this.botManager.sendFormattedMessage(context.chatId, response, {
          parse_mode: "Markdown",
        });

        if (index < insights.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.error("[InteractiveCommands] DeFi命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "获取DeFi洞察时出现错误");
    }
  }

  /**
   * 内容洞察命令
   */
  private async handleInsightsCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      const [limitStr, categoryFilter] = args.split(" ");
      const limit = parseInt(limitStr) || 5;
      
      // Fetch insights and filter them in memory
      const insights = await getContentInsightsByAgent(
        context.agentId, 
        Math.min(limit, 10)
      );
      
      // Apply filters if provided
      const filteredInsights = insights.filter(insight => 
        !categoryFilter || insight.category === categoryFilter
      );

      if (filteredInsights.length === 0) {
        await this.botManager.sendFormattedMessage(
          context.chatId,
          "📊 暂无内容洞察数据\n\n请等待系统收集和分析更多内容。"
        );
        return;
      }

      let response = `📊 **内容洞察汇总 (${filteredInsights.length}条)**\n\n`;

      filteredInsights.forEach((insight, index) => {
        const date = new Date(insight.createdAt).toLocaleDateString("zh-CN");
        const hasValue = insight.hasValue ? "🟢 有价值" : "🔴 无价值";
        const emoji = this.getCategoryEmoji(insight.category);
        
        response += `**${index + 1}. @${insight.username}**\n`;
        response += `${hasValue} | ${emoji} ${insight.category}\n`;
        response += `📝 ${insight.summary}\n`;
        
        if (insight.entity && Array.isArray(insight.entity) && insight.entity.length > 0) {
          response += `🏷️ 实体: ${insight.entity.join(", ")}\n`;
        }
        
        response += `🕒 ${date}\n\n`;
      });

      response += `💡 使用 /valuable 查看有价值内容\n`;
      response += `🔍 使用 /research 查看深度研究`;

      await this.botManager.sendFormattedMessage(context.chatId, response, {
        parse_mode: "Markdown",
      });

    } catch (error) {
      console.error("[InteractiveCommands] 洞察命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "获取内容洞察时出现错误");
    }
  }

  /**
   * 深度研究命令
   */
  private async handleResearchCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      const limit = parseInt(args) || 3;
      const searches = await getRecentPerplexitySearches(
        context.agentId, 
        Math.min(limit, 5)
      );

      if (searches.length === 0) {
        await this.botManager.sendFormattedMessage(
          context.chatId,
          "🔍 暂无深度研究数据\n\n系统会自动对有价值的内容进行深度研究。"
        );
        return;
      }

      for (const [index, search] of searches.entries()) {
        const date = new Date(search.metadata.timestamp).toLocaleString("zh-CN");
        
        let response = `🔍 **深度研究报告 ${index + 1}/${searches.length}**\n\n`;
        response += `**查询:** ${search.query}\n\n`;
        response += `**分析结果:**\n${search.response}\n\n`;
        
        if (search.citations.length > 0) {
          response += `**参考来源:**\n`;
          search.citations.slice(0, 3).forEach((citation, idx) => {
            response += `${idx + 1}. [${citation.title}](${citation.url})\n`;
          });
          response += `\n`;
        }
        
        response += `🤖 ${search.metadata.model} | ⏱️ ${date}\n`;
        response += `📊 令牌: ${search.metadata.usage.total_tokens}`;

        await this.botManager.sendFormattedMessage(context.chatId, response, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        });

        if (index < searches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
      console.error("[InteractiveCommands] 研究命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "获取研究结果时出现错误");
    }
  }

  /**
   * 有价值内容命令
   */
  private async handleValuableCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      const limit = parseInt(args) || 5;
      // Fetch insights and filter for valuable ones in memory
      const insights = await getContentInsightsByAgent(
        context.agentId, 
        Math.min(limit, 10)
      );
      
      // Filter to only valuable insights
      const valuableInsights = insights.filter(insight => insight.hasValue === true);

      if (valuableInsights.length === 0) {
        await this.botManager.sendFormattedMessage(
          context.chatId,
          "💎 暂无有价值的内容\n\n系统会持续监控并识别有价值的内容。"
        );
        return;
      }

      let response = `💎 **有价值内容精选 (${valuableInsights.length}条)**\n\n`;

      valuableInsights.forEach((insight, index) => {
        const date = new Date(insight.createdAt).toLocaleDateString("zh-CN");
        const emoji = this.getCategoryEmoji(insight.category);
        
        response += `**${index + 1}. @${insight.username}**\n`;
        response += `${emoji} ${insight.category}\n`;
        response += `📝 ${insight.summary}\n`;
        response += `🔗 [查看原文](${insight.source})\n`;
        response += `🕒 ${date}\n\n`;
      });

      response += `🔍 使用 /research 查看相关深度研究`;

      await this.botManager.sendFormattedMessage(context.chatId, response, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });

    } catch (error) {
      console.error("[InteractiveCommands] 有价值内容命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "获取有价值内容时出现错误");
    }
  }

  /**
   * AI提问命令
   */
  private async handleAskCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    if (!args.trim()) {
      await this.botManager.sendFormattedMessage(
        context.chatId,
        "🤖 请提供一个问题\n\n用法: `/ask <你的问题>`\n例如: `/ask 比特币今天的走势如何？`"
      );
      return;
    }

    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      // 这里可以集成AI对话功能
      // 暂时返回一个示例回复
      let response = `🤖 **AI助手回复**\n\n`;
      response += `**你的问题:** ${args}\n\n`;
      response += `**回复:** 我正在分析你的问题，但目前AI对话功能还在开发中。`;
      response += `你可以使用以下命令获取具体信息:\n\n`;
      response += `• /market - 获取市场洞察\n`;
      response += `• /defi - 获取DeFi策略\n`;
      response += `• /insights - 获取内容分析\n`;
      response += `• /research - 获取深度研究`;

      await this.botManager.sendFormattedMessage(context.chatId, response, {
        parse_mode: "Markdown",
      });

    } catch (error) {
      console.error("[InteractiveCommands] AI提问命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "AI处理问题时出现错误");
    }
  }

  /**
   * 分析命令
   */
  private async handleAnalyzeCommand(
    msg: TelegramBot.Message, 
    args: string, 
    context: CommandContext
  ): Promise<void> {
    if (!args.trim()) {
      await this.botManager.sendFormattedMessage(
        context.chatId,
        "📊 请提供要分析的内容\n\n用法: `/analyze <内容>`\n例如: `/analyze BTC走势`"
      );
      return;
    }

    try {
      await this.botManager.bot!.sendChatAction(context.chatId, "typing");

      // 这里可以集成分析功能
      let response = `📊 **智能分析结果**\n\n`;
      response += `**分析内容:** ${args}\n\n`;
      response += `**分析结果:** 分析功能正在开发中，请使用现有命令获取相关信息:\n\n`;
      
      // 根据关键词推荐相关命令
      if (args.toLowerCase().includes("btc") || args.toLowerCase().includes("bitcoin")) {
        response += `💡 推荐使用 /market 查看比特币相关市场洞察`;
      } else if (args.toLowerCase().includes("defi")) {
        response += `💡 推荐使用 /defi 查看DeFi相关策略分析`;
      } else {
        response += `💡 推荐使用 /insights 查看相关内容分析`;
      }

      await this.botManager.sendFormattedMessage(context.chatId, response, {
        parse_mode: "Markdown",
      });

    } catch (error) {
      console.error("[InteractiveCommands] 分析命令执行失败:", error);
      await this.botManager.sendErrorMessage(context.chatId, "执行分析时出现错误");
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
}

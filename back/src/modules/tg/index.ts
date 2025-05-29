import { Agent } from "@/src/agent";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
import { EnhancedTelegramModule } from "./enhanced-telegram-module";
import { registerInsightCommands } from "./handle-commands";

/**
 * 启用增强版 Telegram 模块
 * @param agent Agent 实例
 * @returns EnhancedTelegramModule 实例
 */
export async function enableEnhancedTelegramModule(
  agent: Agent
): Promise<EnhancedTelegramModule> {
  console.log("🚀 启用增强版 Telegram 模块...");

  const telegramModule = EnhancedTelegramModule.getInstance(agent, {
    enableNotifications: true,
    enableInteractiveCommands: true,
    enableInteractionFlows: true,
    enableContextManagement: true,
    autoStartBot: true,
    debugMode: process.env.NODE_ENV === "development",
    aiChatEnabled: true,
  });
  
  try {
    // 初始化增强模块
    await telegramModule.initialize();
    
    // 注册传统的洞察命令（向后兼容）
    const botManager = telegramModule.getBotManager();
    registerInsightCommands(botManager as any);
    
    console.log("✅ 增强版 Telegram 模块启用成功");
    console.log("📱 支持的功能:");
    console.log("  - 🤖 AI智能对话（支持上下文记忆）");
    console.log("  - 🔄 交互式流程管理");
    console.log("  - 🧠 智能上下文分析");
    console.log("  - 📊 内容洞察分析");
    console.log("  - 🔍 深度研究报告");
    console.log("  - ⚡ 实时系统状态");
    console.log("  - 🔔 智能通知推送");
    console.log("  - ⏳ 命令冷却机制");
    console.log("  - 📝 完整对话历史");
    console.log("  - 👤 个性化用户体验");
    
    return telegramModule;
  } catch (error) {
    console.error("❌ 增强版 Telegram 模块启用失败:", error);
    throw error;
  }
}

// 导出相关类型和管理器
export { EnhancedTelegramModule } from "./enhanced-telegram-module";
export { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
export { NotificationManager } from "./notification-manager";
export { InteractiveCommands } from "./interactive-commands";
export { InteractionFlowManager } from "./interaction-flow-manager";
export { ContextManager } from "./context-manager";
export { registerInsightCommands } from "./handle-commands";

// 为了向后兼容，也导出原始的 TelegramBotManager
export { TelegramBotManager } from "./bot_manager";

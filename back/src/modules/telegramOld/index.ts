/**
 * 精简版 Telegram 模块入口
 * 专注于 Telegram 信息交互
 */

import { Agent } from "@/src/agent";
import { SimpleTelegramBot } from "./simple-telegram-bot";

export interface TelegramModuleConfig {
  token: string;
  chatId: number;
}

export interface TelegramModule {
  bot: SimpleTelegramBot;
  start: () => void;
  stop: () => void;
}

/**
 * 启用精简版 Telegram 模块
 */
export function enableSimpleTelegramModule(
  agent: Agent, 
  config?: TelegramModuleConfig
): TelegramModule {
  console.log("🤖 启用精简版 Telegram 模块...");

  // 从环境变量或配置获取参数
  const token = config?.token || process.env.TELEGRAM_TOKEN;
  const chatId = config?.chatId || parseInt(process.env.USER_CHAT_ID || '0');

  if (!token) {
    throw new Error("TELEGRAM_TOKEN 环境变量未设置");
  }

  if (!chatId) {
    throw new Error("USER_CHAT_ID 环境变量未设置");
  }

  // 创建精简版机器人
  const bot = new SimpleTelegramBot(agent, token, chatId);

  console.log(`✅ 精简版 Telegram 模块已启用 (Chat ID: ${chatId})`);

  return {
    bot,
    start: () => bot.start(),
    stop: () => bot.stop()
  };
}

// 导出主要组件
export { SimpleTelegramBot };

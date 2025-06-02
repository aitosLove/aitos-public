/**
 * 精简版 Telegram 模块入口
 * 专注于 Telegram 信息交互
 */

import { Agent } from "@/src/agent";
import { SimplifiedTelegramBot } from "./simplified-telegram-bot";

export interface TelegramModuleConfig {
  telegramToken?: string;
  userChatId?: string;
}

/**
 * 启用精简版 Telegram 模块
 */
export async function enableSimplifiedTelegramModule(
  agent: Agent,
  config?: TelegramModuleConfig
): Promise<SimplifiedTelegramBot> {
  console.log("🚀 启用精简版 Telegram 模块...");

  // 获取配置
  const telegramToken = config?.telegramToken || process.env.TELEGRAM_TOKEN;
  const userChatId = config?.userChatId || process.env.USER_CHAT_ID;

  if (!telegramToken) {
    throw new Error("TELEGRAM_TOKEN 环境变量未设置");
  }

  if (!userChatId) {
    throw new Error("USER_CHAT_ID 环境变量未设置");
  }

  // 创建 Telegram Bot 实例
  const telegramBot = new SimplifiedTelegramBot(agent, {
    token: telegramToken,
    chatId: userChatId,
    agentId: agent.agentId
  });

  // 启动机器人
  await telegramBot.start();

  console.log("✅ 精简版 Telegram 模块启用成功");
  return telegramBot;
}

export { SimplifiedTelegramBot };

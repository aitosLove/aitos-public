// src/modules/telegram/bot-manager.ts
import TelegramBot from "node-telegram-bot-api";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";

export class TelegramBotManager {
  private static instance: TelegramBotManager;
  private bot: TelegramBot | null = null;
  private chatId: string;
  private token: string;

  private constructor() {
    this.token = process.env.TELEGRAM_TOKEN!;
    this.chatId = process.env.USER_CHAT_ID!;
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
      throw new Error(
        "Missing Telegram config. Required ENV vars: TELEGRAM_TOKEN, USER_CHAT_ID"
      );
    }
  }

  public initializeBot(agent: Agent) {
    if (!this.bot) {
      const proxyAgent = new HttpsProxyAgent("http://127.0.0.1:6789");

      this.bot = new TelegramBot(this.token, {
        polling: true,
        // 这个类型还没修
        request: {
          agent: proxyAgent,
          timeout: 30000,
        },
      });

      this.registerSystemListeners(agent);
    }
    return this.bot;
  }

  registerSystemListeners(agent: Agent) {
    agent.sensing.registerListener((evt: AgentEvent) => {});
  }

  public async sendMessage(content: string) {
    if (!this.bot) {
      throw new Error("Telegram bot not initialized");
    }

    try {
      await this.bot.sendMessage(this.chatId, content);
      return true;
    } catch (error) {
      console.error("[Telegram] Message send failed:", error);
      return false;
    }
  }
}

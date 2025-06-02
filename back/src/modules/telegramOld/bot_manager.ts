// src/modules/telegram/bot-manager.ts
import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import { chat_bot } from "./chat_bot";

// Define command handler interface
interface CommandHandler {
  command: string;
  description: string;
  handler: (msg: TelegramBot.Message, args?: string) => Promise<void>;
}

export class TelegramBotManager {
  private static instance: TelegramBotManager;
  public bot: TelegramBot | null = null;
  private chatId: string;
  private token: string;
  private commandHandlers: CommandHandler[] = [];

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
      this.bot = new TelegramBot(this.token, {
        polling: true,
      });

      this.registerSystemListeners(agent);
      this.registerDefaultCommands();
      this.registerCommandHandler(agent);
    }
    return this.bot;
  }

  registerSystemListeners(agent: Agent) {
    agent.sensing.registerListener((evt: AgentEvent) => {
      // Handle agent events here
      console.log("Agent event received:", evt);
    });
  }

  emitSystemEvents(agent: Agent) {
    agent.sensing.emitEvent({
      type: "TELEGRAM_REQUEST",
      description: "User requests from telegram, agent should respond.",
      payload: {},
      timestamp: Date.now(),
    });
  }

  // Register default commands
  private registerDefaultCommands() {
    // Register help command
    this.registerCommand({
      command: "help",
      description: "Show available commands",
      handler: async (msg) => {
        const helpText = this.generateHelpText();
        await this.bot!.sendMessage(msg.chat.id, helpText);
      },
    });
    
    this.registerCommand({
      command: "echo",
      description: "Repeats the message you sent",
      handler: async (msg, args) => {
        const usageMessage = args || "Empty message";
        await this.bot!.sendMessage(msg.chat.id, chat_bot(usageMessage));
      },
    });

    
  }

  // Register command handler to process incoming messages
  private registerCommandHandler(agent: Agent) {
    if (!this.bot) return;

    // Process all incoming messages
    this.bot.on("message", async (msg) => {
      // Check if the message is a command
      if (msg.text && msg.text.startsWith("/")) {
        const [commandText, ...args] = msg.text.slice(1).split(" ");
        const commandName = commandText.toLowerCase();

        // Find the appropriate handler
        const handler = this.commandHandlers.find(
          (h) => h.command === commandName
        );

        if (handler) {
          console.log(`[Telegram] Executing command: ${commandName}`);
          this.emitSystemEvents(agent);
          try {
            await handler.handler(msg, args.join(" "));
          } catch (error) {
            console.error(
              `[Telegram] Error executing command ${commandName}:`,
              error
            );

            if (error instanceof Error) {
              await this.bot!.sendMessage(
                msg.chat.id,
                `Error executing command: ${error.message}`
              );
            } else {
              await this.bot!.sendMessage(
                msg.chat.id,
                `Error executing command: An unknown error occurred`
              );
            }
          }
        } else {
          // Unknown command
          await this.bot!.sendMessage(
            msg.chat.id,
            `Unknown command: ${commandName}. Use /help to see available commands.`
          );
        }
      } else {
        // Handle regular messages
        console.log(`[Telegram] Received message: ${msg.text}`);
        // Implement your message handling logic here
      }
    });
  }

  // Register a new command
  public registerCommand(handler: CommandHandler) {
    this.commandHandlers.push(handler);
    console.log(`[Telegram] Registered command: ${handler.command}`);
  }

  // Generate help text from registered commands
  private generateHelpText(): string {
    let helpText = "🤖 <b>Available Commands</b>\n\n";

    this.commandHandlers.forEach((handler) => {
      helpText += `/${handler.command} - ${handler.description}\n`;
    });

    return helpText;
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

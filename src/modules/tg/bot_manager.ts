// src/modules/telegram/bot-manager.ts
import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";

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
      this.registerDefaultCommands(agent);
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
  private registerDefaultCommands(agent: Agent) {
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
      command: "start",
      description: "Start chat with the bot",
      handler: async (msg) => {
        const welcomeMessage =
          "Welcome to the Aitos Bot! Use /help to see available commands.";
        await this.bot!.sendMessage(msg.chat.id, welcomeMessage);
      },
    });

    this.registerCommand({
      command: "chat",

      description: "Chat with the bot",
      handler: async (msg, args) => {
        const usageMessage = args || "Empty Message";

        const reply = await agent.thinking.response({
          input: usageMessage,
          model: "large",
          platform: "qwen",
          systemPrompt:
            "You are a professional crypto assistant. Your name is Aitos.",
        });
        await this.bot!.sendMessage(msg.chat.id, reply);
      },
    });

    this.registerCommand({
      command: "refresh_market_insight",
      description: "Refresh market insight",
      handler: async (msg) => {
        agent.sensing.emitEvent({
          type: "UPDATE_Rate_EVENT",
          description: "Agent should update market insight",
          payload: {},
          timestamp: Date.now(),
        });
        await this.bot!.sendMessage(msg.chat.id, "Market insight refreshed.");
      },
    });

    this.registerCommand({
      command: "adjust_portfolio",
      description: "Adjust your portfolio right now",
      handler: async (msg) => {
        agent.sensing.emitEvent({
          type: "UPDATE_PORTFOLIO_EVENT",
          description: "Agent should update portfolio",
          payload: {},
          timestamp: Date.now(),
        });
        await this.bot!.sendMessage(
          msg.chat.id,
          "Portfolio is adjusting. Please wait."
        );
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
          // await this.bot!.sendMessage(
          //   msg.chat.id,
          //   `Unknown command: ${commandName}. Use /help to see available commands.`
          // );
        }
      } else {
        // Handle regular messages
        // console.log(`[Telegram] Received message: ${msg.text}`);
        // Implement your message handling logic here

        const reply = await agent.thinking.response({
          input: msg.text || "Empty Message",
          model: "large",
          platform: "qwen",
          systemPrompt: `
You are a professional crypto assistant on Aptos blockchain. Your name is AITOS. You can answer question about Aptos and AITOS. 

AITOS is an easy-to-use, automated, and scalable AI assistant on Aptos. AITOS allows users to easily per form functions such as
- Analysis
- Investment
- Defi Management
- etc.
on the Aptos blockchain without needing any prior blockchain-related knowledge and without requiring excessive effort.
In a word, select modules you need and deposit to your wallet, then dive into Aptos.


And, you can remind user to use these command to control their AITOS agent:
- /market_insight - Get newest insight of Aptos Market
- /refresh_market_insight - Refresh market insight stored in Aitos
- /adjust_portfolio - Adjust your portfolio right now`,
        });
        await this.bot!.sendMessage(msg.chat.id, reply);
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

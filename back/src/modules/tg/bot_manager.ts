// src/modules/telegram/bot-manager.ts
import TelegramBot from "node-telegram-bot-api";
import { HttpsProxyAgent } from "https-proxy-agent";
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
      const proxyAgent = new HttpsProxyAgent("http://127.0.0.1:6789");

      this.bot = new TelegramBot(this.token, {
        polling: true,
        // @ts-ignore
        request: {
          agent: proxyAgent,
          timeout: 30000,
        },
      });

      this.registerSystemListeners(agent);
      this.registerDefaultCommands();
      this.registerCommandHandler();
    }
    return this.bot;
  }

  registerSystemListeners(agent: Agent) {
    agent.sensing.registerListener((evt: AgentEvent) => {
      // Handle agent events here
      console.log("Agent event received:", evt);
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
      }
    });

    // Register test command
    // this.registerCommand({
    //   command: "test",
    //   description: "Run a test command to verify bot functionality",
    //   handler: async (msg, args) => {
    //     const testMessage = args 
    //       ? `Test command executed with args: ${args}` 
    //       : "Test command executed successfully!";
          
    //     console.log(`[Telegram] Test command executed by user ${msg.from?.username || msg.from?.id}`);
        
    //     // Create a mock response with system details
    //     const mockSystemInfo = {
    //       status: "operational",
    //       uptime: "3 days, 7 hours",
    //       memory: "512MB / 2GB used",
    //       connections: 3,
    //       timestamp: new Date().toISOString()
    //     };
        
    //     const response = `✅ ${testMessage}\n\n` +
    //       `🤖 *System Info*\n` +
    //       `Status: ${mockSystemInfo.status}\n` +
    //       `Uptime: ${mockSystemInfo.uptime}\n` +
    //       `Memory: ${mockSystemInfo.memory}\n` +
    //       `Active connections: ${mockSystemInfo.connections}\n` +
    //       `Timestamp: ${mockSystemInfo.timestamp}`;
          
    //     await this.bot!.sendMessage(msg.chat.id, response, { parse_mode: "Markdown" });
    //   }
    // });
  }

  // Register command handler to process incoming messages
  private registerCommandHandler() {
    if (!this.bot) return;

    // Process all incoming messages
    this.bot.on("message", async (msg) => {
      // Check if the message is a command
      if (msg.text && msg.text.startsWith("/")) {
        const [commandText, ...args] = msg.text.slice(1).split(" ");
        const commandName = commandText.toLowerCase();
        
        // Find the appropriate handler
        const handler = this.commandHandlers.find(h => h.command === commandName);
        
        if (handler) {
          console.log(`[Telegram] Executing command: ${commandName}`);
          try {
            await handler.handler(msg, args.join(" "));
          } catch (error) {
            console.error(`[Telegram] Error executing command ${commandName}:`, error);
            await this.bot!.sendMessage(msg.chat.id, `Error executing command: ${error.message}`);
          }
        } else {
          // Unknown command
          await this.bot!.sendMessage(msg.chat.id, `Unknown command: ${commandName}. Use /help to see available commands.`);
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
    
    this.commandHandlers.forEach(handler => {
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
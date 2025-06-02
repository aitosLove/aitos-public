// src/modules/telegram/insight-commands.ts
import { TelegramBotManager } from "./bot_manager";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
import {
  insightInstructTable,
  defiInsightTable,
  insightStateTable,
} from "@/db/schema/moduleSchema/defiSchema";
import { db } from "@/db";
import { desc } from "drizzle-orm";
import { tgMessageTable } from "@/db/schema/moduleSchema/tgSchema";

// Create a type that includes common methods between both bot manager implementations
type BotManagerWithCommands = {
  registerCommand: (handler: {
    command: string;
    description: string;
    handler: (msg: any, args?: string) => Promise<void>;
  }) => void;
  sendMessage: (content: string) => Promise<boolean>;
  sendMessageWithOptions?: (chatId: number | string, message: string, options?: any) => Promise<any>;
  bot?: any;
};

// Define a compatible function signature
export function registerInsightCommands(botManager: BotManagerWithCommands) {
  // Command to get the latest instruct insight
  botManager.registerCommand({
    command: "market_insight",
    description: "Get the latest market insight",
    handler: async (msg) => {
      try {
        const latestInstruct = await db
          .select()
          .from(insightStateTable)
          .orderBy(desc(insightStateTable.timestamp))
          .limit(1);

        if (latestInstruct && latestInstruct.length > 0) {
          const insight = latestInstruct[0].insight;

          // Send insight to user
          const messageContent = `📊 **最新市场洞察**\n\n${insight}`;
          
          // Different bot managers might have different ways to send messages
          if (botManager.sendMessageWithOptions) {
            await botManager.sendMessageWithOptions(
              msg.chat.id, 
              messageContent,
              { parse_mode: "Markdown" }
            );
          } else {
            await botManager.sendMessage(messageContent);
          }

          // Store the insight message in the database
          await storeMessageRecord({ content: insight });
        } else {
          if (botManager.sendMessageWithOptions) {
            await botManager.sendMessageWithOptions(
              msg.chat.id,
              "No market insights available at the moment."
            );
          } else {
            await botManager.sendMessage("No market insights available at the moment.");
          }
        }
      } catch (error) {
        console.error("[Telegram] Error fetching market insight:", error);

        if (error instanceof Error && botManager.bot) {
          await botManager.bot.sendMessage(
            msg.chat.id,
            `Error fetching market insight: ${error.message}`
          );
        } else if (botManager.bot) {
          await botManager.bot.sendMessage(
            msg.chat.id,
            "Error fetching market insight: An unknown error occurred."
          );
        }
      }
    },
  });
}


export async function storeMessageRecord({
  content,
}: {
  content: string;
}): Promise<void> {
  try {
    // 同时存储 insightId 用于后续追踪
    await db.insert(tgMessageTable).values({
      userId: "agent", // Default agent user ID
      role: "assistant",
      content,
      messageType: "notification",
      status: "sent",
    });
  } catch (error) {
    console.error("Failed to store record:", error);
    throw new Error("Failed to store insight record");
  }
}
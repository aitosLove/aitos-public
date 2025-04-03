// src/modules/telegram/insight-commands.ts
import { TelegramBotManager } from "./bot_manager";
import { insightInstructTable, defiInsightTable, insightStateTable } from "@/db/schema";
import { db } from "@/db";
import { desc } from 'drizzle-orm';

export function registerInsightCommands(botManager: TelegramBotManager) {
  // Command to get the latest instruct insight
  botManager.registerCommand({
    command: "market_insight",
    description: "Get the latest market insight",
    handler: async (msg) => {
      try {
        // Query the latest insight from insight_instruct table
        const latestInstruct = await db.select()
          .from(insightStateTable)
          .orderBy(desc(insightStateTable.timestamp))
          .limit(1);

        if (latestInstruct.length === 0) {
          await botManager.bot!.sendMessage(msg.chat.id, "No market insights available.");
          return;
        }

        const insight = latestInstruct[0];
        const formattedDate = new Date(insight.timestamp).toLocaleString();
        
        const response = `📊 *Latest Market Insight*\n\n` +
          `*Timestamp:* ${formattedDate}\n\n` +
          `${insight.insight}`;
        
        await botManager.bot!.sendMessage(msg.chat.id, response, { parse_mode: "Markdown" });
      } catch (error) {
        console.error("[Telegram] Error fetching market insight:", error);
        await botManager.bot!.sendMessage(msg.chat.id, `Error fetching market insight: ${error.message}`);
      }
    }
  });

  // Command to get the latest DeFi insight
  botManager.registerCommand({
    command: "defi_insight",
    description: "Get the latest DeFi insight",
    handler: async (msg) => {
      try {
        // Query the latest insight from defi_insight_state table
        const latestDefiInsight = await db.select()
          .from(defiInsightTable)
          .orderBy(desc(defiInsightTable.timestamp))
          .limit(1);

        if (latestDefiInsight.length === 0) {
          await botManager.bot!.sendMessage(msg.chat.id, "No DeFi insights available.");
          return;
        }

        const insight = latestDefiInsight[0];
        const formattedDate = new Date(insight.timestamp).toLocaleString();
        
        const response = `💰 *Latest DeFi Insight*\n\n` +
          `*Timestamp:* ${formattedDate}\n\n` +
          `${insight.insight}`;
        
        await botManager.bot!.sendMessage(msg.chat.id, response, { parse_mode: "Markdown" });
      } catch (error) {
        console.error("[Telegram] Error fetching DeFi insight:", error);
        await botManager.bot!.sendMessage(msg.chat.id, `Error fetching DeFi insight: ${error.message}`);
      }
    }
  });
}
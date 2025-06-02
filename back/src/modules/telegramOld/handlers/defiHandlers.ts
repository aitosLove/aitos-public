/**
 * DeFi Event Handlers for Telegram Bot
 * 
 * This file contains handlers for DeFi-related events and insights
 * that are sent to the Telegram bot.
 */

import { AgentEvent } from "@/src/agent/core/EventTypes";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import {
  defiInsightTable,
  actionStateTable
} from "@/db/schema/moduleSchema/defiSchema";

/**
 * Handler for DeFi analysis events
 * Processes DeFi analysis events and sends them to Telegram
 */
export async function handleDefiAnalysisEvent(evt: AgentEvent, telegramBot: any) {
  try {
    const analysis = evt.payload?.defiAnalysis;
    
    if (!analysis) {
      console.log("[Event] Received DeFi analysis event, but data is invalid");
      return;
    }
    
    console.log(`[Event] Received DeFi analysis: ${analysis.title}`);
    
    // Build message
    const message = `💰 **DeFi Analysis Report**\n\n` +
      `📊 **Title**: ${analysis.title}\n` +
      `📝 **Summary**: ${analysis.summary}\n\n` +
      `📈 **Key Metrics**:\n` +
      `- TVL: ${analysis.metrics?.tvl || 'N/A'}\n` +
      `- 24h Change: ${analysis.metrics?.change24h || 'N/A'}\n` +
      `- Protocol Count: ${analysis.metrics?.protocols || 'N/A'}\n\n` +
      `🔗 **Detail Link**: ${analysis.detailUrl || 'No detail link'}\n` +
      `⏱️ Analysis Time: ${new Date(analysis.timestamp).toLocaleString()}`;
      
    await telegramBot.sendMessage(message);
  } catch (error) {
    console.error("[Event] Failed to handle DeFi analysis event:", error);
  }
}

/**
 * Get recent DeFi insights from the database
 * @param agentId Agent ID to filter by
 * @param limit Maximum number of insights to retrieve
 * @returns Array of DeFi insights
 */
export async function getRecentDefiInsights(agentId: string, limit: number = 5) {
  try {
    const insights = await db
      .select()
      .from(defiInsightTable)
      .where(eq(defiInsightTable.agentId, agentId))
      .orderBy(desc(defiInsightTable.timestamp))
      .limit(limit);
    
    return insights;
  } catch (error) {
    console.error("[DB] Error retrieving DeFi insights:", error);
    throw error;
  }
}

/**
 * Get recent DeFi actions from the database
 * @param agentId Agent ID to filter by
 * @param limit Maximum number of actions to retrieve
 * @returns Array of DeFi actions
 */
export async function getRecentDefiActions(agentId: string, limit: number = 5) {
  try {
    const actions = await db
      .select()
      .from(actionStateTable)
      .where(eq(actionStateTable.agentId, agentId))
      .orderBy(desc(actionStateTable.timestamp))
      .limit(limit);
    
    return actions;
  } catch (error) {
    console.error("[DB] Error retrieving DeFi actions:", error);
    throw error;
  }
}

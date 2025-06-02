/**
 * Twitter Content Handlers for Telegram Bot
 * 
 * This file contains handlers for Twitter/X content-related events
 * that are sent to the Telegram bot.
 */

import { AgentEvent } from "@/src/agent/core/EventTypes";
import { db } from "@/db";
import { eq, desc, and } from "drizzle-orm";
import {
  xContentInsights,
  xDeepSearches,
  xDeepSearchCitations,
  type ContentInsightModel,
  type PerplexitySearchModel
} from "@/db/schema/moduleSchema/twitterSchema";

/**
 * Handler for content insight events
 * Processes content insights from X/Twitter and sends them to Telegram
 */
export async function handleContentInsightEvent(evt: AgentEvent, telegramBot: any) {
  try {
    const insight = evt.payload?.contentInsight;
    
    if (!insight || !insight.hasValue) {
      console.log("[Event] Received content insight event, but no value, skipping notification");
      return;
    }
    
    console.log(`[Event] Received valuable content insight: ${insight.category}`);
    
    // Build message
    const message = `📊 **New Market Insight**\n\n` +
      `📈 **Type**: ${insight.category}\n` +
      `💡 **Summary**: ${insight.summary}\n` +
      `👤 **Source**: @${insight.username}\n` +
      `🔗 **Link**: ${insight.source}\n\n` +
      `${insight.entity?.name ? `📌 **Related Asset**: ${insight.entity.name}` : ''}` +
      `${insight.event?.name ? `\n🔔 **Event**: ${insight.event.name} - ${insight.event.details}` : ''}`;
      
    await telegramBot.sendMessage(message);
  } catch (error) {
    console.error("[Event] Failed to handle content insight event:", error);
  }
}

/**
 * Handler for Perplexity search result events
 * Processes deep search results and sends them to Telegram
 */
export async function handlePerplexitySearchEvent(evt: AgentEvent, telegramBot: any) {
  try {
    const searchResult = evt.payload?.searchResult;
    
    if (!searchResult) {
      console.log("[Event] Received Perplexity search result event, but data is invalid");
      return;
    }
    
    console.log(`[Event] Received deep search result: ${searchResult.query}`);
    
    // Build message
    const message = `🔍 **Deep Research Result**\n\n` +
      `❓ **Query**: ${searchResult.query}\n\n` +
      `📝 **Analysis**:\n${searchResult.response}\n\n` +
      `📚 **References**:\n${searchResult.citations?.map((c: any, i: number) => 
        `${i+1}. [${c.title}](${c.url})`).join('\n') || 'No references'}\n\n` +
      `⏱️ Generation Time: ${new Date(searchResult.metadata?.timestamp || Date.now()).toLocaleString()}`;
      
    await telegramBot.sendMessage(message);
  } catch (error) {
    console.error("[Event] Failed to handle Perplexity search result event:", error);
  }
}

/**
 * Handler for valuable X content events
 * Processes valuable content from X/Twitter and sends it to Telegram
 */
export async function handleValuableXContentEvent(evt: AgentEvent, telegramBot: any) {
  try {
    const content = evt.payload?.valuableContent;
    
    if (!content) {
      console.log("[Event] Received valuable X content event, but data is invalid");
      return;
    }
    
    console.log(`[Event] Received valuable X content: Author @${content.authorUsername}`);
    
    // Build message
    const message = `🔥 **Valuable Content Discovered**\n\n` +
      `👤 **Author**: @${content.authorUsername}\n` +
      `💬 **Content**: ${content.post_content}\n` +
      `🔗 **Link**: ${content.url}\n\n` +
      `📌 **Value Assessment**: ${content.valueReason || 'Contains important market information'}\n` +
      `⏱️ Post Time: ${new Date(content.timestamp).toLocaleString()}`;
      
    await telegramBot.sendMessage(message);
  } catch (error) {
    console.error("[Event] Failed to handle valuable X content event:", error);
  }
}

/**
 * Get content insights from the database
 * @param agentId Agent ID to filter by
 * @param limit Maximum number of insights to retrieve
 * @returns Array of content insights
 */
export async function getContentInsightsByAgent(
  agentId: string,
  limit: number = 50
): Promise<ContentInsightModel[]> {
  try {
    const insights = await db
      .select()
      .from(xContentInsights)
      .where(eq(xContentInsights.agentId, agentId))
      .orderBy(desc(xContentInsights.createdAt))
      .limit(limit);

    console.log(`[DB] Retrieved ${insights.length} content insights for agentId: ${agentId}`);
    return insights;
  } catch (error) {
    console.error("[DB] Error retrieving content insights:", error);
    throw error;
  }
}

/**
 * Get recent Perplexity search results for an agent
 * @param agentId Agent ID to filter by
 * @param limit Maximum number of results to retrieve
 * @returns Array of recent search results
 */
export async function getRecentPerplexitySearches(
  agentId: string,
  limit: number = 10
) {
  try {
    // Get recent search records for this agent
    const searches = await db
      .select()
      .from(xDeepSearches)
      .where(eq(xDeepSearches.agentId, agentId))
      .orderBy(desc(xDeepSearches.createdAt))
      .limit(limit);

    const results = [];

    // Get citations and construct result for each search
    for (const search of searches) {
      const citationsList = await db
        .select()
        .from(xDeepSearchCitations)
        .where(and(
          eq(xDeepSearchCitations.perplexitySearchId, search.id),
          eq(xDeepSearchCitations.agentId, agentId)
        ));

      // Format the citations
      const formattedCitations = citationsList.map(
        (citation) => ({
          url: citation.url,
          title: citation.title,
        })
      );

      // Construct the usage object
      const usage = {
        prompt_tokens: search.promptTokens,
        completion_tokens: search.completionTokens,
        total_tokens: search.totalTokens,
        citation_tokens: search.citationTokens || 0,
        num_search_queries: search.searchQueriesCount || 0,
      };

      // Construct the related content object
      const relatedTo = {
        contentId: search.contentId,
        username: search.username,
        category: search.category,
      };

      // Add the result
      results.push({
        query: search.query,
        response: search.response,
        citations: formattedCitations,
        metadata: {
          model: search.model,
          usage: usage,
          timestamp: search.timestamp.toISOString(),
        },
        relatedTo: relatedTo,
      });
    }

    console.log(`[DB] Retrieved ${results.length} recent Perplexity searches for agentId: ${agentId}`);
    return results;
  } catch (error) {
    console.error("[DB] Error retrieving recent Perplexity searches:", error);
    throw error;
  }
}

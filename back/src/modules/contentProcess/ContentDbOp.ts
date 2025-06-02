/**
 * Database operations for storing Content Insights and Perplexity search results
 */

import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import {
  xContentInsights as contentInsights,
  xDeepSearches as perplexitySearches,
  xDeepSearchCitations as citations,
  type ContentInsightModel,
  type PerplexitySearchModel,
  type CitationModel,
  type FormattedCitation,
  type PerplexityUsage,
  type RelatedContent,
} from "@/db/schema/moduleSchema/twitterSchema";

import {
  type ContentInsight,
  type PerplexitySearchResult,
  type PerplexityApiResponse,
} from "@/src/modules/xContentCrawler/types";

/**
 * Save a content insight to the database
 * @param insight The content insight object
 * @param agentId The agent ID for data isolation
 * @returns ID of the saved content insight record
 */
export async function saveContentInsight(
  insight: ContentInsight,
  agentId: string
): Promise<number> {
  try {
    // Check if content insight already exists for this agent
    const existingInsight = await db
      .select()
      .from(contentInsights)
      .where(and(
        eq(contentInsights.source, insight.source),
        eq(contentInsights.agentId, agentId)
      ))
      .limit(1);

    if (existingInsight.length > 0) {
      // Update existing record
      await db
        .update(contentInsights)
        .set({
          hasValue: insight.hasValue,
          category: insight.category,
          summary: insight.summary,
          entity: insight.entity,
          event: insight.event,
          timestamp: new Date(insight.timestamp),
        })
        .where(eq(contentInsights.id, existingInsight[0].id));

      console.log(
        `[DB] Updated content insight for ${insight.username} at ${insight.source} (agentId: ${agentId})`
      );
      return existingInsight[0].id;
    } else {
      // Create new record
      const [insertedInsight] = await db
        .insert(contentInsights)
        .values({
          agentId: agentId,
          hasValue: insight.hasValue,
          category: insight.category,
          summary: insight.summary,
          source: insight.source,
          username: insight.username,
          timestamp: new Date(insight.timestamp),
          entity: insight.entity,
          event: insight.event,
          createdAt: new Date(),
        })
        .returning({ id: contentInsights.id });

      console.log(
        `[DB] Created new content insight for ${insight.username} at ${insight.source} (agentId: ${agentId})`
      );
      return insertedInsight.id;
    }
  } catch (error) {
    console.error("[DB] Error saving content insight:", error);
    throw error;
  }
}

/**
 * Save a Perplexity search result to the database
 * @param contentInsight The content insight object
 * @param searchResult The Perplexity search result
 * @param agentId The agent ID for data isolation
 * @returns ID of the saved perplexity search record
 */
export async function savePerplexitySearchResult(
  contentInsight: ContentInsight,
  searchResult: PerplexitySearchResult,
  agentId: string
): Promise<number> {
  try {
    // 1. Save the Perplexity search
    const [insertedSearch] = await db
      .insert(perplexitySearches)
      .values({
        agentId: agentId,
        query: searchResult.query,
        response: searchResult.response,
        model: searchResult.metadata.model,
        timestamp: new Date(searchResult.metadata.timestamp),
        promptTokens: searchResult.metadata.usage.prompt_tokens,
        completionTokens: searchResult.metadata.usage.completion_tokens,
        totalTokens: searchResult.metadata.usage.total_tokens,
        citationTokens: searchResult.metadata.usage.citation_tokens,
        searchQueriesCount: searchResult.metadata.usage.num_search_queries,
        contentId: searchResult.relatedTo.contentId,
        username: searchResult.relatedTo.username,
        category: searchResult.relatedTo.category,
        rawResponse: searchResult.rawResponse,
        createdAt: new Date(),
      })
      .returning({ id: perplexitySearches.id });

    const perplexitySearchId = insertedSearch.id;

    // 2. Save all citations
    if (searchResult.citations && searchResult.citations.length > 0) {
      for (const citation of searchResult.citations) {
        await db.insert(citations).values({
          agentId: agentId,
          url: citation.url,
          title: citation.title,
          perplexitySearchId: perplexitySearchId,
          createdAt: new Date(),
        });
      }
    }

    console.log(
      `[DB] Saved Perplexity search result with ID: ${perplexitySearchId} (${searchResult.citations.length} citations) (agentId: ${agentId})`
    );
    return perplexitySearchId;
  } catch (error) {
    console.error("[DB] Error saving Perplexity search result:", error);
    throw error;
  }
}

/**
 * Get a Perplexity search result by ID and agentId
 * @param id ID of the Perplexity search
 * @param agentId The agent ID for data isolation
 * @returns The complete Perplexity search result
 */
export async function getPerplexitySearchById(
  id: number,
  agentId: string
): Promise<PerplexitySearchResult | null> {
  try {
    // Get the search record
    const search = await db
      .select()
      .from(perplexitySearches)
      .where(and(
        eq(perplexitySearches.id, id),
        eq(perplexitySearches.agentId, agentId)
      ))
      .limit(1);

    if (search.length === 0) {
      console.log(`[DB] No Perplexity search found with ID: ${id} for agentId: ${agentId}`);
      return null;
    }

    const searchRecord = search[0];

    // Get all citations for this search
    const citationsList = await db
      .select()
      .from(citations)
      .where(and(
        eq(citations.perplexitySearchId, id),
        eq(citations.agentId, agentId)
      ));

    // Format the citations
    const formattedCitations: FormattedCitation[] = citationsList.map(
      (citation) => ({
        url: citation.url,
        title: citation.title,
      })
    );

    // Construct the usage object
    const usage: PerplexityUsage = {
      prompt_tokens: searchRecord.promptTokens,
      completion_tokens: searchRecord.completionTokens,
      total_tokens: searchRecord.totalTokens,
      citation_tokens: searchRecord.citationTokens || 0,
      num_search_queries: searchRecord.searchQueriesCount || 0,
    };

    // Construct the related content object
    const relatedTo: RelatedContent = {
      contentId: searchRecord.contentId,
      username: searchRecord.username,
      category: searchRecord.category,
    };

    // Construct the complete search result
    const result: PerplexitySearchResult = {
      query: searchRecord.query,
      response: searchRecord.response,
      citations: formattedCitations,
      metadata: {
        model: searchRecord.model,
        usage: usage,
        timestamp: searchRecord.timestamp.toISOString(),
      },
      relatedTo: relatedTo,
      rawResponse: searchRecord.rawResponse as PerplexityApiResponse | undefined,
    };

    console.log(`[DB] Retrieved Perplexity search with ID: ${id} for agentId: ${agentId}`);
    return result;
  } catch (error) {
    console.error("[DB] Error retrieving Perplexity search:", error);
    throw error;
  }
}

/**
 * Get all Perplexity search results for a content source and agentId
 * @param sourceUrl URL of the content source
 * @param agentId The agent ID for data isolation
 * @returns Array of Perplexity search results
 */
export async function getPerplexitySearchesBySource(
  sourceUrl: string,
  agentId: string
): Promise<PerplexitySearchResult[]> {
  try {
    // Get all search records related to this source and agent
    const searches = await db
      .select()
      .from(perplexitySearches)
      .where(and(
        eq(perplexitySearches.contentId, sourceUrl),
        eq(perplexitySearches.agentId, agentId)
      ));

    const results: PerplexitySearchResult[] = [];

    // Get citations and construct result for each search
    for (const search of searches) {
      const citationsList = await db
        .select()
        .from(citations)
        .where(and(
          eq(citations.perplexitySearchId, search.id),
          eq(citations.agentId, agentId)
        ));

      // Format the citations
      const formattedCitations: FormattedCitation[] = citationsList.map(
        (citation) => ({
          url: citation.url,
          title: citation.title,
        })
      );

      // Construct the usage object
      const usage: PerplexityUsage = {
        prompt_tokens: search.promptTokens,
        completion_tokens: search.completionTokens,
        total_tokens: search.totalTokens,
        citation_tokens: search.citationTokens || 0,
        num_search_queries: search.searchQueriesCount || 0,
      };

      // Construct the related content object
      const relatedTo: RelatedContent = {
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
        rawResponse: search.rawResponse as PerplexityApiResponse | undefined,
      });
    }

    console.log(
      `[DB] Retrieved ${results.length} Perplexity searches for source: ${sourceUrl} (agentId: ${agentId})`
    );
    return results;
  } catch (error) {
    console.error(
      "[DB] Error retrieving Perplexity searches by source:",
      error
    );
    throw error;
  }
}

/**
 * Get recent Perplexity search results for an agent
 * @param agentId The agent ID for data isolation
 * @param limit Maximum number of results to return
 * @returns Array of recent search results
 */
export async function getRecentPerplexitySearches(
  agentId: string,
  limit: number = 10
): Promise<PerplexitySearchResult[]> {
  try {
    // Get recent search records for this agent
    const searches = await db
      .select()
      .from(perplexitySearches)
      .where(eq(perplexitySearches.agentId, agentId))
      .orderBy(perplexitySearches.createdAt)
      .limit(limit);

    const results: PerplexitySearchResult[] = [];

    // Get citations and construct result for each search
    for (const search of searches) {
      const citationsList = await db
        .select()
        .from(citations)
        .where(and(
          eq(citations.perplexitySearchId, search.id),
          eq(citations.agentId, agentId)
        ));

      // Format the citations
      const formattedCitations: FormattedCitation[] = citationsList.map(
        (citation) => ({
          url: citation.url,
          title: citation.title,
        })
      );

      // Construct the usage object
      const usage: PerplexityUsage = {
        prompt_tokens: search.promptTokens,
        completion_tokens: search.completionTokens,
        total_tokens: search.totalTokens,
        citation_tokens: search.citationTokens || 0,
        num_search_queries: search.searchQueriesCount || 0,
      };

      // Construct the related content object
      const relatedTo: RelatedContent = {
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

/**
 * Get content insights by agent ID
 * @param agentId The agent ID for data isolation
 * @param limit Maximum number of results to return
 * @returns Array of content insights
 */
export async function getContentInsightsByAgent(
  agentId: string,
  limit: number = 50
): Promise<ContentInsightModel[]> {
  try {
    const insights = await db
      .select()
      .from(contentInsights)
      .where(eq(contentInsights.agentId, agentId))
      .orderBy(contentInsights.createdAt)
      .limit(limit);

    console.log(`[DB] Retrieved ${insights.length} content insights for agentId: ${agentId}`);
    return insights;
  } catch (error) {
    console.error("[DB] Error retrieving content insights:", error);
    throw error;
  }
}

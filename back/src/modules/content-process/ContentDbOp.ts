/**
 * Database operations for storing Perplexity search results
 */

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { 
  contentInsights, 
  perplexitySearches, 
  citations,
  type ContentInsightModel,
  type PerplexitySearchModel,
  type CitationModel,
  type FormattedCitation,
  type PerplexityUsage,
  type RelatedContent
} from "@/db/schema";

import { 
  type ContentInsight,
  type PerplexitySearchResult,
  type PerplexityApiResponse
} from "@/src/modules/x-content-crawler/types";

/**
 * Save a content insight to the database
 * @param insight The content insight object
 * @returns ID of the saved content insight record
 */
export async function saveContentInsight(
  insight: ContentInsight
): Promise<number> {
  try {
    // Check if content insight already exists
    const existingInsight = await db.query.contentInsights.findFirst({
      where: eq(contentInsights.source, insight.source)
    });
    
    if (existingInsight) {
      // Update existing record
      await db.update(contentInsights)
        .set({
          hasValue: insight.hasValue,
          category: insight.category,
          summary: insight.summary,
          entity: insight.entity,
          event: insight.event,
          timestamp: new Date(insight.timestamp)
        })
        .where(eq(contentInsights.id, existingInsight.id));
      
      console.log(`[DB] Updated content insight for ${insight.username} at ${insight.source}`);
      return existingInsight.id;
    } else {
      // Create new record
      const [insertedInsight] = await db.insert(contentInsights)
        .values({
          hasValue: insight.hasValue,
          category: insight.category,
          summary: insight.summary,
          source: insight.source,
          username: insight.username,
          timestamp: new Date(insight.timestamp),
          entity: insight.entity,
          event: insight.event,
          createdAt: new Date()
        })
        .returning({ id: contentInsights.id });
      
      console.log(`[DB] Created new content insight for ${insight.username} at ${insight.source}`);
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
 * @returns ID of the saved perplexity search record
 */
export async function savePerplexitySearchResult(
  contentInsight: ContentInsight,
  searchResult: PerplexitySearchResult
): Promise<number> {
  try {
    // 1. Save the Perplexity search
    const [insertedSearch] = await db.insert(perplexitySearches)
      .values({
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
        createdAt: new Date()
      })
      .returning({ id: perplexitySearches.id });
    
    const perplexitySearchId = insertedSearch.id;
    
    // 2. Save all citations
    if (searchResult.citations && searchResult.citations.length > 0) {
      for (const citation of searchResult.citations) {
        await db.insert(citations)
          .values({
            url: citation.url,
            title: citation.title,
            perplexitySearchId: perplexitySearchId,
            createdAt: new Date()
          });
      }
    }
    
    console.log(`[DB] Saved Perplexity search result with ID: ${perplexitySearchId} (${searchResult.citations.length} citations)`);
    return perplexitySearchId;
  } catch (error) {
    console.error("[DB] Error saving Perplexity search result:", error);
    throw error;
  }
}

/**
 * Get a Perplexity search result by ID
 * @param id ID of the Perplexity search
 * @returns The complete Perplexity search result
 */
export async function getPerplexitySearchById(id: number): Promise<PerplexitySearchResult | null> {
  try {
    // Get the search record
    const search = await db.query.perplexitySearches.findFirst({
      where: eq(perplexitySearches.id, id)
    });
    
    if (!search) {
      console.log(`[DB] No Perplexity search found with ID: ${id}`);
      return null;
    }
    
    // Get all citations for this search
    const citationsList = await db
      .select()
      .from(citations)
      .where(eq(citations.perplexitySearchId, id));
    
    // Format the citations
    const formattedCitations: FormattedCitation[] = citationsList.map(citation => ({
      url: citation.url,
      title: citation.title
    }));
    
    // Construct the usage object
    const usage: PerplexityUsage = {
      prompt_tokens: search.promptTokens,
      completion_tokens: search.completionTokens,
      total_tokens: search.totalTokens,
      citation_tokens: search.citationTokens || 0,
      num_search_queries: search.searchQueriesCount || 0
    };
    
    // Construct the related content object
    const relatedTo: RelatedContent = {
      contentId: search.contentId,
      username: search.username,
      category: search.category
    };
    
    // Construct the complete search result
    const result: PerplexitySearchResult = {
      query: search.query,
      response: search.response,
      citations: formattedCitations,
      metadata: {
        model: search.model,
        usage: usage,
        timestamp: search.timestamp.toISOString()
      },
      relatedTo: relatedTo,
      rawResponse: search.rawResponse as PerplexityApiResponse | undefined
    };
    
    console.log(`[DB] Retrieved Perplexity search with ID: ${id}`);
    return result;
  } catch (error) {
    console.error("[DB] Error retrieving Perplexity search:", error);
    throw error;
  }
}

/**
 * Get all Perplexity search results for a content source
 * @param sourceUrl URL of the content source
 * @returns Array of Perplexity search results
 */
export async function getPerplexitySearchesBySource(sourceUrl: string): Promise<PerplexitySearchResult[]> {
  try {
    // Get all search records related to this source
    const searches = await db
      .select()
      .from(perplexitySearches)
      .where(eq(perplexitySearches.contentId, sourceUrl));
    
    const results: PerplexitySearchResult[] = [];
    
    // Get citations and construct result for each search
    for (const search of searches) {
      const citationsList = await db
        .select()
        .from(citations)
        .where(eq(citations.perplexitySearchId, search.id));
      
      // Format the citations
      const formattedCitations: FormattedCitation[] = citationsList.map(citation => ({
        url: citation.url,
        title: citation.title
      }));
      
      // Construct the usage object
      const usage: PerplexityUsage = {
        prompt_tokens: search.promptTokens,
        completion_tokens: search.completionTokens,
        total_tokens: search.totalTokens,
        citation_tokens: search.citationTokens || 0,
        num_search_queries: search.searchQueriesCount || 0
      };
      
      // Construct the related content object
      const relatedTo: RelatedContent = {
        contentId: search.contentId,
        username: search.username,
        category: search.category
      };
      
      // Add the result
      results.push({
        query: search.query,
        response: search.response,
        citations: formattedCitations,
        metadata: {
          model: search.model,
          usage: usage,
          timestamp: search.timestamp.toISOString()
        },
        relatedTo: relatedTo,
        rawResponse: search.rawResponse as PerplexityApiResponse | undefined
      });
    }
    
    console.log(`[DB] Retrieved ${results.length} Perplexity searches for source: ${sourceUrl}`);
    return results;
  } catch (error) {
    console.error("[DB] Error retrieving Perplexity searches by source:", error);
    throw error;
  }
}

/**
 * Get recent Perplexity search results
 * @param limit Maximum number of results to return
 * @returns Array of recent search results
 */
export async function getRecentPerplexitySearches(limit: number = 10): Promise<PerplexitySearchResult[]> {
  try {
    // Get recent search records
    const searches = await db
      .select()
      .from(perplexitySearches)
      .orderBy(perplexitySearches.createdAt)
      .limit(limit);
    
    const results: PerplexitySearchResult[] = [];
    
    // Get citations and construct result for each search
    for (const search of searches) {
      const citationsList = await db
        .select()
        .from(citations)
        .where(eq(citations.perplexitySearchId, search.id));
      
      // Format the citations
      const formattedCitations: FormattedCitation[] = citationsList.map(citation => ({
        url: citation.url,
        title: citation.title
      }));
      
      // Construct the usage object
      const usage: PerplexityUsage = {
        prompt_tokens: search.promptTokens,
        completion_tokens: search.completionTokens,
        total_tokens: search.totalTokens,
        citation_tokens: search.citationTokens || 0,
        num_search_queries: search.searchQueriesCount || 0
      };
      
      // Construct the related content object
      const relatedTo: RelatedContent = {
        contentId: search.contentId,
        username: search.username,
        category: search.category
      };
      
      // Add the result
      results.push({
        query: search.query,
        response: search.response,
        citations: formattedCitations,
        metadata: {
          model: search.model,
          usage: usage,
          timestamp: search.timestamp.toISOString()
        },
        relatedTo: relatedTo
      });
    }
    
    console.log(`[DB] Retrieved ${results.length} recent Perplexity searches`);
    return results;
  } catch (error) {
    console.error("[DB] Error retrieving recent Perplexity searches:", error);
    throw error;
  }
}


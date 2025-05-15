import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import {
  XPost,
  XPostPayload,
  ContentInsight,
  PerplexitySearchResult,
  PerplexityApiResponse,
} from "../x-content-crawler/types";
import { ContentEvaluator } from "./contentEvaluator";
import { savePerplexitySearchResult } from "./ContentDbOp";

export class ContentEvaluationManager {
  private agent: Agent;
  private userId: string;

  constructor(agent: Agent, userId: string) {
    this.agent = agent;
    this.userId = userId;

    // Bind methods to maintain 'this' context
    this.handleContentToProcess = this.handleContentToProcess.bind(this);
  }

  /**
   * Initialize the content evaluation manager
   */
  public async init(): Promise<void> {
    try {
      console.log(
        `Initializing content evaluation manager for user ${this.userId}`
      );

      // Register event handlers
      this.agent.sensing.registerListener((evt: AgentEvent) => {
        if (evt.type === "X_CONTENT_TO_PROCESS_EVENT") {
          this.handleContentToProcess(evt as AgentEvent);
        }
      });

      this.agent.sensing.registerListener(async (evt: AgentEvent) => {
        if (evt.type === "CONTENT_INSIGHT_AVAILABLE_EVENT") {
          try {
            const { userId, contentInsight } = evt.payload;

            // Only proceed if content has value
            if (contentInsight && contentInsight.hasValue) {
              console.log(
                `Processing valuable content insight from ${contentInsight.username}`
              );

              // Perform Perplexity search based on content insight data
              const searchResults = await this.usePerplexitySearch(
                contentInsight
              );

              if (searchResults) {
                try {
                  const savedId = await savePerplexitySearchResult(
                    contentInsight,
                    searchResults
                  );

                  // Add the database ID to the search results
                  const enrichedResults = {
                    ...searchResults,
                    dbId: savedId,
                  };

                  this.agent.sensing.emitEvent({
                    type: "CONTENT_SEARCH_RESULTS_EVENT",
                    description: "Search results for valuable content",
                    payload: {
                      userId,
                      contentInsight,
                      searchResults: enrichedResults,
                    },
                    timestamp: Date.now(),
                  });

                  console.log(
                    `Emitted search results for content from ${contentInsight.username}`
                  );
                } catch (dbError) {
                  console.error(
                    "Error saving search results to database:",
                    dbError
                  ); // Still emit the event even if database save fails
                  this.agent.sensing.emitEvent({
                    type: "CONTENT_SEARCH_RESULTS_EVENT",
                    description:
                      "Search results for valuable content (not saved to DB)",
                    payload: {
                      userId,
                      contentInsight,
                      searchResults,
                    },
                    timestamp: Date.now(),
                  });
                }
              }
            } else {
              console.log("Content insight has no value, skipping search");
            }
          } catch (error) {
            console.error("Error handling content insight event:", error);
          }
        }
      });
    } catch (error) {
      console.error("Failed to initialize content evaluation manager:", error);
      throw error;
    }
  }

  /**
   * Handle content processing events
   */
  private async handleContentToProcess(event: AgentEvent): Promise<void> {
    try {
      const { userId, post_content, authorUsername, url } = event.payload;

      // Validate that the event is for this user
      if (userId !== this.userId) {
        return;
      }

      console.log(`Processing content from ${authorUsername}`);

      // Create post object from payload
      const post: XPostPayload = {
        post_content: post_content,
        authorUsername: authorUsername,
        userId: userId,
        url: url,
        timestamp: new Date().toISOString(),
      };

      const Evaluator = new ContentEvaluator();

      // Evaluate the post
      const contentInsight = await Evaluator.evaluatePost(post);

      if (contentInsight) {
        // Emit event with the evaluation results
        this.agent.sensing.emitEvent({
          type: "CONTENT_INSIGHT_AVAILABLE_EVENT",
          description: "Content has been evaluated with insights",
          payload: {
            userId: this.userId,
            contentInsight: contentInsight,
          },
          timestamp: Date.now(),
        });

        console.log(
          `Emitted content insight event for content from ${authorUsername}`
        );
      }
    } catch (error) {
      console.error("Error processing content:", error);
    }
  }

  private async usePerplexitySearch(
    contentInsight: ContentInsight
  ): Promise<PerplexitySearchResult | null> {
    try {
      // Construct a search-optimized prompt based on content insight
      const searchPrompt = this.constructSearchPrompt(contentInsight);
      console.log(`Constructed search prompt: "${searchPrompt}"`);

      // Create request options for Perplexity API
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-deep-research",
          messages: [
            {
              role: "system",
              content:
                "You are a research assistant specializing in finding relevant information. Provide concise, factual responses with key highlights. Include specific details that add context and depth. Always cite your sources.",
            },
            {
              role: "user",
              content: searchPrompt,
            },
          ],
        }),
      };

      // Make API request to Perplexity
      console.log("Sending request to Perplexity API");
      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        options
      );
      const result = await response.json();

      // Check for valid response
      if (!response.ok) {
        console.error("Error from Perplexity API:", result);
        throw new Error(
          `Perplexity API error: ${result.error?.message || "Unknown error"}`
        );
      }

      // Parse and process response
      return this.processPerplexityResponse(result, contentInsight);
    } catch (error) {
      console.error("Error in Perplexity search:", error);
      return null;
    }
  }

  private constructSearchPrompt(contentInsight: ContentInsight): string {
    // Extract key components for search
    const { category, entity, event, summary } = contentInsight;

    // Start with main category for context
    let promptParts = [];

    if (category && category !== "none") {
      promptParts.push(`Regarding ${category}`);
    }

    // Add specific entities and events for specificity
    if (entity && entity.name.length > 0) {
      // Include top 3 entities maximum
      promptParts.push(`involving ${entity}`);
    }

    if (event && event.name.length > 0) {
      promptParts.push(`in ${event}`);
    }

    // Add key points from summary (extract first sentence for clarity)
    if (summary) {
      const firstSentence = summary.split(".")[0];
      if (firstSentence && firstSentence.length > 15) {
        promptParts.push(`regarding "${firstSentence}"`);
      }
    }

    // Create base prompt
    let prompt = promptParts.join(" ");

    // Ensure the prompt is substantial enough
    if (prompt.length < 20 && summary) {
      // If prompt is too short, use more of the summary
      prompt = `Find detailed information about "${summary.substring(0, 100)}"`;
    } else if (prompt.length < 20) {
      // Fallback for very limited insight data
      prompt = `Find latest information about ${category || "this topic"}`;
    }

    // Add search directive for context
    return `${prompt}. Provide the most recent and relevant information, research findings, expert opinions, and factual data. Include current developments, statistics, and insights from credible sources.`;
  }

  private processPerplexityResponse(
    perplexityResponse: PerplexityApiResponse,
    contentInsight: ContentInsight
  ): PerplexitySearchResult | null {
    try {
      console.log("Processing Perplexity response");

      // Extract assistant's message content
      const assistantMessage =
        perplexityResponse.choices?.[0]?.message?.content;
      if (!assistantMessage) {
        throw new Error("No content in Perplexity response");
      }

      // Extract citations from the response
      const citations = perplexityResponse.citations || [];

      // Create structured search result
      return {
        query: this.constructSearchPrompt(contentInsight),
        response: assistantMessage,
        citations: citations.map((url: string) => ({
          url,
          title: this.extractDomainFromUrl(url),
        })),
        metadata: {
          model: perplexityResponse.model,
          usage: perplexityResponse.usage,
          timestamp: new Date().toISOString(),
        },
        relatedTo: {
          contentId: contentInsight.source,
          username: contentInsight.username,
          category: contentInsight.category,
        },
        // Optionally include the raw response for debugging
        // rawResponse: perplexityResponse
      };
    } catch (error) {
      console.error("Error processing Perplexity response:", error);
      return null;
    }
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, "");
    } catch (error) {
      return url;
    }
  }
}

/**
 * Module enabler function
 */
export function enableContentEvaluationModule(agent: Agent, userId: string) {
  console.log(`Enabling content evaluation module for user ${userId}`);

  const contentEvaluationManager = new ContentEvaluationManager(agent, userId);

  // Initialize the content evaluation manager
  contentEvaluationManager.init().catch((error) => {
    console.error("Failed to initialize content evaluation module:", error);
  });

  // Return the manager in case it's needed elsewhere
  return contentEvaluationManager;
}

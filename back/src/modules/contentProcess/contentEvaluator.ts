// contentEvaluator.ts - Evaluates post content for insights

import {
  XPost,
  ContentInsight,
  XPostPayload,
} from "@/src/modules/xContentCrawler/types";
import { createOpenAI } from "@ai-sdk/openai";

const customOpenAI = createOpenAI({
  baseURL: process.env.DEEPSEEK_REASONING_URL,
  apiKey: process.env.DEEPSEEK_REASONING_API_KEY,
  compatibility: "compatible",
});

export class ContentEvaluator {
  /**
   * Evaluate a post for crypto insights
   */
  public async evaluatePost(
    post: XPostPayload,
    agentId: string
  ): Promise<ContentInsight | null> {
    if (!post.post_content || post.post_content.length < 20) {
      return null; // Skip short posts
    }

    try {
      // Define the system prompt
      const systemPrompt = `
       # Guidelines for Evaluating Crypto Social Media Posts

## Core Decision Process
1. **Scan** for crypto terminology (blockchain, tokens, projects, trading)
2. **Extract** distinct, specific information
3. **Identify** key entity and event mentioned
4. **Evaluate** usefulness to crypto audiences

## What Makes Information Valuable:

**Trading**:
- Specific price targets, entry/exit points
- Technical analysis with reasoning
- Risk management strategies

**Project Introductions**:
- Named project with clear use case
- Technical details or problem-solving approach
- Team/partnerships/development status

**General Insights**:
- Market trends with supporting data
- Regulatory updates
- Educational content with substance

## Entity Recognition Guidelines:
Extract key entity mentioned in the post with their types:
- **Person**: Individual names (founders, influencers, developers)
- **Organization**: Companies, foundations, regulatory bodies
- **Project**: Named blockchain projects or protocols
- **Token**: Cryptocurrency tokens or coins (BTC, ETH, etc.)
- **Blockchain**: Underlying blockchain networks
- **Exchange**: Trading platforms or exchanges
- **Other**: Any other notable entities

## Event Recognition Guidelines:
Identify key event mentioned in the post:
- **Launch**: New product/token/feature releases
- **Partnership**: Collaborations between projects/companies
- **Funding**: Investment rounds, grants, fundraising
- **Listing**: Token listings on exchanges
- **Airdrop**: Token distribution events
- **Hack**: Security breaches or exploits
- **Regulation**: Regulatory announcements or changes
- **Other**: Any other significant events

## Information Extraction Tips:
- Focus on unique details (numbers, names, dates)
- Identify actionable recommendations
- Separate opinion from factual content
- Look for specialized terminology that signals expertise

## Output Format:
Return a JSON object with the following structure:
{
  "has_value": true/false (boolean value),
  "category": "trading_idea"/"project_intro"/"market_insight"/"none",
  "entity": 
    {
      "name": "entity name",
      "context": "brief context about this entity's mention"
    }
  ,
  "event": 
    {
      "name": "event name",
      "details": "brief details about the event"
    }
  ,
  "summary": "Brief extraction of essential information"
}
      `;

      // Create custom OpenAI client
      const customClient = new OpenAIClient();

      // Make the API call
      const completion = await customClient.chat.completions.create({
        model: process.env.DEEPSEEK_REASONING_MODEL || "deepseek-reasoning",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Evaluate this post: "${post.post_content}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      // Extract the response content
      const responseContent = completion.choices[0].message.content;
      console.log(responseContent);

      const jsonContent = extractJsonFromResponse(responseContent);
      let contentInsight: ContentInsight | null = null;

      if (jsonContent) {
        try {
          const parsedResponse = JSON.parse(jsonContent);

          // Convert to ContentInsight type
          contentInsight = {
            agentId: agentId,
            hasValue: parsedResponse.has_value,
            category: parsedResponse.category || "none",
            entity: {
              name: parsedResponse.entity || "",
              context: parsedResponse.entity_description || "",
            },
            event: {
              name: parsedResponse.event || "",
              details: parsedResponse.event_description || "",
            },
            summary: parsedResponse.summary,
            source: post.url || "unknown",
            username: post.authorUsername || "unknown",
            timestamp: post.timestamp || new Date().toISOString(),
          };

          console.log("Successfully parsed content insight:", contentInsight);
        } catch (error) {
          console.error("Error parsing JSON content:", error);
        }
      } else {
        console.error("Could not extract valid JSON from the response");
      }

      // Only proceed if we have a valid content insight
      if (contentInsight) {
        return contentInsight;
      } else {
        console.error("Failed to generate valid content insight");
        return null;
      }
    } catch (error) {
      console.error("Error evaluating post:", error);
      return null;
    }
  }
}

// Custom OpenAI client class
class OpenAIClient {
  baseUrl: string;
  apiKey: string;

  constructor() {
    (this.baseUrl =
      process.env.DEEPSEEK_REASONING_URL || "https://your-custom-url.com/v1"),
      (this.apiKey = process.env.DEEPSEEK_REASONING_API_KEY || "");
  }

  chat = {
    completions: {
      create: async (params: any) => {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
      },
    },
  };
}

function extractJsonFromResponse(responseContent: string): string | null {
  try {
    // Find the first opening brace
    const firstBraceIndex = responseContent.indexOf("{");
    if (firstBraceIndex === -1) {
      console.error("No JSON object found in response (missing opening brace)");
      return null;
    }

    // Find the last closing brace
    const lastBraceIndex = responseContent.lastIndexOf("}");
    if (lastBraceIndex === -1) {
      console.error("No JSON object found in response (missing closing brace)");
      return null;
    }

    // Extract the content between the braces (inclusive)
    const jsonContent = responseContent.substring(
      firstBraceIndex,
      lastBraceIndex + 1
    );

    // Validate that it's actually valid JSON
    JSON.parse(jsonContent); // This will throw if invalid

    return jsonContent;
  } catch (error) {
    console.error("Failed to extract valid JSON from response:", error);
    return null;
  }
}

// contentEvaluator.ts - Evaluates post content for insights

import { XPost, ContentInsight } from "@/src/modules/x-content-crawler/types";
import { z } from "zod";

// Define the schema for content insights using Zod
const contentInsightSchema = z.object({
  has_value: z.boolean(),
  category: z.enum(["trading_idea", "project_intro", "market_insight", "none"]),
  key_details: z.array(z.string()),
  summary: z.string(),
});

const customOpenAI = {
  baseURL:
    process.env.DEEPSEEK_REASONING_URL || "https://your-custom-url.com/v1",
  apiKey: process.env.DEEPSEEK_REASONING_API_KEY || "",
  model: process.env.DEEPSEEK_REASONING_MODEL || "your-reasoning-model",
};

export class ContentEvaluator {
  /**
   * Evaluate a post for crypto insights
   */
  public async evaluatePost(post: XPost): Promise<ContentInsight | null> {
    if (!post.text || post.text.length < 20) {
      return null; // Skip short posts
    }

    try {
      // Define the system prompt
      const systemPrompt = `
       # Guidelines for Evaluating Crypto Social Media Posts

## Core Decision Process
1. **Scan** for crypto terminology (blockchain, tokens, projects, trading)
2. **Extract** distinct, specific information
3. **Evaluate** usefulness to crypto audiences

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

## Information Extraction Tips:
- Focus on unique details (numbers, names, dates)
- Identify actionable recommendations
- Separate opinion from factual content
- Look for specialized terminology that signals expertise

## Output Format:
Return a JSON object with the following structure:
{
  "has_value": true/false,
  "category": "trading"/"project_intro"/"market_insight"/"none",
  "summary": "Brief extraction of essential information"
}
      `;

      // Create custom OpenAI client
      const customClient = new OpenAIClient();

      // Make the API call
      const completion = await customClient.chat.completions.create({
        model: customOpenAI.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Evaluate this post: "${post.text}"` },
        ],
        response_format: { type: "json_object" },
      });

      // Extract the response content
      const responseContent = completion.choices[0].message.content;

      if (!responseContent) {
        throw new Error("No response content received");
      }

      // Parse the JSON response
      const parsedResponse = JSON.parse(responseContent);

      // Convert to ContentInsight type
      const contentInsight: ContentInsight = {
        hasValue: parsedResponse.has_value,
        category: parsedResponse.category,
        // keyDetails: parsedResponse.key_details,
        summary: parsedResponse.summary,
        source: post.url || "unknown",
        username: post.author.username || "unknown",
        timestamp: post.timestamp || new Date().toISOString(),
      };

      return contentInsight;
    } catch (error) {
      console.error("Error evaluating post content:", error);
      return null;
    }
  }
}

// Custom OpenAI client class
class OpenAIClient {
  baseUrl: string;
  apiKey: string;

  constructor() {
    this.baseUrl = customOpenAI.baseURL;
    this.apiKey = customOpenAI.apiKey;
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

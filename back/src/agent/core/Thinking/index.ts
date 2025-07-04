// filepath: /Users/ryuko/dev/24531/wonderland-v2/back/src/agent/core/Thinking/index.ts
/**
 * Thinking.ts
 *
 * Agent thinking layer interface and default implementation.
 * Responsible for higher-level decision making or logic, such as calling AI, running rule engines, etc.
 * In this example, only a simple demonstration is provided.
 */

import { generateResponse } from "./lib/chat";
import { type Model, type Platform } from "./lib/ai";

export interface IThinking {
  /**
   * Process input to reach conclusions or results
   * @param input Any input
   * @returns Any result
   */
  process(input: any): any;

  response({
    input,
    systemPrompt,
    model,
    platform,
  }: {
    input: string;
    systemPrompt: string;
    model?: Model;
    platform?: Platform;
  }): Promise<string>;

  /** Get current thinking layer status for monitoring */
  getStatus(): any;
  showStatus(): void;
}

/** Default thinking implementation, simply prints the input and returns a fixed result */
export class DefaultThinking implements IThinking {
  process(input: any): any {
    console.log("[DefaultThinking] processing input:", input);
    // Assuming some AI or rule-based judgment is done, this is just for demonstration
    return { conclusion: "default conclusion" };
  }

  async response({
    input,
    systemPrompt,
    model = "large",
    platform = "qwen",
  }: {
    input: string;
    systemPrompt: string;
    model?: Model;
    platform?: Platform;
  }): Promise<string> {
    try {
      // console.log("[DefaultThinking] processing input:", input);

      const response = await generateResponse({
        input,
        systemPrompt,
        model,
        platform,
      });
      // console.log("[DefaultThinking] response:", response);
      return response;
    } catch (e) {
      console.log("[DefaultThinking] error:", e);
      return "error";
    }
  }

  getStatus() {
    return {
      info: "DefaultThinking active",
      lastUpdate: Date.now(),
    };
  }
  showStatus() {
    console.log("Thinking Status:");
    console.log("- Status: active");
    console.log(`- Last processed: ${Date.now()}`);
  }
}

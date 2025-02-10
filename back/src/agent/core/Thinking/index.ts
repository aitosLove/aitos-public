/**
 * Thinking.ts
 *
 * Agent 思维层接口与默认实现。
 * 负责更高层次的决策或逻辑，比如调用AI、运行规则引擎等。
 * 在此示例中，仅做一个简单示例。
 */

import { generateResponse } from "./lib/chat";
import { type Model, type Platform } from "./lib/ai";

export interface IThinking {
  /**
   * 处理输入，得出结论或结果
   * @param input 任意
   * @returns 任意结果
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

  /** 获取当前思维层状态，供监控 */
  getStatus(): any;
  showStatus(): void;
}

/** 默认思维实现，简单打印输入并返回固定结果 */
export class DefaultThinking implements IThinking {
  process(input: any): any {
    console.log("[DefaultThinking] processing input:", input);
    // 假设做了一些AI或规则判断，这里仅演示
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

import { generateText } from "ai";
import { getProvider, getModel } from "@/utils/ai";

/**
 * 简单的AI服务，用于处理用户聊天请求
 * 一条进去，一条出来
 */
export class AIService {
  private provider;
  private model;

  constructor() {
    this.provider = getProvider({ provider: "deepseek" });
    this.model = this.provider(getModel({ inputModel: "small", provider: "deepseek" }));
  }

  /**
   * 处理用户消息，返回AI回复
   */
  async chatResponse(userMessage: string): Promise<string> {
    try {
      const result = await generateText({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "你是一个有用的AI助手。请用简洁友好的方式回复用户。"
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      });

      return result.text;
    } catch (error) {
      console.error("[AI Service] Error:", error);
      return "抱歉，我现在无法处理您的请求。";
    }
  }

  /**
   * 分析事件内容，判断是否值得推送给用户
   */
  async analyzeEvent(eventType: string, eventPayload: any): Promise<{
    shouldNotify: boolean;
    priority: "low" | "medium" | "high";
    summary?: string;
  }> {
    try {
      const eventDescription = `事件类型: ${eventType}\n事件内容: ${JSON.stringify(eventPayload)}`;
      
      const result = await generateText({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `你是一个事件分析助手。分析给定的事件，判断是否值得通知用户。
请返回JSON格式的结果：
{
  "shouldNotify": true/false,
  "priority": "low"/"medium"/"high",
  "summary": "简短的事件摘要"
}

判断标准：
- 重要的系统事件、价格更新、错误信息 = high priority
- 一般的状态更新、成功消息 = medium priority  
- 调试信息、定期检查 = low priority
- 不重要的内部事件 = shouldNotify: false`
          },
          {
            role: "user",
            content: eventDescription
          }
        ]
      });

      // 尝试解析JSON结果
      try {
        const jsonContent = extractJsonFromResponse(result.text);
        
        // 检查是否成功提取到JSON内容
        if (!jsonContent) {
          console.error("[AI Service] Failed to extract JSON from AI response:", result.text);
          return {
            shouldNotify: false,
            priority: "low"
          };
        }
        
        const analysis = JSON.parse(jsonContent);
        return {
          shouldNotify: analysis.shouldNotify || false,
          priority: analysis.priority || "low",
          summary: analysis.summary
        };
      } catch (parseError) {
        console.error("[AI Service] JSON parse error:", parseError);
        console.error("[AI Service] Original AI response:", result.text);
        // 返回默认值
        return {
          shouldNotify: false,
          priority: "low"
        };
      }
    } catch (error) {
      console.error("[AI Service] Event analysis error:", error);
      return {
        shouldNotify: false,
        priority: "low"
      };
    }
  }
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

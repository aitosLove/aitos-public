/**
 * AI 客户端配置 - 用于聊天功能
 * 
 * 提供统一的 AI 客户端接口，支持真实 API 和模拟模式
 * 增强支持流式响应和更好的错误处理
 */
import { MockOpenAI } from './mock-llm.js';
import EventEmitter from 'events';

// 声明全局空间
declare global {
  namespace NodeJS {
    interface Global {
      openaiClient: OpenAIClient | MockOpenAI;
    }
  }
}

/**
 * 响应处理器类型定义
 */
interface ResponseHandler {
  onMessage: (content: string) => void;
  onComplete: (fullResponse: any) => void;
  onError: (error: Error) => void;
}

/**
 * 自定义 OpenAI 客户端类 - 不需要安装 openai 包
 */
export class OpenAIClient {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeout: number;
  retryAttempts: number;

  constructor() {
    this.baseUrl = 'https://ark.cn-beijing.volces.com/api/v3';
    this.apiKey = process.env.TELEGRAM_CHAT_AI_API || '';
    this.model = process.env.TELEGRAM_CHAT_AI_ENDPOINT || '';
    this.timeout = 30000; // 30秒超时
    this.retryAttempts = 1; // 重试次数
  }

  chat = {
    completions: {
      create: async (params: any) => {
        try {
          console.log(`[OpenAIClient] 发送请求到 ${this.baseUrl}/chat/completions`);
          
          // 处理流式响应
          if (params.stream === true) {
            return this.createStreamingCompletion(params);
          }
          
          // 标准响应
          return await this.createStandardCompletion(params);
        } catch (error: any) {
          console.error("[OpenAIClient] API调用失败:", error.message);
          throw error;
        }
      },
    },
  };
  
  /**
   * 创建标准完成请求
   */
  private async createStandardCompletion(params: any): Promise<any> {
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts <= this.retryAttempts) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            ...params,
            model: params.model || this.model,
            stream: false
          }),
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API请求失败，状态: ${response.status}，错误: ${errorText}`);
        }

        return await response.json();
      } catch (error: any) {
        lastError = error;
        attempts++;
        
        if (attempts <= this.retryAttempts) {
          console.log(`[OpenAIClient] 重试请求 ${attempts}/${this.retryAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError || new Error('未知错误');
  }
  
  /**
   * 创建流式完成请求
   */
  private createStreamingCompletion(params: any): any {
    const emitter = new EventEmitter();
    
    // 创建对象封装流式处理
    const stream = {
      on: (event: string, callback: Function) => {
        emitter.on(event, callback as (...args: any[]) => void);
        return stream;
      },
      removeAllListeners: () => {
        emitter.removeAllListeners();
        return stream;
      },
      controller: new AbortController()
    };
    
    // 开始处理
    (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
            "Accept": "text/event-stream"
          },
          body: JSON.stringify({
            ...params,
            model: params.model || this.model,
            stream: true
          }),
          signal: stream.controller.signal
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API请求失败，状态: ${response.status}，错误: ${errorText}`);
        }
        
        if (!response.body) {
          throw new Error('响应体为空');
        }
        
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          
          // 处理缓冲区中的所有行
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6));
                emitter.emit('data', data);
              } catch (e) {
                console.error('[OpenAIClient] 解析流式数据失败:', e);
              }
            } else if (line === 'data: [DONE]') {
              emitter.emit('end');
              return;
            }
          }
        }
        
        emitter.emit('end');
        
      } catch (error: any) {
        console.error('[OpenAIClient] 流式处理错误:', error);
        emitter.emit('error', error);
      }
    })();
    
    return stream;
  }

  /**
   * 测试连接是否正常
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chat.completions.create({
        messages: [{ role: 'user', content: '测试' }],
        model: this.model,
        max_tokens: 10
      });
      return !!response.choices;
    } catch (error) {
      console.error("[OpenAIClient] 连接测试失败:", error);
      return false;
    }
  }
}

/**
 * 创建模拟客户端
 */
export function createMockClient() {
  console.log("[AIClient] 创建模拟 AI 客户端");
  return new MockOpenAI({
    apiKey: 'mock-api-key',
    baseURL: 'https://mock-api.com/v1'
  });
}

/**
 * 创建 AI 客户端
 */
export const setupAIClient = () => {
  // 检查环境变量
  const apiKey = process.env.TELEGRAM_CHAT_AI_API;
  const endpoint = process.env.TELEGRAM_CHAT_AI_ENDPOINT;
  
  let aiClient: OpenAIClient | MockOpenAI;
  
  if (apiKey && endpoint) {
    try {
      console.log(`🤖 初始化 AI 客户端，端点: ${endpoint}`);
      // 创建自定义 OpenAI 客户端
      aiClient = new OpenAIClient();
      console.log("✅ AI 客户端初始化成功");
      console.log(`🔑 API密钥前4位: ${apiKey.substring(0, 4)}...`);
      
      // 异步测试连接
      setTimeout(async () => {
        const isConnected = await aiClient.testConnection();
        if (!isConnected) {
          console.warn("⚠️ AI 连接测试失败，将使用模拟响应");
          const mockClient = createMockClient();
          aiClient = mockClient;
          global.openaiClient = mockClient;
        } else {
          console.log("✅ AI 连接测试成功");
        }
      }, 1000);
      
    } catch (error) {
      console.error("❌ AI 客户端初始化失败:", error);
      aiClient = createMockClient();
    }
  } else {
    console.warn("⚠️ AI API 环境变量未完全设置，将使用模拟 AI");
    aiClient = createMockClient();
  }
  
  return aiClient;
};

// 创建 AI 客户端实例
const aiClient = setupAIClient();

// 设置全局变量，方便在其他模块中访问
global.openaiClient = aiClient;

// 导出 AI 客户端 - 多种导出方式，确保兼容性
export { aiClient };
export default aiClient;

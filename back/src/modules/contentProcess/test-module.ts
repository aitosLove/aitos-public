import { Agent } from "@/src/agent";
import { NullDatabase } from "@/src/agent/core/Store";
import * as dotenv from "dotenv";
import { enableXCrawlerModule } from "../xContentCrawler/index";
import { ContentEvaluationManager } from "./contentEvalModule";

dotenv.config();

/**
 * 内容处理模块测试系统
 * 测试内容评估和深度搜索功能的集成
 * 监听 X_CONTENT_TO_PROCESS_EVENT 事件并进行内容处理
 */
async function setupContentProcessSystem() {
  // 创建 Agent 实例
  const agentId = "53fce807-c84e-4aad-b6b4-6f44b2ef6c88";
  const agent = new Agent({
    agentId: agentId,
    name: "Content Process Test Agent",
    db: new NullDatabase(),
  });

  console.log("初始化内容处理测试系统...");
  console.log(`使用 Agent ID: ${agentId}`);

  // 从环境变量获取 userId 或使用默认值
  const userId = process.env.X_USER_ID || "default_user_id";
  if (process.env.X_USER_ID === undefined) {
    console.warn("警告: 未设置 X_USER_ID 环境变量，使用默认值");
  }

  try {
    // 1. 初始化 X Content Crawler 模块（用于生成内容事件）
    console.log("启用 X Content Crawler 模块...");
    const xCrawlerModule = enableXCrawlerModule(agent, userId);
    
    if (!xCrawlerModule) {
      console.error("X Content Crawler 初始化失败，请检查用户认证和 cookies");
      process.exit(1);
    }

    // 2. 初始化内容评估管理器
    console.log("启用内容处理模块...");
    const contentEvaluationManager = new ContentEvaluationManager(agent, userId);
    await contentEvaluationManager.init();

    console.log("✅ 内容处理系统初始化成功");
    console.log(`Agent ID: ${agent.agentId}`);
    console.log(`Agent Name: ${agent.name}`);
    console.log(`用户 ID: ${userId}`);

    // 3. 注册事件监听器来跟踪处理进度
    setupEventListeners(agent);

    // 4. 启动监控
    startMonitoring(agent);

    // 5. 模拟一些测试内容处理（可选）
    if (process.env.ENABLE_TEST_CONTENT === "true") {
      console.log("\n启用测试内容模拟...");
      simulateTestContent(agent, userId);
    }

    console.log("\n🚀 内容处理系统已启动并运行");
    console.log("系统将监听 X 内容并进行自动评估和深度搜索");

  } catch (error) {
    console.error("❌ 内容处理系统初始化失败:", error);
    process.exit(1);
  }
}

/**
 * 设置事件监听器来跟踪处理进度
 */
function setupEventListeners(agent: Agent) {
  console.log("设置事件监听器...");

  // 监听原始 X 内容事件
  agent.sensing.registerListener(async (evt) => {
    if (evt.type === "X_CONTENT_TO_PROCESS_EVENT") {
      const { authorUsername, post_content } = evt.payload;
      console.log(`\n📨 收到新内容待处理:`);
      console.log(`作者: ${authorUsername}`);
      console.log(`内容: ${post_content?.substring(0, 100)}...`);
    }
  });

  // 监听内容洞察事件
  agent.sensing.registerListener(async (evt) => {
    if (evt.type === "CONTENT_INSIGHT_AVAILABLE_EVENT") {
      const { contentInsight } = evt.payload;
      console.log(`\n🔍 内容评估完成:`);
      console.log(`作者: ${contentInsight.username}`);
      console.log(`有价值: ${contentInsight.hasValue ? '是' : '否'}`);
      console.log(`类别: ${contentInsight.category}`);
      console.log(`摘要: ${contentInsight.summary}`);
      
      if (contentInsight.entity?.name) {
        console.log(`实体: ${contentInsight.entity.name}`);
      }
      
      if (contentInsight.event?.name) {
        console.log(`事件: ${contentInsight.event.name}`);
      }
    }
  });

  // 监听深度搜索结果事件
  agent.sensing.registerListener(async (evt) => {
    if (evt.type === "PERPLEXITY_SEARCH_COMPLETED_EVENT") {
      const { searchResult } = evt.payload;
      console.log(`\n🔍 深度搜索完成:`);
      console.log(`查询: ${searchResult.query}`);
      console.log(`响应长度: ${searchResult.response.length} 字符`);
      console.log(`引用数量: ${searchResult.citations.length}`);
      console.log(`模型: ${searchResult.metadata.model}`);
      console.log(`令牌使用: ${searchResult.metadata.usage.total_tokens}`);
    }
  });

  // 监听爬虫更新事件
  agent.sensing.registerListener(async (evt) => {
    if (evt.type === "X_FOLLOWING_UPDATED_EVENT") {
      console.log(`\n👥 关注列表已更新，共 ${evt.payload.followingsCount} 个关注`);
    }
  });

  // 监听错误事件
  agent.sensing.registerListener(async (evt) => {
    if (evt.type === "X_ERROR_EVENT") {
      console.error(`\n❌ 爬虫错误: ${evt.description}`);
      if (evt.payload.error) {
        console.error("错误详情:", evt.payload.error);
      }
    }
  });

  console.log("✅ 事件监听器设置完成");
}

/**
 * 启动系统监控
 */
function startMonitoring(agent: Agent) {
  console.log("启动系统监控...");

  // 每30秒打印一次状态
  setInterval(() => {
    const now = new Date().toISOString();
    console.log(`\n⏰ [${now}] 系统运行状态检查`);
    console.log(`Agent ID: ${agent.agentId}`);
    console.log(`Agent Name: ${agent.name}`);
    
    // 这里可以添加更多监控信息，比如处理的内容数量、错误数量等
  }, 30000);

  console.log("✅ 系统监控已启动");
}

/**
 * 模拟测试内容处理（用于测试）
 */
function simulateTestContent(agent: Agent, userId: string) {
  console.log("准备模拟测试内容...");

  // 延迟几秒后开始模拟
  setTimeout(() => {
    console.log("\n🧪 模拟测试内容事件");
    
    // 模拟一个有价值的加密货币相关内容
    agent.sensing.emitEvent({
      type: "X_CONTENT_TO_PROCESS_EVENT",
      description: "模拟的测试内容待处理",
      payload: {
        userId: userId,
        post_content: "刚刚看到 Bitcoin 突破 $100,000 大关！这可能是由于机构投资者大量买入以及 ETF 资金流入导致的。链上数据显示大户地址在过去24小时内增持了超过 5,000 BTC。市场情绪极度乐观，但需要警惕可能的回调。#Bitcoin #BTC #100K",
        authorUsername: "crypto_analyst_test",
        url: "https://twitter.com/crypto_analyst_test/status/test123456789",
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now(),
    });

    // 5秒后模拟另一个内容
    setTimeout(() => {
      agent.sensing.emitEvent({
        type: "X_CONTENT_TO_PROCESS_EVENT",
        description: "模拟的测试内容待处理",
        payload: {
          userId: userId,
          post_content: "今天天气真好，适合出去散步。",
          authorUsername: "daily_user_test",
          url: "https://twitter.com/daily_user_test/status/test987654321",
          timestamp: new Date().toISOString(),
        },
        timestamp: Date.now(),
      });
    }, 5000);

  }, 3000);
}

// 启动系统
setupContentProcessSystem().catch((error) => {
  console.error("系统启动失败:", error);
  process.exit(1);
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n\n👋 收到关闭信号，正在优雅关闭系统...');
  console.log('感谢使用内容处理测试系统！');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 收到终止信号，正在关闭系统...');
  process.exit(0);
});

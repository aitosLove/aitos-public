// filepath: /Users/raymond/5mCode/wonderland/back/src/modules/xContentCrawler/test-module.ts
import { Agent } from "@/src/agent";
import { NullDatabase } from "@/src/agent/core/Store";
import * as dotenv from "dotenv";
import { enableXCrawlerModule } from "./index";

dotenv.config();

/**
 * 测试 X-Content-Crawler 模块
 * 此测试已更新以支持 agentId 字段
 */
async function setupXCrawlerSystem() {
  // 创建 Agent 实例
  const agentId = "116f25f9-7b19-4f87-9409-c82ac67f2785";
  const agent = new Agent({
    agentId: agentId,
    name: "X Content Crawler Test Agent",
    db: new NullDatabase(),
  });

  console.log("初始化 X Content Crawler 测试系统...");
  console.log(`使用 Agent ID: ${agentId}`);

  // 从环境变量获取 userId 或使用默认值
  const userId = process.env.X_USER_ID || "default_user_id";
  
  if (process.env.X_USER_ID === undefined) {
    console.warn("警告: 未设置 X_USER_ID 环境变量，使用默认值");
  }

  // 初始化 X Content Crawler 模块
  // 注意：agentId 已在 XCrawlerManager 构造函数中从 agent.agentId 获取
  const module = enableXCrawlerModule(agent, userId);
  
  // 检查模块是否成功初始化
  if (!module) {
    console.error("X Content Crawler 初始化失败，请检查用户认证和 cookies");
    process.exit(1);
  }
  
  console.log("X Content Crawler 系统初始化成功");
  console.log(`Agent ID: ${agent.agentId}`);
  console.log(`Agent Name: ${agent.name}`);
  console.log(`用户 ID: ${userId}`);

  // 注册事件监听器
  const offEventListener = agent.sensing.registerListener(async (evt) => {
    if (evt.type === "X_FOLLOWING_UPDATED_EVENT") {
      console.log(`关注列表已更新，共 ${evt.payload.followingsCount} 个关注`);
      // 新增：检查 agentId 是否正确传递
      console.log(`事件 agentId: ${evt.payload.agentId}`);
    }
    
    if (evt.type === "X_ERROR_EVENT") {
      console.error(`爬虫过程中发生错误: ${evt.description}`);
      // 新增：检查 agentId 是否正确传递
      console.log(`事件 agentId: ${evt.payload.agentId}`);
    }

    if (evt.type === "X_AUTH_REQUIRED_EVENT") {
      console.error(`需要 X 平台认证，请检查 cookies 设置`);
      // 新增：检查 agentId 是否正确传递
      console.log(`事件 agentId: ${evt.payload.agentId}`);
    }
    
    // 新增：处理内容更新完成事件
    if (evt.type === "X_CONTENT_UPDATED_EVENT") {
      console.log(`内容已更新，处理了 ${evt.payload.processedPostsCount} 个用户的内容`);
      console.log(`事件 agentId: ${evt.payload.agentId}`);
    }
    
    // 新增：处理待处理内容事件
    if (evt.type === "X_CONTENT_TO_PROCESS_EVENT") {
      console.log(`收到需要处理的 X 内容，来自 @${evt.payload.authorUsername}`);
      console.log(`内容 URL: ${evt.payload.url}`);
      console.log(`事件 agentId: ${evt.payload.agentId}`);
      // 可以对内容进行进一步处理，例如分析或摘要
    }
  });

  // 执行初始任务：更新关注列表
  console.log("正在请求更新关注列表...");
  agent.sensing.emitEvent({
    type: "UPDATE_X_FOLLOWING_EVENT",
    description: "更新 X 关注列表",
    payload: { userId },
    timestamp: Date.now(),
  });

  // 请求内容更新
  console.log("正在请求更新内容...");
  agent.sensing.emitEvent({
    type: "UPDATE_X_CONTENT_EVENT",
    description: "请求更新 X 内容",
    payload: { userId },
    timestamp: Date.now(),
  });

  // 返回清理函数和系统组件
  return {
    agent,
    module,
    teardown: () => {
      // 解除事件监听
      offEventListener();
      // 确保正确关闭模块
      module.shutdown().then(() => {
        console.log("X Content Crawler 模块已正确关闭");
      });
      console.log("X Content Crawler 测试系统已关闭");
    }
  };
}

async function main() {
  const system = await setupXCrawlerSystem();

  // 设置定时任务
  console.log("系统已启动，等待事件触发...");
  console.log("按 Ctrl+C 终止测试");

  // 设置 Ctrl+C 处理程序
  process.on("SIGINT", () => {
    console.log("\n收到中断信号，正在关闭...");
    system.teardown();
    process.exit(0);
  });

  // 手动触发测试事件
  console.log("\n可用的测试命令:");
  console.log("1 - 更新关注列表");
  console.log("2 - 更新内容");
  console.log("q - 退出测试\n");
  
  // 设置标准输入监听
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (key) => {
    const keyStr = String.fromCharCode(key[0]);
    
    if (keyStr === '1') {
      console.log("\n手动触发更新关注列表事件...");
      system.agent.sensing.emitEvent({
        type: "UPDATE_X_FOLLOWING_EVENT",
        description: "手动触发更新关注列表",
        payload: {},
        timestamp: Date.now(),
      });
    }
    
    if (keyStr === '2') {
      console.log("\n手动触发更新内容事件...");
      system.agent.sensing.emitEvent({
        type: "UPDATE_X_CONTENT_EVENT",
        description: "手动触发内容更新",
        payload: {},
        timestamp: Date.now(),
      });
    }
    
    if (keyStr === 'q' || key[0] === 3) { // 'q' or Ctrl+C
      console.log("\n退出测试...");
      system.teardown();
      process.exit(0);
    }
  });
  
  // 延迟 5 秒后自动触发更新内容事件，给系统一些时间先完成初始化
  setTimeout(() => {
    console.log("自动触发更新内容事件...");
    system.agent.sensing.emitEvent({
      type: "UPDATE_X_CONTENT_EVENT",
      description: "自动触发内容更新",
      payload: {},
      timestamp: Date.now(),
    });
  }, 5000);
}

// 启动测试系统
main().catch(err => console.error("运行测试时出错:", err));
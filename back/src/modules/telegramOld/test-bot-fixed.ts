import { Agent } from "@/src/agent";
import { NullDatabase } from "@/src/agent/core/Store";
import * as dotenv from "dotenv";
import { enableEnhancedTelegramModule } from "./index";

dotenv.config();

/**
 * 简化版增强型 Telegram 机器人测试系统
 * 专注于测试核心功能，避免依赖问题
 */
async function setupSimplifiedTelegramTest() {
  console.log("🚀 启动简化版 Telegram 机器人测试系统...");

  // 检查环境变量
  console.log("📋 检查环境变量...");
  if (!process.env.TELEGRAM_TOKEN) {
    console.error("❌ 未设置 TELEGRAM_TOKEN 环境变量");
    process.exit(1);
  } else {
    console.log("✅ TELEGRAM_TOKEN 已设置");
  }
  
  if (!process.env.USER_CHAT_ID) {
    console.error("❌ 未设置 USER_CHAT_ID 环境变量");
    process.exit(1);
  } else {
    console.log("✅ USER_CHAT_ID 已设置");
  }

  // 创建 Agent 实例
  const agentId = `enhanced-tg-bot-${Date.now()}`;
  const agent = new Agent({
    agentId: agentId,
    name: "Enhanced Telegram Bot Agent",
    db: new NullDatabase(),
  });

  console.log(`🤖 Agent 创建成功:`);
  console.log(`   ID: ${agentId}`);
  console.log(`   Name: ${agent.name}`);

  try {
    // 启用增强版 Telegram 模块
    console.log("\n🤖 启用增强版 Telegram 机器人...");
    const telegramModule = await enableEnhancedTelegramModule(agent);
    console.log("✅ 增强版 Telegram 机器人启用成功");
    
    // 获取 bot 管理器实例
    const botManager = telegramModule.getBotManager();
    
    // 注册测试命令
    registerTestCommands(botManager, agent);

    console.log("\n🎉 简化版 Telegram 机器人系统启动!");
    console.log("\n📱 您现在可以通过 Telegram 测试以下功能:");
    console.log("   • /help - 查看所有命令");
    console.log("   • /chat <消息> - 智能对话");
    console.log("   • /status - 系统状态");
    console.log("   • /test - 发送测试消息");
    console.log("   • /test_echo <文本> - 回显测试");
    console.log("   • /test_flow - 测试交互流程");
    console.log("   • 直接发送消息进行对话");

  } catch (error) {
    console.error("❌ 系统启动失败:", error);
    process.exit(1);
  }
}

/**
 * 注册测试命令
 */
function registerTestCommands(botManager: any, agent: Agent) {
  console.log("🧪 注册测试命令...");

  // 基础测试命令
  botManager.registerEnhancedCommand({
    command: "test",
    description: "🧪 发送测试消息",
    category: "system",
    handler: async (msg: any) => {
      console.log("[Test] 发送测试消息");
      await botManager.sendMessage("🧪 这是一条测试消息，机器人运行正常！");
    },
  });

  // 回显测试命令
  botManager.registerEnhancedCommand({
    command: "test_echo",
    description: "🔄 测试回显功能",
    category: "system",
    handler: async (msg: any, args?: string) => {
      const echoText = args || "没有提供任何文本";
      console.log(`[Test] 收到回显请求: ${echoText}`);
      await botManager.sendMessage(`🔄 回显: ${echoText}`);
    },
  });

  // 交互流程测试
  botManager.registerEnhancedCommand({
    command: "test_flow",
    description: "🔄 测试交互流程",
    category: "system",
    handler: async (msg: any) => {
      console.log("[Test] 启动交互流程测试");
      await botManager.sendMessage("🧪 开始交互流程测试...\n请选择一个选项: A、B 或 C");
      
      // 这里实际上会由流程管理器接管，此处只是模拟
      setTimeout(async () => {
        await botManager.sendMessage("注意：这是一个简化的交互流程演示，实际流程由交互流程管理器处理");
      }, 2000);
    },
  });

  // 基本状态命令
  botManager.registerEnhancedCommand({
    command: "status",
    description: "📊 查看系统状态",
    category: "system",
    handler: async (msg: any) => {
      console.log("[Test] 请求系统状态");
      
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);
      
      const statusMessage = `📊 **系统状态**\n\n` +
        `⏱️ 运行时间: ${uptimeHours}h ${uptimeMinutes}m\n` +
        `🤖 Agent: ${agent.agentId}\n` +
        `✅ 系统正常运行中`;
      
      await botManager.sendMessage(statusMessage);
    },
  });

  console.log("✅ 测试命令注册完成");
}

// 启动系统
setupSimplifiedTelegramTest().catch((error) => {
  console.error("系统启动失败:", error);
  process.exit(1);
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n\n👋 收到关闭信号，正在优雅关闭测试系统...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 收到终止信号，正在关闭系统...');
  process.exit(0);
});

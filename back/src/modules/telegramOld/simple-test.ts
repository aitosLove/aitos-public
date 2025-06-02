/**
 * 精简版 Telegram 机器人测试
 * 专注于 Telegram 信息交互和 Agent 事件处理
 */

import { Agent } from "@/src/agent";
import { NullDatabase } from "@/src/agent/core/Store";
import { enableSimplifiedTelegramModule } from "./simplified-index";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();

/**
 * 验证必需的环境变量
 */
function validateEnvironmentVariables(): { success: boolean; message: string } {
  const requiredVars = [
    'TELEGRAM_TOKEN',
    'USER_CHAT_ID'
  ];
  
  const optionalVars = [
    'TELEGRAM_CHAT_AI_ENDPOINT',
    'TELEGRAM_CHAT_AI_API'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return {
      success: false,
      message: `缺少必需的环境变量: ${missingVars.join(', ')}`
    };
  }
  
  // 检查可选环境变量并打印警告
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn(`⚠️ 警告: 以下可选环境变量未设置: ${missingOptional.join(', ')}`);
  }
  
  return { success: true, message: '环境变量检查通过' };
}

/**
 * 模拟一些测试事件
 */
function startTestEventSimulation(agent: Agent) {
  console.log("🧪 启动测试事件模拟...");

  // 每2分钟模拟一个事件
  setInterval(() => {
    const testEvents = [
      {
        type: "MARKET_INSIGHT_EVENT",
        description: "发现重要市场洞察",
        payload: {
          category: "价格分析",
          summary: "比特币突破关键阻力位，显示强劲上涨势头",
          confidence: 0.85,
          source: "技术分析"
        }
      },
      {
        type: "DEFI_ANALYSIS_COMPLETED_EVENT", 
        description: "DeFi 协议分析完成",
        payload: {
          protocol: "Uniswap V3",
          tvl: "$4.2B",
          change24h: "+5.3%",
          riskLevel: "低"
        }
      },
      {
        type: "CONTENT_INSIGHT_AVAILABLE_EVENT",
        description: "发现有价值内容",
        payload: {
          contentInsight: {
            hasValue: true,
            category: "market_insight",
            summary: "以太坊合并后质押奖励机制分析",
            source: "https://example.com/analysis",
            username: "crypto_analyst",
            entity: { name: "Ethereum", symbol: "ETH" },
            event: { name: "Staking Update", details: "New rewards mechanism" }
          }
        }
      }
    ];

    const randomEvent = testEvents[Math.floor(Math.random() * testEvents.length)];
    
    agent.sensing.emitEvent({
      ...randomEvent,
      timestamp: Date.now()
    });

    console.log(`🧪 [测试] 模拟事件: ${randomEvent.type}`);
  }, 2 * 60 * 1000);

  console.log("✅ 测试事件模拟已启动");
}

/**
 * 启动精简版 Telegram 系统
 */
async function startSimplifiedTelegramSystem() {
  console.log("🚀 启动精简版 Telegram 机器人系统...");

  // 验证环境变量
  const envCheck = validateEnvironmentVariables();
  if (!envCheck.success) {
    console.error(`❌ ${envCheck.message}`);
    process.exit(1);
  }

  console.log(`✅ ${envCheck.message}`);

  try {
    // 创建 Agent 实例
    const agentId = "wonderland-simplified-tg-bot";
    const agent = new Agent({
      agentId: agentId,
      name: "Wonderland Simplified TG Bot",
      db: new NullDatabase()
    });

    console.log(`🤖 Agent 实例已创建: ${agentId}`);

    // 启用精简版 Telegram 模块
    const telegramBot = await enableSimplifiedTelegramModule(agent);

    // 启动测试事件模拟
    if (process.env.NODE_ENV !== 'production') {
      startTestEventSimulation(agent);
    }

    // 输出启动成功提示
    console.log("\n✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨");
    console.log("🚀 精简版 Telegram Bot 已成功启动");
    console.log("✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨");

    console.log("\n📱 机器人功能:");
    console.log("   • 智能事件监听和分析");
    console.log("   • AI 驱动的价值判断");
    console.log("   • 用户命令处理");
    console.log("   • 自动消息推送");

    console.log("\n📋 可用命令:");
    console.log("   • /help - 查看帮助");
    console.log("   • /status - 系统状态");
    console.log("   • /search <关键词> - 搜索");
    console.log("   • /analyze <内容> - 分析");
    console.log("   • /insights - 获取洞察");

    console.log("\n🔔 智能通知:");
    console.log("   • AI 自动分析所有事件");
    console.log("   • 只推送有价值的信息");
    console.log("   • 格式化用户友好的消息");

    // 设置优雅关闭
    process.on('SIGINT', async () => {
      console.log('\n\n👋 收到关闭信号，正在优雅关闭...');
      await telegramBot.stop();
      console.log('🎉 精简版 Telegram Bot 已关闭');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n👋 收到终止信号，正在关闭...');
      await telegramBot.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ 系统启动失败:", error);
    process.exit(1);
  }
}

// 启动系统
if (require.main === module) {
  startSimplifiedTelegramSystem().catch((error) => {
    console.error("启动失败:", error);
    process.exit(1);
  });
}

export { startSimplifiedTelegramSystem };

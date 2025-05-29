import { Agent } from "@/src/agent";
import { NullDatabase } from "@/src/agent/core/Store";
import * as dotenv from "dotenv";
import { enableEnhancedTelegramModule } from "./index";
import { enableContentProcessModule } from "../contentProcess/index";
import { enableXCrawlerModule } from "../xContentCrawler/index";

dotenv.config();

/**
 * 增强版 Telegram 机器人测试系统
 * 集成内容处理、X 内容爬虫和智能对话功能
 */
async function setupEnhancedTelegramSystem() {
  console.log("🚀 启动增强版 Telegram 机器人测试系统...");

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

  // 从环境变量获取用户 ID
  const userId = process.env.X_USER_ID || "default_user_id";
  if (!process.env.X_USER_ID) {
    console.warn("⚠️  警告: 未设置 X_USER_ID 环境变量");
  }

  try {
    // 1. 启用内容处理模块
    console.log("\n📊 启用内容处理模块...");
    const contentProcessor = await enableContentProcessModule(agent, userId);
    console.log("✅ 内容处理模块启用成功");

    // 2. 启用 X 内容爬虫模块
    console.log("\n🕷️  启用 X 内容爬虫模块...");
    const xCrawler = enableXCrawlerModule(agent, userId);
    if (xCrawler) {
      console.log("✅ X 内容爬虫模块启用成功");
    } else {
      console.warn("⚠️  X 内容爬虫模块启用失败，但系统继续运行");
    }

    // 3. 启用增强版 Telegram 模块
    console.log("\n🤖 启用增强版 Telegram 机器人...");
    const telegramBot = await enableEnhancedTelegramModule(agent);
    console.log("✅ 增强版 Telegram 机器人启用成功");

    // 4. 注册额外的测试命令
    registerTestCommands(telegramBot, agent);

    // 5. 启动系统监控
    startSystemMonitoring(agent, telegramBot);

    // 6. 模拟一些测试事件（如果启用）
    if (process.env.ENABLE_TEST_EVENTS === "true") {
      console.log("\n🧪 启用测试事件模拟...");
      startTestEventSimulation(agent, userId);
    }

    console.log("\n🎉 增强版 Telegram 机器人系统完全启动!");
    console.log("\n📱 您现在可以通过 Telegram 使用以下功能:");
    console.log("   • /help - 查看所有命令");
    console.log("   • /chat <消息> - 智能对话");
    console.log("   • /insights - 查看内容洞察");
    console.log("   • /research - 查看研究报告");
    console.log("   • /status - 系统状态");
    console.log("   • 直接发送消息进行对话");

    console.log("\n🔔 自动通知已启用:");
    console.log("   • 发现有价值内容时会自动通知");
    console.log("   • 深度研究完成时会推送结果");
    console.log("   • 系统异常时会发送警报");

  } catch (error) {
    console.error("❌ 系统启动失败:", error);
    process.exit(1);
  }
}

/**
 * 注册测试命令
 */
function registerTestCommands(telegramBot: any, agent: Agent) {
  console.log("🧪 注册测试命令...");

  // 模拟内容洞察命令
  telegramBot.registerCommand({
    command: "simulate_insight",
    description: "🧪 模拟内容洞察事件",
    category: "system",
    handler: async (msg: any) => {
      console.log("[Test] 模拟内容洞察事件");
      
      agent.sensing.emitEvent({
        type: "CONTENT_INSIGHT_AVAILABLE_EVENT",
        description: "模拟的内容洞察事件",
        payload: {
          contentInsight: {
            agentId: agent.agentId,
            hasValue: true,
            category: "价格分析",
            summary: "比特币突破关键阻力位，显示强劲上涨势头",
            source: "https://twitter.com/test/status/123456789",
            username: "crypto_analyst_demo",
            timestamp: new Date().toISOString(),
            entity: {
              name: "Bitcoin",
              context: "主要加密货币"
            },
            event: {
              name: "价格突破",
              details: "突破 $100,000 阻力位"
            }
          }
        },
        timestamp: Date.now(),
      });

      await telegramBot.sendMessage("🧪 内容洞察事件已模拟触发！");
    },
  });

  // 模拟深度搜索命令
  telegramBot.registerCommand({
    command: "simulate_research",
    description: "🧪 模拟深度搜索事件",
    category: "system",
    handler: async (msg: any) => {
      console.log("[Test] 模拟深度搜索事件");
      
      agent.sensing.emitEvent({
        type: "PERPLEXITY_SEARCH_COMPLETED_EVENT",
        description: "模拟的深度搜索完成事件",
        payload: {
          searchResult: {
            query: "比特币价格突破 $100,000 的市场影响分析",
            response: "根据最新市场数据，比特币突破 $100,000 大关主要由以下因素推动：1. 机构投资者大量买入；2. ETF 资金持续流入；3. 美联储政策预期；4. 全球经济不确定性。这一突破可能引发新一轮牛市行情，但投资者需要警惕可能的短期回调风险。",
            citations: [
              { url: "https://example.com/analysis1", title: "机构投资报告" },
              { url: "https://example.com/analysis2", title: "ETF 数据分析" }
            ],
            metadata: {
              model: "sonar-deep-research",
              usage: { total_tokens: 1500, prompt_tokens: 500, completion_tokens: 1000, citation_tokens: 200, num_search_queries: 3 },
              timestamp: new Date().toISOString()
            },
            relatedTo: {
              contentId: "https://twitter.com/test/status/123456789",
              username: "crypto_analyst_demo",
              category: "价格分析"
            }
          }
        },
        timestamp: Date.now(),
      });

      await telegramBot.sendMessage("🧪 深度搜索事件已模拟触发！");
    },
  });

  // 系统压力测试命令
  telegramBot.registerCommand({
    command: "stress_test",
    description: "🧪 系统压力测试",
    category: "system",
    cooldown: 60, // 1分钟冷却
    handler: async (msg: any) => {
      await telegramBot.sendMessage("🧪 开始系统压力测试...");
      
      // 模拟多个快速事件
      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          agent.sensing.emitEvent({
            type: "X_CONTENT_TO_PROCESS_EVENT",
            description: `压力测试事件 ${i}`,
            payload: {
              userId: "stress_test_user",
              post_content: `这是第 ${i} 个压力测试内容，包含一些加密货币相关信息。BTC ETH SOL 价格分析。`,
              authorUsername: `test_user_${i}`,
              url: `https://twitter.com/test_user_${i}/status/${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
            timestamp: Date.now(),
          });
        }, i * 1000);
      }

      await telegramBot.sendMessage("🧪 压力测试完成！预计 5 秒内会收到多个处理结果。");
    },
  });

  console.log("✅ 测试命令注册完成");
}

/**
 * 启动系统监控
 */
function startSystemMonitoring(agent: Agent, telegramBot: any) {
  console.log("📊 启动系统监控...");

  // 每10分钟发送一次状态报告
  setInterval(async () => {
    const now = new Date().toLocaleString("zh-CN");
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    const statusMessage = `📊 **系统自动状态报告**\n\n` +
      `🕒 时间: ${now}\n` +
      `⏱️ 运行时间: ${uptimeHours}h ${uptimeMinutes}m\n` +
      `🤖 Agent: ${agent.agentId}\n` +
      `✅ 所有模块运行正常`;

    try {
      await telegramBot.sendMessage(statusMessage);
    } catch (error) {
      console.error("[Monitor] 发送状态报告失败:", error);
    }
  }, 10 * 60 * 1000);

  console.log("✅ 系统监控已启动");
}

/**
 * 启动测试事件模拟
 */
function startTestEventSimulation(agent: Agent, userId: string) {
  console.log("🧪 启动测试事件模拟...");

  // 每2分钟模拟一个内容处理事件
  setInterval(() => {
    const testContents = [
      "比特币今日突破历史新高，市场情绪极度乐观！#BTC #Crypto",
      "以太坊 2.0 升级进展顺利，质押奖励持续增长 #ETH",
      "DeFi 协议总锁仓量达到新高度，去中心化金融发展强劲",
      "NFT 市场出现新趋势，数字艺术品交易量激增",
      "央行数字货币 CBDC 研发取得重大突破"
    ];

    const randomContent = testContents[Math.floor(Math.random() * testContents.length)];
    const randomUser = `test_user_${Math.floor(Math.random() * 100)}`;

    agent.sensing.emitEvent({
      type: "X_CONTENT_TO_PROCESS_EVENT",
      description: "自动测试内容事件",
      payload: {
        userId: userId,
        post_content: randomContent,
        authorUsername: randomUser,
        url: `https://twitter.com/${randomUser}/status/${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now(),
    });

    console.log(`🧪 [测试] 模拟内容: ${randomContent.substring(0, 30)}...`);
  }, 2 * 60 * 1000);

  console.log("✅ 测试事件模拟已启动");
}

// 启动系统
setupEnhancedTelegramSystem().catch((error) => {
  console.error("系统启动失败:", error);
  process.exit(1);
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n\n👋 收到关闭信号，正在优雅关闭增强版 Telegram 系统...');
  console.log('🎉 感谢使用 Wonderland Enhanced Telegram Bot！');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 收到终止信号，正在关闭系统...');
  process.exit(0);
});

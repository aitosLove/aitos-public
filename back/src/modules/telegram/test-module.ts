import { Agent } from "@/src/agent";
import { NullDatabase } from "@/src/agent/core/Store";
import { enableTelegramModule, TelegramModuleConfig } from "@/src/modules/telegram";

// 创建测试用的 Agent
const testAgent = new Agent({
  agentId: "telegram-test-agent",
  db: new NullDatabase(),
});

async function main() {
  // 检查环境变量
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("❌ TELEGRAM_BOT_TOKEN environment variable is required");
    console.log("Please set your Telegram bot token:");
    console.log("export TELEGRAM_BOT_TOKEN='your_bot_token_here'");
    process.exit(1);
  }

  // 配置允许的用户ID（可选）
  const allowedUsersEnv = process.env.TELEGRAM_ALLOWED_USERS;
  const allowedUsers = allowedUsersEnv 
    ? allowedUsersEnv.split(',').map(id => parseInt(id.trim()))
    : undefined;

  const telegramConfig: TelegramModuleConfig = {
    botToken,
    allowedUsers, // 如果设置了环境变量则使用，否则允许所有用户
  };

  console.log("[Test] Starting Telegram module test...");
  console.log(`[Test] Allowed users: ${allowedUsers ? allowedUsers.join(', ') : 'All users'}`);

  try {
    // 启用 Telegram 模块
    const telegramModule = enableTelegramModule(testAgent, telegramConfig);
    console.log("[Test] Telegram module enabled successfully");

    // 设置事件监听器来监听所有事件并分析
    testAgent.sensing.registerListener(async (evt) => {
      console.log(`[Test] Received event: ${evt.type}`);
      console.log(`[Test] Event payload:`, evt.payload);
      
      // 模拟一些有趣的事件来测试AI分析和推送功能
      if (evt.type === "TG_USER_MESSAGE") {
        const userMessage = evt.payload.message;
        
        // 如果用户发送特定命令，模拟一些系统事件
        if (userMessage.toLowerCase().includes('test event')) {
          setTimeout(() => {
            console.log("[Test] Simulating price update event...");
            testAgent.sensing.emitEvent({
              type: "PRICE_UPDATE",
              description: "Cryptocurrency price update",
              payload: {
                symbol: "BTC",
                price: 45000 + Math.random() * 1000,
                change: (Math.random() - 0.5) * 10,
                timestamp: Date.now()
              },
              timestamp: Date.now(),
            });
          }, 2000);

          setTimeout(() => {
            console.log("[Test] Simulating system alert event...");
            testAgent.sensing.emitEvent({
              type: "SYSTEM_ALERT",
              description: "High memory usage detected",
              payload: {
                type: "memory",
                usage: 85.6,
                threshold: 80,
                severity: "warning"
              },
              timestamp: Date.now(),
            });
          }, 4000);
        }

        if (userMessage.toLowerCase().includes('status')) {
          setTimeout(() => {
            console.log("[Test] Simulating status update event...");
            testAgent.sensing.emitEvent({
              type: "SERVICE_STATUS",
              description: "Service health check completed",
              payload: {
                services: {
                  database: "healthy",
                  api: "healthy", 
                  telegram: "healthy"
                },
                uptime: "24h 15m",
                last_check: new Date().toISOString()
              },
              timestamp: Date.now(),
            });
          }, 1000);
        }
      }
    });

    // 模拟一些定期事件
    setInterval(() => {
      testAgent.sensing.emitEvent({
        type: "HEARTBEAT",
        description: "System heartbeat",
        payload: {
          timestamp: Date.now(),
          memory_usage: Math.random() * 100,
          cpu_usage: Math.random() * 100
        },
        timestamp: Date.now(),
      });
    }, 30000); // 每30秒一次心跳

    console.log(`
🤖 Telegram 测试模块已启动！

📱 如何测试：
1. 在 Telegram 中找到你的机器人
2. 发送 /start 开始对话
3. 发送 "test event" 触发模拟事件
4. 发送 "status" 查看系统状态
5. 发送任何消息与 AI 聊天

📋 环境变量配置：
- TELEGRAM_BOT_TOKEN: ${botToken ? '✅ 已设置' : '❌ 未设置'}
- TELEGRAM_ALLOWED_USERS: ${allowedUsers ? `✅ ${allowedUsers.join(', ')}` : '⚠️  未设置（允许所有用户）'}

🔧 要限制用户访问，请设置：
export TELEGRAM_ALLOWED_USERS="user_id1,user_id2"

按 Ctrl+C 停止测试...
    `);

    // 优雅关闭处理
    process.on('SIGINT', () => {
      console.log('\n[Test] Shutting down gracefully...');
      telegramModule.disable();
      process.exit(0);
    });

  } catch (error) {
    console.error("[Test] Failed to start Telegram module:", error);
    process.exit(1);
  }
}

// 启动测试
main().catch((err) => {
  console.error("[Test] Unexpected error:", err);
  process.exit(1);
});

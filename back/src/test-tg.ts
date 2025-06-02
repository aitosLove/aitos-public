/**
 * main.ts
 *
 * 应用程序入口文件。
 * 1. 创建 Agent 实例
 * 2. (可选) 启用一些扩展模块
 * 3. 发事件或创建任务进行演示
 * 4. 定期打印监控状态
 */

import { Agent } from "./agent";
import { DefaultSensing } from "./agent/core/Sensing";
import { NullDatabase } from "./agent/core/Store";
import { enableXCrawlerModule } from "./modules/xContentCrawler";
import { enableTelegramModule } from "./modules/telegram";
import { enableAitosBlueprint } from "./blueprints";
import { DrizzleDatabase } from "./templateDB";
import * as dotenv from "dotenv";

dotenv.config();

const nullDatabase = new NullDatabase();
const groupChannel = new DefaultSensing({
  db: nullDatabase,
  sensingId: "wonderland-v2-group-sensing",
});

const agentId = "new-wonderland-v2-test";

export const mainAgent = new Agent({
  db: new DrizzleDatabase(agentId),
  groupSensing: groupChannel,
});

async function main() {
  // 启用TG模块
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("[main] 错误: 缺少 TELEGRAM_BOT_TOKEN 环境变量");
    } else {
      await enableTelegramModule(mainAgent, {
        botToken: botToken,
      });
      console.log("[main] Telegram module enabled successfully.");
    }
  } catch (error) {
    console.error("[main] Failed to enable Telegram module:", error);
  }

  if (process.env.userId) {
    enableXCrawlerModule(mainAgent, process.env.userId);
    console.log("[main] Agent started with X crawler module enabled.");
  }
  
}
// 启动
main().catch((err) => console.error(err));

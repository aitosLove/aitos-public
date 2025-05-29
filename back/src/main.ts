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
// import { enableInvestmentModule } from "./modules/wonderland-v1";
import { enableWonderlandModule } from "./modules/use-v3";
import { enableXCrawlerModule } from "./modules/xContentCrawler";
import { enableEnhancedTelegramModule } from "./modules/tg";
import { DrizzleDatabase } from "./templateDB";

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
  enableWonderlandModule(mainAgent);
  console.log("[main] Agent started with Wonderland V3 module enabled.");

  // 启用TG模块
  try {
    await enableEnhancedTelegramModule(mainAgent);
    console.log("[main] Enhanced Telegram module enabled successfully.");
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

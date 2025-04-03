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
// import { enableInvestmentModule } from "./modules/wonderland-v1";
import { enableSuikaiModule } from "./modules/suikai/suikai_v4";
import { enableWonderlandModule } from "./modules/wonderland-v1";
import { enableThrowEventModule } from "./modules/test/throw_event";
import TelegramBot from "node-telegram-bot-api";
import { enableTgInsightModule } from "./modules/tg/throw_insight";

export const agent = new Agent();

async function main() {
  // enableScheduleModule(agent);
  // enableHookModule(agent);

  // enableSuikaiModule(agent);
  // console.log("[main] Agent started with Suikai V4 module enabled.");

  enableWonderlandModule(agent);
  console.log("[main] Agent started with Wonderland V1 module enabled.");

  // enableThrowEventModule(agent);
  // console.log("[main] Agent started with ThrowEvent module enabled.");

  // enableTgInsightModule(agent);
  // console.log("[main] Agent started with TG message module enabled.");
}
// 启动
main().catch((err) => console.error(err));

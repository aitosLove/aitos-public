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
import { enableInvestmentModule } from "./modules/suikai_v2";
// import { enableThrowEventModule } from "./modules/test/throw_event";

export const agent = new Agent();

async function main() {
  // enableScheduleModule(agent);
  // enableHookModule(agent);

  enableInvestmentModule(agent);
  console.log("[main] Agent started with Suikai module enabled.");

  // enableThrowEventModule(agent);
  // console.log("[main] Agent started with ThrowEvent module enabled.");
}

// 启动
main().catch((err) => console.error(err));

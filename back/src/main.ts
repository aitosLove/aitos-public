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
import { enableInvestmentModule } from "./modules/suikai";
import { enableThrowEventModule } from "./modules/test/throw_event";

export const agent = new Agent();

async function main() {
  // 1. 创建Agent
  // 2. 启用 schedule/hook 等模块 (可注释其中任意行)
  // enableScheduleModule(agent);
  // enableHookModule(agent);

  enableInvestmentModule(agent);

  // enableThrowEventModule(agent);

  console.log("[main] Agent started with rate module enabled.");
}

// 启动
main().catch((err) => console.error(err));

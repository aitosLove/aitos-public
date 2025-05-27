import { Agent } from "@/src/agent";
import { DefaultSensing } from "@/src/agent/core/Sensing";
import { NullDatabase } from "@/src/agent/core/Store";
import { enableAptosPortfolioModule } from "./index";
import * as dotenv from "dotenv";
import { APT, USDC, AMI, THL, PROPS } from "../autoPortfolio/chain/apt/coin";
import * as cron from "node-cron";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { insightStateTable } from "@/db/schema/moduleSchema/defiSchema";
import { TokenOnPortfolio } from "../autoPortfolio/type";

dotenv.config();

/**
 * 设置 APTOS 投资组合系统的示例
 */
export async function setupAptosPortfolioSystem() {
  // 创建 Agent 实例
  const agent = new Agent({
    agentId: "cdaf5083-9d73-494c-99fa-69924d696788",
    name: "APTOS Portfolio Manager",
    db: new NullDatabase(),
  });

  // 获取私钥
  const privateKey = process.env.APTS_SECRET_KEY || "";
  if (!privateKey) {
    console.error("错误: 缺少 APTS_SECRET_KEY 环境变量");
    process.exit(1);
  }

  // 启用 APTOS 投资组合模块
  const module = enableAptosPortfolioModule(agent, {
    privateKey: privateKey,
    selectedTokens: [APT, USDC, AMI, THL, PROPS], // 选择我们想要管理的代币
    detailed: true, // 启用详细日志输出
  });

  console.log("APTOS 投资组合系统已启动");
  console.log(`Agent ID: ${agent.agentId}`);
  console.log(`Agent Name: ${agent.name}`);

  // 设置定时任务示例
  //   cron.schedule("0 */6 * * *", () => {
  //     console.log("执行定期持仓更新...");
  //     agent.sensing.emitEvent({
  //       type: "GET_HOLDING_REQUEST",
  //       description: "Periodic portfolio holding update",
  //       payload: {},
  //       timestamp: Date.now(),
  //     });
  //   });

  // 注册一些事件监听器来展示功能
  const offGetHoldingListener = agent.sensing.registerListener(async (evt) => {
    if (evt.type === "GET_HOLDING_RESULT") {
      console.log("收到持仓数据:", evt.payload.holdings);
    }

    if (evt.type === "GET_PORTFOLIO_SUGGESTION_RESULT") {
      console.log("收到投资组合建议:");
      console.log("- 调整目标:", evt.payload.targets);
      console.log("- 调整理由:", evt.payload.thinking);

      // 在实际应用中，这里可能会有用户确认的步骤
      // 为了演示，我们在收到建议后3秒自动确认
      console.log("将在3秒后确认执行调整...");
      setTimeout(() => {
        agent.sensing.emitEvent({
          type: "CONFIRM_PORTFOLIO_ADJUSTMENT",
          description: "Confirm portfolio adjustment execution",
          payload: {},
          timestamp: Date.now(),
        });
      }, 3000);
    }

    if (evt.type === "PORTFOLIO_ADJUSTMENT_COMPLETED") {
      console.log("投资组合调整已完成");
    }

    if (evt.type === "PORTFOLIO_ADJUSTMENT_FAILED") {
      console.error("投资组合调整失败:", evt.payload.error);
    }
  });

  // 启动初始持仓查询
  console.log("正在请求初始持仓数据...");
  agent.sensing.emitEvent({
    type: "GET_HOLDING_REQUEST",
    description: "Initial portfolio holding request",
    payload: {},
    timestamp: Date.now(),
  });

  // 启动初始调仓
  const realInsight = await db.query.insightStateTable.findFirst({
    orderBy: (insightStateTable, { desc }) => [
      desc(insightStateTable.timestamp),
    ],
    where: eq(insightStateTable.agentId, agent.agentId),
  });
  if (!realInsight) {
    throw new Error("No insight state found");
  }

  // 请求投资建议
  console.log("请求投资组合建议...");
  agent.sensing.emitEvent({
    type: "GET_PORTFOLIO_SUGGESTION_REQUEST",
    description:
      "Request portfolio suggestion based on current holdings and market insight",
    payload: {
      insight: realInsight.insight,
    },
    timestamp: Date.now(),
  });

  return {
    agent,
    module,
    teardown: () => {
      // 清理函数
      module.offListener.getHolding();
      module.offListener.getSuggestion();
      module.offListener.confirmAdjustment();
      console.log("APTOS 投资组合系统已关闭");
    },
  };
}

async function main() {
  const system = await setupAptosPortfolioSystem();

  // 设置 Ctrl+C 处理程序
  process.on("SIGINT", () => {
    console.log("\n收到中断信号，正在关闭...");
    system.teardown();
    process.exit(0);
  });
}
main();

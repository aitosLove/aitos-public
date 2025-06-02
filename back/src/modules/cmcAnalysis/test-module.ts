import { Agent } from "@/src/agent";
import { NullDatabase } from "@/src/agent/core/Store";
import { enableAnalystModule } from "@/src/modules/cmcAnalysis";
import { analysis_portfolio_apt } from "../autoPortfolio/chain/apt/rate-analysis-cmc";
const nullDatabase = new NullDatabase();

const mainAgent = new Agent({
  agentId: "cdaf5083-9d73-494c-99fa-69924d696788",
  db: new NullDatabase(),
});

async function main() {
  const analystModule = enableAnalystModule(mainAgent, {
    analysisPortfolio: analysis_portfolio_apt,
  });
  console.log("[main] Agent started with Analyst module enabled.");

  // 手动泵入事件
  console.log(`
    Emit Event manually to trigger the task.
    Test UPDATE_PRICE_USE_CMC: Update price rate.`);

  mainAgent.sensing.emitEvent({
    type: "UPDATE_PRICE_USE_CMC",
    description: "Agent should update price rate.",
    payload: {},
    timestamp: Date.now(),
  });

  // 模块没有控制逻辑，因此手动添加控制逻辑
  mainAgent.sensing.registerListener((evt) => {
    if (evt.type === "UPDATE_RATE_SUCCESS") {
      console.log(
        "Price updated successfully. Now emit update insight event in sensing."
      );
      mainAgent.sensing.emitEvent({
        type: "UPDATE_INSIGHT",
        description: "Agent should update insight.",
        payload: {},
        timestamp: Date.now(),
      });
    }
  });
}
// 启动
main().catch((err) => console.error(err));

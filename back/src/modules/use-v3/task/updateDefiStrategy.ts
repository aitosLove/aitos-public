import type { Agent } from "@/src/agent";
import { getPoolInfo } from "../defi/navi/naviInfo";
import { getHolding } from "../portfolio/getHolding";
import { getDefiInsightPrompt } from "../config";
import { db } from "@/db";

import { defiInsightTable } from "@/db/schema/moduleSchema";
import { getNewestDefiInstruct } from "@/db/getInstruct";

export function updateDefiStrategy(agent: Agent) {
  const defiStrategyTask = agent.taskManager.createTask<null>({
    type: "UPDATE_DEFI_STRATEGY_TASK",
    description: "Update Defi Strategy using AI",
    payload: null,
    callback: async () => {
      try {
        const { validPortfolio } = await getHolding();
        const { poolDescription } = await getPoolInfo();

        const preference_instruct = await getNewestDefiInstruct();

        const defi_instruct = await getDefiInsightPrompt({
          preference_instruct,
        });

        // console.log(`poolDescription is ${poolDescription}`);
        agent.thinking
          .response({
            model: "reason",
            platform: "deepseek",
            input: `
            ${poolDescription}
            ---
            Holding:${validPortfolio.map((coin) => {
              return `
              ${coin.coinSymbol}:${coin.percentage}%(value:${coin.balanceUsd})
              `;
            })}
            `,
            systemPrompt: defi_instruct,
          })
          .then((defiInsight) => {
            if (defiInsight === "error") {
              throw new Error("insight is error. Please check.");
            }
            console.log("-----");

            console.log(`update defi insight is`, defiInsight);

            db.insert(defiInsightTable)
              .values({
                insight: defiInsight,
              })
              .then((res) => {
                console.log(`${Date.now()}insert defi insight success`);
              });
          });
      } catch (error) {
        console.error("Error updating portfolio:", error);
      }
    },
  });
}

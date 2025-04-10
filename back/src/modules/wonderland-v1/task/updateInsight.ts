import type { Agent } from "@/src/agent";
import { insightStateTable, marketStateTable } from "@/db/schema";
import type { InvestmentState } from "../market/cmc";
import { getMarketInsightPrompt } from "../config/prompt";

import { getNewestMarketInstruct } from "@/db/getInstruct";
import { db } from "@/db";
import { analysis_portfolio } from "../config/cmc-market-analysis";

export function updateInsight(agent: Agent, investmentState: InvestmentState) {
  const insightsTask = agent.taskManager.createTask<null>({
    type: "UPDATE_INSIGHT_TASK",
    descrpition: "Update Insight according to Price Ratios",
    payload: null,
    callback: async () => {
      try {
        const { formattedString, marketData } =
          investmentState.generateRate(analysis_portfolio);

        console.log(marketData);
        console.log("-----");

        const preference_instruct = await getNewestMarketInstruct();
        const instruct = await getMarketInsightPrompt({
          analysis_portfolio,
          preference_instruct,
        });

        console.log(`system prompt is ${instruct}${formattedString}`);
        agent.thinking
          .response({
            model: "reason",
            platform: "deepseek",
            input: `
${instruct}
${formattedString}
`,
            systemPrompt: `You are a professional crypto investor. Please analyze the current market situation.`,
          })
          .then((insight) => {
            if (insight === "error") {
              throw new Error("insight is error. Please check.");
            }
            console.log("-----");

            console.log(`update insight is`, insight);

            db.insert(insightStateTable)
              .values({
                insight: insight,
              })
              .then((res) => {
                console.log(`${Date.now()}insert insight success`);

                // 泵出insight报告生成完成事件
                //  this.agent.sensing.emitEvent({
                //   type: "UPDATE_INSIGHT_COMPLETE",
                //   description: "Agent has finished insight",
                //   payload: {},
                //   timestamp: Date.now(),
                // });

                // 完成后立刻更新持仓
                agent.sensing.emitEvent({
                  type: "UPDATE_PORTFOLIO_EVENT",
                  description: "Agent should update portfolio",
                  payload: {},
                  timestamp: Date.now(),
                });
              });
          })
          .catch((e) => {
            console.log("error in generating response", e);
          });

        db.insert(marketStateTable)
          .values({
            marketData: marketData,
          })
          .then((res) => {
            console.log(`${Date.now()}insert market success`);
          });
      } catch (error) {
        console.error("Error updating insights:", error);
      }
    },
  });
}

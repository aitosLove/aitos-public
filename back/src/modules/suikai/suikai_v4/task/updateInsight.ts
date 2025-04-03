import type { Agent } from "@/src/agent";
import { insightStateTable, marketStateTable } from "@/db/schema";
import type { InvestmentState } from "../market/cmc";

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

        const sui_instruct = await getMarketInsightPrompt();

        console.log(`system prompt is ${sui_instruct}${formattedString}`);
        agent.thinking
          .response({
            model: "reason",
            platform: "deepseek",
            input: `
${sui_instruct}
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

async function getMarketInsightPrompt() {
  const preference_instruct = await getNewestMarketInstruct();
  const sui_instruct = `
  Here are a few crypto asset ratio data for one month. Please analyze it. What do you think of the current market situation? And what's your opinion of SUI and its ecosystem?
  
  [Main Indicators Interpretation] 
  - ETH/BTC: Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity. 
  - SUI/BTC: Cross-chain market sentiment indicator, which reflects the relative strength of the Sui network in comparison to Bitcoin. A stronger indicator suggests that Sui’s ecosystem is gaining traction or is more active than Bitcoin, especially within its decentralized finance or smart contract ecosystem.
  - SUI/ETH: Comparative ecosystem growth indicator, which measures the relative development of the Sui network compared to Ethereum. A stronger indicator indicates that Sui is showing better adoption, performance, or growth relative to Ethereum, potentially signaling its emergence as a new competitor in the smart contract and DeFi space.
  
  [Prefenence Instruct]
  ${preference_instruct}
  
  [Potential Assets Indicators Interpretation] & [All these tokens are SUI ecosystem tokens]
  ${analysis_portfolio
    .map(
      (coin) =>
        `- ${coin.assetA.symbol}/ ${coin.assetB.symbol}: ${coin.A_on_B_introduction}`
    )
    .join("\n")}
  
  [ratio data]
  `;

  return sui_instruct;
}

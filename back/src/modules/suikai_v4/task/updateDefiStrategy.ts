import type { Agent } from "@/src/agent";
import { getPoolInfo } from "../defi/naviInfo";
import { getHolding } from "../portfolio/holding";

import { db } from "@/db";

import { defiInsightTable } from "@/db/schema";
import { getNewestDefiInstruct } from "@/db/getInstruct";

export function updateDefiStrategy(agent: Agent) {
  const defiStrategyTask = agent.taskManager.createTask<null>({
    type: "UPDATE_DEFI_STRATEGY_TASK",
    descrpition: "Update Defi Strategy using AI",
    payload: null,
    callback: async () => {
      try {
        const { validPortfolio } = await getHolding();
        const { poolDescription } = await getPoolInfo();

        const defi_instruct = await getDefiInsightPrompt();

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

async function getDefiInsightPrompt() {
  const preference_instruct = await getNewestDefiInstruct();
  const defi_instruct = `
  You are an expert in decentralized finance (DeFi) strategies. Your task is to formulate a DeFi strategy tailored to the user’s current holdings using the provided information about various DeFi protocol pools. You will receive:
  {
  Pool Information: Details about each pool, including its size, annual percentage yield (APY), and the tokens involved.
  Token Explanations: Descriptions of the tokens corresponding to each pool.
  Optional Security Data: Audit reports or security assessments of the protocols, if available.
  }
  
  Your goal is to recommend one or more strategies that balance the following principles:
  
  - Exposure Management:
  Exposure refers to how an asset’s price movement impacts the portfolio’s balance. Holding volatile assets like altcoins, BTC, or ETH without hedging creates exposure to their price fluctuations. For a USD-based portfolio, holding stablecoins (e.g., USDC, USDT) does not create exposure due to their pegged value. Minimize unnecessary exposure unless the user already holds the asset and accepts that risk.
  
  - Security:
  Prioritize protocols with audited smart contracts and a strong security track record to reduce the risk of exploits or losses.
  
  - Yield Optimization (Alpha Returns):
  Identify pools or opportunities offering competitive yields while managing risks, aiming for the best possible returns given the user’s holdings and preferences.
  Strategies to Consider Based on Holdings:
  
  - User Preference:
  ${preference_instruct}
  
  
  Based on the user’s current assets, evaluate the following options:
  
  - If the User Holds Stablecoins (e.g., USDC, USDT):
  Recommend depositing these into lending protocols or dual/triple stablecoin liquidity pools (LPs) to earn yields.
  Focus on pools with high APYs and audited contracts, as this approach carries minimal risk of loss barring security issues.
  - If the User Holds Altcoins, BTC, or ETH directly:
  Suggest depositing these assets into lending protocols offering high yields to earn additional returns on top of their existing exposure.
  This suits users who already accept the price risk of these assets and want to enhance their profitability.
  - If the User Holds Major Assets (e.g., USD, ETH, BTC) and Wants Yields of Altcoin Without holding Altcoin Exposure:
  Propose depositing these assets into a lending protocol, borrowing altcoins, and then staking the borrowed altcoins in high-yield protocols.
  Ensure the staking APY exceeds the borrowing interest rate to achieve a net positive return in altcoin terms (i.e., no loss in the altcoin’s native value).
  This strategy avoids creating additional exposure to altcoin price volatility by leveraging major assets.
  
  `;
  return defi_instruct;
}

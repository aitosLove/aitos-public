import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import cron from "node-cron";
import { db } from "@/db";
import pLimit from "p-limit";
import {
  insightStateTable,
  marketStateTable,
  holdingStateTable,
} from "@/db/schema";
import { adjustPortfolio_by_AI } from "./portfolio/ai_helper";
import { analysis_config } from "./config/coin";
import { getHolding } from "./portfolio/core";

import { InvestmentState, getHistoricalData } from "./market/cmc";

class InvestmentManager {
  private agent: Agent;
  private localState: InvestmentState;

  constructor(agent: Agent) {
    this.agent = agent;
    this.localState = new InvestmentState();
  }

  init() {
    // event link : update rate(新的价格和比值数据) -》 update insight(新的见解) -》 update portfolio(新的投资组合) -》 update holding(立刻刷新持仓数据)
    // 特别的，holding每5分钟会额外进行一次，来帮助前端获取新的持仓数据，这个过程很容易爆调用，所以要做缓存

    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "UPDATE_RATE_EVENT") {
        console.log("Received UPDATE_RATE_EVENT");
        this.updatePricesTask();
      }

      if (evt.type === "UPDATE_INSIGHT_EVENT") {
        this.updateInsightsTask();
      }

      if (evt.type === "UPDATE_PORTFOLIO_EVENT") {
        this.updatePortfolioTask();
      }

      if (evt.type === "UPDATE_HOLDING_EVENT") {
        this.updateHoldingTask();
      }
    });

    cron.schedule("0 */30 * * * *", async () => {
      // 触发更新价格任务
      // 开发状态不要在这里触发事件，由于JS执行顺序的问题，这里扔出来的事件还没有注册监听器
      this.agent.sensing.emitEvent({
        type: "UPDATE_RATE_EVENT",
        description: "Agent should update price rate",
        payload: {},
        timestamp: Date.now(),
      });
    });

    // 定时触发更新holding
    cron.schedule("0 */5 * * * *", async () => {
      this.agent.sensing.emitEvent({
        type: "UPDATE_HOLDING_EVENT",
        description: "Agent should update holding",
        payload: {},
        timestamp: Date.now(),
      });
    });
  }

  // 任务方法：更新价格
  updatePricesTask() {
    const priceUpdateTask = this.agent.taskManager.createTask<null>({
      type: "UPDATE_PRICE_TASK",
      descrpition: "Update Price by CoinMarketCap API",
      payload: null,
      callback: async () => {
        try {
          for (const coin of analysis_config) {
            if (coin.enabled) {
              await this.fetchAndStorePrice(coin.cmcId, coin.name);
            }
          }

          // Trigger event after prices are updated
          this.agent.sensing.emitEvent({
            type: "UPDATE_INSIGHT_EVENT",
            description: "Price updated. Now you should update insight.",
            payload: {},
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("Error updating prices:", error);
        }
      },
    });
    console.log(`time${Date.now()} updatePricesTask`);
  }

  // 任务方法：更新认知（根据价格生成见解）
  updateInsightsTask() {
    const insightsTask = this.agent.taskManager.createTask<null>({
      type: "UPDATE_INSIGHT_TASK",
      descrpition: "Update Insight according to Price Ratios",
      payload: null,
      callback: async () => {
        try {
          const { formattedString, marketData } =
            this.localState.generateRate(analysis_config);

          console.log(marketData);
          console.log("-----");

          console.log(`system prompt is ${sui_instruct}${formattedString}`);
          this.agent.thinking
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

                  // 完成后立刻更新持仓
                  this.agent.sensing.emitEvent({
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
    console.log(`time${Date.now()} updateInsightsTask`);
  }

  async fetchAndStorePrice(id: string, asset: string) {
    const limit = pLimit(2);

    // const intervals = ["1h", "4h", "12h", "1d", "2d", "3d", "7d", "15d", "30d"];
    const intervals = ["1h", "1d", "3d", "7d", "30d"];
    const currentSpot = "5m";

    const price = await Promise.all(
      intervals.map((interval) =>
        limit(() => getHistoricalData({ id, interval, name: asset }))
      )
    );

    // Store prices for different intervals
    price.forEach((p, idx) => {
      if (p) {
        // 只在成功获取价格才更新
        this.localState.setPrice(asset, intervals[idx], p);
      }
    });

    // Store current price for the asset (5m)
    const currentPrice = await limit(() =>
      getHistoricalData({ id, interval: currentSpot })
    );

    if (currentPrice) {
      // 只在成功获取价格才更新
      this.localState.setPrice(asset, currentSpot, currentPrice);
    }
  }

  updatePortfolioTask() {
    const portfolioTask = this.agent.taskManager.createTask<null>({
      type: "UPDATE_PORTFOLIO_TASK",
      descrpition: "Update Portfolio using AI",
      payload: null,
      callback: async () => {
        try {
          const current_holding = await getHolding();
          const insight = await db.query.insightStateTable.findFirst({
            orderBy: (marketStateTable, { desc }) => [
              desc(marketStateTable.timestamp),
            ],
          });
          if (!insight) {
            throw new Error("No insight state found");
          }

          const portfolio = adjustPortfolio_by_AI({
            current_holding: JSON.stringify(current_holding.validPortfolio),
            insight: insight.insight,
          }).then((res) => {
            // 完成后立刻更新持仓
            this.agent.sensing.emitEvent({
              type: "UPDATE_HOLDING_EVENT",
              description: "Agent should update holding",
              payload: {},
              timestamp: Date.now(),
            });
          });
        } catch (error) {
          console.error("Error updating portfolio:", error);
        }
      },
    });
  }

  updateHoldingTask() {
    const holdingTask = this.agent.taskManager.createTask<null>({
      type: "UPDATE_HOLDING_TASK",
      descrpition: "Update Holding using SUI Scan",
      payload: null,
      callback: async () => {
        try {
          console.log("update holding task");

          const holding = await getHolding();

          db.insert(holdingStateTable)
            .values({
              holding: holding,
            })
            .then((res) => {
              console.log(`${Date.now()}insert holding data success`);
            });

          // console.log("Holding:", holding);
        } catch (error) {
          console.error("Error updating holding:", error);
        }
      },
    });
  }
}
export function enableInvestmentModule(agent: Agent) {
  const investmentMgr = new InvestmentManager(agent);
  investmentMgr.init();

  agent.sensing.emitEvent({
    type: "UPDATE_RATE_EVENT",
    description: "Agent should update price rate.",
    payload: {},
    timestamp: Date.now(),
  });

  console.log("[InvestmentModule] Enabled.");
}

const sui_instruct = `
Here are a few crypto asset ratio data for one month. Please analyze it. What do you think of the current market situation? And what's your opinion of SUI and its ecosystem?

[Main Indicators Interpretation] 
- ETH/BTC: Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity. 
- SUI/BTC: Cross-chain market sentiment indicator, which reflects the relative strength of the Sui network in comparison to Bitcoin. A stronger indicator suggests that Sui’s ecosystem is gaining traction or is more active than Bitcoin, especially within its decentralized finance or smart contract ecosystem.
- SUI/ETH: Comparative ecosystem growth indicator, which measures the relative development of the Sui network compared to Ethereum. A stronger indicator indicates that Sui is showing better adoption, performance, or growth relative to Ethereum, potentially signaling its emergence as a new competitor in the smart contract and DeFi space.

[Potential Assets Indicators Interpretation] & [All these tokens are SUI ecosystem tokens]
${analysis_config
  .filter((coin) => coin.ratioToSui)
  .filter((coin) => coin.altcoin)
  .filter((coin) => coin.enabled)
  .map((coin) => `- ${coin.ratioToSui}`)
  .join("\n")}

[ratio data]
`;

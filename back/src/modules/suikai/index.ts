import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import cron from "node-cron";
import axios, { AxiosError } from "axios";
import pLimit from "p-limit";
import { db } from "@/db";
import {
  insightStateTable,
  marketStateTable,
  holdingStateTable,
} from "@/db/schema";
import { adjustPortfolio_by_AI } from "./portfolio/ai_helper";
import { getHolding } from "./portfolio/tool";

// 设置CoinMarketCap API Key和基础URL
const BASE_URL =
  "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical";
const limit = pLimit(2);

// const intervals = ["1h", "4h", "12h", "1d", "2d", "3d", "7d", "15d", "30d"];
const intervals = ["1h", "1d", "3d", "7d", "30d"];

const currentSpot = "5m";

interface PairInfo {
  pair: string;
  "1h": { value: number; change: number };
  "1d": { value: number; change: number };
  "3d": { value: number; change: number };
  "7d": { value: number; change: number };
  "30d": { value: number; change: number };
}

// 获取币种的历史价格数据
const getHistoricalData = async (id: string, interval: string, retries = 3) => {
  const params = {
    id: id,
    convert: "USD",
    interval: interval,
    count: 2,
  };

  const config = {
    headers: {
      "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY!,
      Accept: "application/json",
    },
  };

  try {
    const response = await axios.get(BASE_URL, { params, ...config });
    return response.data.data.quotes[0].quote.USD.price as number;
  } catch (error: unknown) {
    if (
      error instanceof AxiosError &&
      error.response &&
      error.response.status === 429 &&
      retries > 0
    ) {
      console.warn(`Received 429, retrying... (${retries} retries left)`);
      const retryAfter = error.response.headers["retry-after"] || 1; // Use 'retry-after' header or default to 1 second
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000)); // Wait for the retry period
      return getHistoricalData(id, interval, retries - 1); // Retry the request
    }
    console.error("Error fetching historical data:", error);
    // throw error; // Rethrow error if not a 429 or no retries left
  }
};

const calculateRatio = (priceA: number, priceB: number): number => {
  return priceA / priceB;
};

const calculateChangePercentage = (
  newValue: number,
  oldValue: number
): string => {
  const change = ((newValue - oldValue) / oldValue) * 100;
  return change.toFixed(2) + "%";
};

// Investment State, now handling prices and ratio calculations
class InvestmentState {
  private state: Map<string, any> = new Map(); // key: `asset-time`, value: price

  setPrice(asset: string, interval: string, price: number) {
    const key = `${asset}-${interval}`;
    this.state.set(key, price);
  }

  getPrice(asset: string, interval: string): number | undefined {
    return this.state.get(`${asset}-${interval}`);
  }

  getCurrentPrice(asset: string): number | undefined {
    return this.state.get(`${asset}-${currentSpot}`);
  }

  // Function to calculate ratio between two assets
  getRatio(
    assetA: string,
    assetB: string,
    interval: string
  ): number | undefined {
    const priceA = this.getPrice(assetA, interval);
    const priceB = this.getPrice(assetB, interval);
    if (priceA && priceB) {
      return calculateRatio(priceA, priceB);
    }
    return undefined;
  }
  generateRate() {
    const insightMap: { [key: string]: string[] } = {
      "ETH/BTC": [],
      "SUI/ETH": [],
      "SUI/BTC": [],
      // "SOL/BTC": [],
      // "HYPE/ETH": [],
    };
    // 获取当前时间的比值
    const ethBtcCurrent = this.getRatio("ETH", "BTC", currentSpot);
    const suiEthCurrent = this.getRatio("SUI", "ETH", currentSpot);
    const suiBtcCurrent = this.getRatio("SUI", "BTC", currentSpot);

    // Iterate over the intervals and generate insight for each
    intervals.forEach((interval) => {
      const ethBtcRatio = this.getRatio("ETH", "BTC", interval);
      const suiEthRatio = this.getRatio("SUI", "ETH", interval);
      const suiBtcRatio = this.getRatio("SUI", "BTC", interval);

      const ethBtcChange = ethBtcRatio
        ? calculateChangePercentage(ethBtcCurrent!, ethBtcRatio)
        : "N/A";
      const suiEthChange = suiEthRatio
        ? calculateChangePercentage(suiEthCurrent!, suiEthRatio)
        : "N/A";
      const suiBtcChange = suiBtcRatio
        ? calculateChangePercentage(suiBtcCurrent!, suiBtcRatio)
        : "N/A";

      // Push the formatted ratio with change for each pair into the corresponding array
      if (ethBtcRatio) {
        insightMap["ETH/BTC"].push(`${interval} ${ethBtcChange}`);
      } else {
        insightMap["ETH/BTC"].push(`${interval} N/A`);
      }

      if (suiEthRatio) {
        insightMap["SUI/ETH"].push(`${interval} ${suiEthChange}`);
      } else {
        insightMap["SUI/ETH"].push(`${interval} N/A`);
      }
      if (suiBtcRatio) {
        insightMap["SUI/BTC"].push(`${interval} ${suiBtcChange}`);
      } else {
        insightMap["SUI/BTC"].push(`${interval} N/A`);
      }
    });

    // Format the output to match the requested structure
    const formattedString = Object.keys(insightMap)
      .map((pair) => `${pair} rate: ${insightMap[pair].join(", ")}`)
      .join("\n");

    const pairs = [
      { name: "ETH/BTC", assetA: "ETH", assetB: "BTC" },

      { name: "SUI/ETH", assetA: "SUI", assetB: "ETH" },
      { name: "SUI/BTC", assetA: "SUI", assetB: "BTC" },
    ];

    // 组装成 PairInfo[] 结构
    const marketData: PairInfo[] = pairs.map(({ name, assetA, assetB }) => {
      // 先初始化这个交易对各个区间的值
      const pairInfo: PairInfo = {
        pair: name,
        "1h": { value: 0, change: 0 },
        "1d": { value: 0, change: 0 },
        "3d": { value: 0, change: 0 },
        "7d": { value: 0, change: 0 },
        "30d": { value: 0, change: 0 },
      };

      // 拿到这个交易对在 currentSpot 的当前最新比值，用来做 change 的基准
      const currentRatio = this.getRatio(assetA, assetB, currentSpot);

      // 遍历 intervals，算出老的 ratio 以及变化百分比
      intervals.forEach((interval) => {
        const oldRatio = this.getRatio(assetA, assetB, interval) || 0;
        let changeVal = 0; // 默认 0

        if (currentRatio && oldRatio) {
          // calculateChangePercentage 返回类似 "3.14%" 的字符串
          // 如果希望 change 是数字，可以把它转成数字
          const changeStr = calculateChangePercentage(currentRatio, oldRatio);
          changeVal = parseFloat(changeStr.replace("%", "")); // 把末尾的 "%" 去掉
        }

        // 把这个 interval 的数据填回 pairInfo
        (pairInfo as any)[interval] = {
          value: oldRatio,
          change: changeVal,
        };
      });

      return pairInfo;
    });

    return {
      ETH_BTC: `ETH/BTC rate ` + insightMap["ETH/BTC"].join(", "),
      SUI_ETH: `SUI/ETH rate ` + insightMap["SUI/ETH"].join(", "),
      SUI_BTC: `SUI/BTC rate ` + insightMap["SUI/BTC"].join(", "),

      marketData: marketData as PairInfo[],

      formattedString,
    };
  }
}

class InvestmentManager {
  private agent: Agent;
  private localState: InvestmentState;

  constructor(agent: Agent) {
    this.agent = agent;
    this.localState = new InvestmentState();
  }

  init() {
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
          await this.fetchAndStorePrice("1027", "ETH");
          await this.fetchAndStorePrice("1", "BTC");
          // await this.fetchAndStorePrice("5426", "SOL");
          // await this.fetchAndStorePrice("32196", "HYPE");
          await this.fetchAndStorePrice("20947", "SUI");

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
          const { ETH_BTC, SUI_ETH, SUI_BTC, formattedString, marketData } =
            this.localState.generateRate();

          console.log(marketData);

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
    const price = await Promise.all(
      intervals.map((interval) => limit(() => getHistoricalData(id, interval)))
    );

    // Store prices for different intervals
    price.forEach((p, idx) => {
      // this.localState.setPrice(asset, intervals[idx], p);

      if (p) {
        // 只在成功获取价格才更新
        this.localState.setPrice(asset, intervals[idx], p);
      }
    });

    // Store current price for the asset (5m)
    const currentPrice = await limit(() => getHistoricalData(id, currentSpot));

    if (currentPrice) {
      // 只在成功获取价格才更新
      this.localState.setPrice(asset, currentSpot, currentPrice);
    }
  }

  updatePortfolioTask() {
    const portfolioTask = this.agent.taskManager.createTask<null>({
      type: "UPDATE_PORTFOLIO_TASK",
      descrpition: "Update Portfolio using AI & NAVI",
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
            current_holding: JSON.stringify(current_holding),
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
Here are a few crypto asset ratio data for one month. Please analyze it. What do you think of the current market situation? And what's your opinion of SUI?

[Indicator Interpretation] 
- ETH/BTC: Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity. 
- SUI/BTC: Cross-chain market sentiment indicator, which reflects the relative strength of the Sui network in comparison to Bitcoin. A stronger indicator suggests that Sui’s ecosystem is gaining traction or is more active than Bitcoin, especially within its decentralized finance or smart contract ecosystem.
- SUI/ETH: Comparative ecosystem growth indicator, which measures the relative development of the Sui network compared to Ethereum. A stronger indicator indicates that Sui is showing better adoption, performance, or growth relative to Ethereum, potentially signaling its emergence as a new competitor in the smart contract and DeFi space.

[ratio data]
`;

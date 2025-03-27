import type { Agent } from "@/src/agent";
import pLimit from "p-limit";
import { getHistoricalData } from "../market/cmc";
import type { InvestmentState } from "../market/cmc";
import { analysis_config } from "../config/cmc-market-analysis";

export function updatePrice(agent: Agent, investmentState: InvestmentState) {
  const priceUpdateTask = agent.taskManager.createTask<null>({
    type: "UPDATE_PRICE_TASK",
    descrpition: "Update Price by CoinMarketCap API",
    payload: null,
    callback: async () => {
      const fetchAndStorePrice = async (id: string, asset: string) => {
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
            investmentState.setPrice(asset, intervals[idx], p);
          }
        });

        // Store current price for the asset (5m)
        const currentPrice = await limit(() =>
          getHistoricalData({ id, interval: currentSpot })
        );

        if (currentPrice) {
          // 只在成功获取价格才更新
          investmentState.setPrice(asset, currentSpot, currentPrice);
        }
      };

      try {
        for (const coin of analysis_config) {
          if (coin.enabled) {
            await fetchAndStorePrice(coin.cmcId, coin.name);
          }
        }

        // Trigger event after prices are updated
        agent.sensing.emitEvent({
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
}

import type { Agent } from "@/src/agent";
import pLimit from "p-limit";
import { getHistoricalData } from "../market/cmc";
import type { InvestmentState } from "../market/cmc";
// import { analysis_config } from "../config/cmc-market-analysis";
import {
  CMC_TOKEN,
  CMC_TOKEN_RATE_ANALYSIS,
  analysis_portfolio,
} from "../config/cmc-market-analysis";

export function updatePrice(agent: Agent, investmentState: InvestmentState) {
  const priceUpdateTask = agent.taskManager.createTask<null>({
    type: "UPDATE_PRICE_TASK",
    descrpition: "Update Price by CoinMarketCap API",
    payload: null,
    callback: async () => {
      const fetchAndStorePrice = async (cmcId: string, assetName: string) => {
        const limit = pLimit(2);

        // const intervals = ["1h", "4h", "12h", "1d", "2d", "3d", "7d", "15d", "30d"];
        const get_intervals = ["1h", "1d", "3d", "7d", "30d"];
        const currentSpot = "5m";
        const intervals = [...get_intervals, currentSpot];

        const prices = await Promise.all(
          intervals.map((interval) =>
            limit(() =>
              getHistoricalData({
                id: cmcId,
                interval,
                name: assetName,
              })
            )
          )
        );

        // 处理所有获取到的价格数据
        prices.forEach((price, idx) => {
          if (price) {
            // 只在成功获取价格才更新
            investmentState.setPrice(assetName, intervals[idx], price);
          }
        });
      };

      try {
        for (const asset of used_assets) {
          await fetchAndStorePrice(asset.cmcId, asset.symbol);
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

function generateUsedAssets(
  analysisRate: CMC_TOKEN_RATE_ANALYSIS[]
): CMC_TOKEN[] {
  const assetSet = new Set<CMC_TOKEN>();

  analysisRate.forEach(({ assetA, assetB }) => {
    assetSet.add(assetA);
    assetSet.add(assetB);
  });

  return Array.from(assetSet);
}

// const used_assets = [BTC, ETH, SUI, DEEP, CETUS, SEND, NS, NAVX];

const used_assets = generateUsedAssets(analysis_portfolio);

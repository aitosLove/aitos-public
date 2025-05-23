import type { Agent } from "@/src/agent";
import pLimit from "p-limit";
import { getHistoricalData, InvestmentState } from "./cmc";
import { CMC_TOKEN, RateAnalysis } from "./type";

function filterPairToToken(analysisRate: RateAnalysis[]): CMC_TOKEN[] {
  const assetSet = new Set<CMC_TOKEN>();

  analysisRate.forEach(({ assetA, assetB }) => {
    assetSet.add(assetA);
    assetSet.add(assetB);
  });

  return Array.from(assetSet);
}

export async function updatePriceFromCMC({
  agent,
  investmentState,
  updateAssets,
}: {
  agent: Agent;
  investmentState: InvestmentState;
  updateAssets: RateAnalysis[];
}) {
  const tokenCluster = filterPairToToken(updateAssets);

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
    for (const asset of tokenCluster) {
      await fetchAndStorePrice(asset.cmcId, asset.symbol);
    }
  } catch (error) {
    console.error("Error updating prices:", error);
    return {
      success: false,
      error: "Failed to update prices",
    };
  }

  return {
    success: true,
    message: "Prices updated successfully",
  };
}

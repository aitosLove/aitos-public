import Axios, { AxiosResponse } from "axios";

import { setupCache } from "axios-cache-interceptor";
import { select_portfolio } from "../../config/portfolio";
import { TokenOnPortfolio } from "../../config/holding-type";
import { account, aptosClient } from "../../config/apt/account";
import * as dotenv from "dotenv";
dotenv.config();

const instance = Axios.create();

const axios = setupCache(instance, {
  interpretHeader: false,
});
export async function getHolding_apt() {
  try {
    // 获取用户持有的代币信息
    const coinsData = await aptosClient.getAccountCoinsData({
      accountAddress: account.accountAddress.toString(),
    });

    // 创建一个存储代币数据的数组
    const balances: BalanceOnScan[] = [];

    // 处理每个代币的信息
    for (const coin of coinsData) {
      if (!coin.asset_type) continue;

      try {
        // 根据代币标准选择不同的API端点
        const isV2Standard = coin.token_standard === "v2";
        const endpoint = isV2Standard
          ? `https://api.aptoscan.com/public/v1.0/fungible_assets/${encodeURIComponent(
              coin.asset_type
            )}`
          : `https://api.aptoscan.com/public/v1.0/coins/${encodeURIComponent(
              coin.asset_type
            )}`;

        // 调用API获取代币价格
        const priceResponse = await axios.get(endpoint, {
          headers: { accept: "application/json" },
        });

        // 根据响应结构处理数据
        let tokenData;
        if (priceResponse.data && priceResponse.data.success) {
          // V2标准的响应或新版V1的响应
          tokenData = priceResponse.data.data;
        } else if (priceResponse.data && priceResponse.data.data) {
          // 旧版V1的响应
          tokenData = priceResponse.data.data;
        } else {
          // 无法识别的响应格式
          console.warn(
            `Unrecognized API response format for token ${coin.asset_type}`
          );
          continue;
        }

        // 如果获取到了代币数据
        if (tokenData) {
          // 使用代币元数据或API返回的数据中的decimals
          const decimals = coin.metadata?.decimals || tokenData.decimals || 0;
          const fixDecimals = 10 ** decimals;

          // 计算代币数量（考虑小数位）
          const coinAmount = coin.amount
            ? Number(coin.amount) / fixDecimals
            : 0;

          // 获取代币价格
          const coinPrice = tokenData.current_price || 0;

          // 添加到balances数组
          balances.push({
            coinType: coin.asset_type,
            coinName: coin.metadata?.name || tokenData.name || null,
            coinSymbol: tokenData.symbol || null,
            balance: coinAmount,
            balanceUsd: coinAmount * coinPrice,
            decimals: decimals,
            coinPrice: coinPrice,
            tokenStandard: coin.token_standard || (isV2Standard ? "v2" : "v1"),
          });
        }
      } catch (error) {
        console.error(
          `Error fetching price for token ${coin.asset_type}:`,
          error
        );
        // 如果无法获取价格数据，仍添加代币但没有价格信息
        if (coin.metadata) {
          const decimals = coin.metadata.decimals || 0;
          const fixDecimals = 10 ** decimals;

          balances.push({
            coinType: coin.asset_type,
            coinName: coin.metadata.name || null,
            coinSymbol: null,
            balance: coin.amount ? Number(coin.amount) / fixDecimals : 0,
            balanceUsd: null,
            decimals: decimals,
            coinPrice: null,
            tokenStandard: coin.token_standard || "unknown",
          });
        }
      }
    }

    // 处理持仓数据，过滤并计算百分比等
    const coinHolding = await processHoldings(balances);

    console.log("Holding data:", coinHolding);

    return coinHolding;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.log(
        "Received 429 - Rate limit exceeded. Returning cached data if available."
      );
      throw new Error("Rate limit exceeded and no cached data available.");
    } else {
      // 如果是其他错误，直接抛出
      console.error("Error in getHolding:", error);
      throw error;
    }
  }
}

// 过滤原始持仓数据，只要 portfolio 中的 token
async function processHoldings(responseData: BalanceOnScan[]) {
  // 提取 portfolio 中的 coinType 用于过滤
  const portfolioCoinTypes = new Set(
    select_portfolio.map((token) => token.coinType)
  );

  // 跟踪被过滤掉的代币
  const filteredOutTokens: BalanceOnScan[] = [];

  // 过滤出用户持有的、在 portfolio 中的 token
  const filteredBalances = responseData.filter((balance) => {
    const isInPortfolio = portfolioCoinTypes.has(balance.coinType);
    const hasUsdValue = balance.balanceUsd !== null;

    // 如果代币不在portfolio中或没有USD价值，记录被过滤掉的代币
    if (!isInPortfolio || !hasUsdValue) {
      filteredOutTokens.push(balance);
    }

    return isInPortfolio && hasUsdValue;
  });

  console.log(`Token filtered out: `);
  console.log(filteredOutTokens);

  // 创建 Map 便于查找用户持仓
  const holdingMap = new Map<string, BalanceOnScan>();
  filteredBalances
    .filter((balance) => balance.balanceUsd !== null)
    .forEach((balance) => holdingMap.set(balance.coinType, balance));

  // 计算总balanceUSD，给前端展示用
  const totalBalanceUsd_notFiltered = responseData.reduce(
    (total, balance) => total + (balance.balanceUsd || 0),
    0
  );

  // 计算总的 balanceUsd
  const totalBalanceUsd = filteredBalances.reduce(
    (total, balance) => total + (balance.balanceUsd || 0),
    0
  );

  // 生成合并后的 validBalances
  const validPortfolio = select_portfolio.map((token) => {
    const holding = holdingMap.get(token.coinType);
    const balance = holding ? holding.balance : 0;
    const balanceUsd = holding?.balanceUsd ? holding.balanceUsd : 0;
    const coinPrice = holding ? holding.coinPrice : null;
    const percentage =
      totalBalanceUsd > 0 ? (balanceUsd / totalBalanceUsd) * 100 : 0;

    return {
      coinType: token.coinType,
      coinName: token.coinName,
      coinSymbol: token.coinSymbol,
      balance,
      balanceUsd,
      decimals: token.decimals,
      coinPrice,
      percentage, // 直接包含百分比
      tokenStandard: holding?.tokenStandard || "unknown",
    };
  }) as TokenOnPortfolio[];

  return { validPortfolio, totalBalanceUsd, totalBalanceUsd_notFiltered };
}

export interface BalanceOnScan {
  coinType: string;
  coinName: string | null;
  coinSymbol: string | null;
  balance: number;
  balanceUsd: number | null;
  decimals: number | null;
  coinPrice: number | null;
  tokenStandard?: string; // 添加代币标准属性
}

async function test() {
  const holding = await getHolding_apt();
  console.log(holding);
  return holding;
}

test();

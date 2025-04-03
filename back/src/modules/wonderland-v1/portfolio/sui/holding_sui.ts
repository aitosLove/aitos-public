import Axios, { AxiosResponse } from "axios";

import { setupCache } from "axios-cache-interceptor";
import { account_v3 } from "../../config/sui/account_sui";
import { select_portfolio } from "../../config/portfolio";
import { TokenOnPortfolio } from "../../config/holding-type";
import * as dotenv from "dotenv";
dotenv.config();

const instance = Axios.create();

const axios = setupCache(instance, {
  //   blueburry我****，这玩意在cache-control里面强制卸了dont cache,导致我一直没办法拿到缓存，把header解释器关掉就好了
  interpretHeader: false,
});

const accountAddress = account_v3.address;

const url = `https://api.blockberry.one/sui/v1/accounts/${accountAddress}/balance`;
const headers = {
  accept: "*/*",
  "x-api-key": process.env.BLUEBERRY_API,
};

export async function getHolding() {
  try {
    // 发起请求
    const response: AxiosResponse<BalanceOnScan[]> = await axios.get(url, {
      headers,
    });

    const coinHolding = await processHoldings(response.data);

    return coinHolding;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.log(
        "Received 429 - Rate limit exceeded. Returning cached data if available."
      );
      throw new Error("Rate limit exceeded and no cached data available.");
    } else {
      // 如果是其他错误，直接抛出
      throw error;
    }
  }
}

// 过滤原始持仓数据，只要 portfolio 中的 token
async function processHoldings(responseData: BalanceOnScan[]) {
  // 合并Portfollio
  // 按照TokenSymbol等于key的合并，把supply amount

  // 提取 portfolio 中的 coinType 用于过滤
  const portfolioCoinTypes = new Set(
    select_portfolio.map((token) => token.coinType)
  );

  // 过滤出用户持有的、在 portfolio 中的 token
  const filteredBalances = responseData.filter(
    (balance) =>
      portfolioCoinTypes.has(balance.coinType) && balance.balanceUsd !== null
  );

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
}

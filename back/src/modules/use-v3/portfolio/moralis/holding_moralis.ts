import Axios, { AxiosResponse } from "axios";
import Moralis from "moralis";

import { setupCache } from "axios-cache-interceptor";
import { select_portfolio } from "../../config";
import * as dotenv from "dotenv";
import { TokenOnPortfolio } from "../../config";
dotenv.config();

const instance = Axios.create();

const axios = setupCache(instance, {
  interpretHeader: false,
});

const chain = "0x38"; // BSC
const accountAddress = process.env.EVM_ADDRESS || "";

await Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

export async function getHolding_moralis() {
  try {
    // 发起请求

    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: chain,
      address: accountAddress,
    });

    const responseData = response.response.toJSON().result.map((tokenHold) => {
      const fixDecimals = 10 ** tokenHold.decimals;

      return {
        coinType: tokenHold.token_address,
        coinName: tokenHold.name,
        coinSymbol: tokenHold.symbol,
        balance: Number(tokenHold.balance) / fixDecimals,
        balanceUsd: tokenHold.usd_value,
        decimals: tokenHold.decimals,
        coinPrice: Number(tokenHold.usd_price),
      } as BalanceOnScan;
    });

    const coinHolding = await processHoldings(responseData);

    console.log(coinHolding);

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

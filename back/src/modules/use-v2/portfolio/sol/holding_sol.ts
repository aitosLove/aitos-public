import Axios, { AxiosResponse } from "axios";
import Moralis from "moralis";

import { setupCache } from "axios-cache-interceptor";
// import { select_portfolio } from "../../config";
import * as dotenv from "dotenv";
dotenv.config();

import { select_portfolio, TokenOnPortfolio } from "../../config";
import { accountSOL } from "../../config/sol/account";
import { wSOL, nSOL } from "../../config/sol/coin";

const instance = Axios.create();

const axios = setupCache(instance, {
  interpretHeader: false,
});

const accountAddress = accountSOL.publicKey.toBase58();

await Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

export async function getHolding_sol() {
  try {
    // 发起请求

    const response = await Moralis.SolApi.account.getPortfolio({
      network: "mainnet",
      address: accountAddress,
    });

    const promisesArray = response.raw.tokens.map(async (tokenHold) => {
      const priceResponse = await Moralis.SolApi.token.getTokenPrice({
        network: "mainnet",
        address: tokenHold.mint,
      });

      const priceOftoken = priceResponse.raw.usdPrice;

      const balanceUsd = priceOftoken
        ? Number(tokenHold.amount) * priceOftoken
        : null;

      return {
        coinType: tokenHold.mint,
        coinName: tokenHold.name,
        coinSymbol: tokenHold.symbol,
        balance: Number(tokenHold.amount),
        balanceUsd: balanceUsd,
        decimals: tokenHold.decimals,
        coinPrice: priceOftoken,
      } as BalanceOnScan;
    });

    // 等待所有Promise完成并过滤掉null值
    const resolvedData = await Promise.all(promisesArray);

    const solHolding = Number(response.raw.nativeBalance.solana);
    const solPriceResponse = await Moralis.SolApi.token.getTokenPrice({
      network: "mainnet",
      address: wSOL.coinType,
      //   use price of Wrapped SOL as the price of native SOL
    });
    const solPrice = solPriceResponse.raw.usdPrice;
    const solBalanceUsd = solPrice ? solHolding * solPrice : null;
    const solHoldingData = {
      coinType: nSOL.coinType,
      coinName: nSOL.coinName,
      coinSymbol: nSOL.coinSymbol,
      balance: solHolding,
      balanceUsd: solBalanceUsd,
      decimals: 9,
      coinPrice: solPrice,
    } as BalanceOnScan;

    // 合并SPL token and Native SOL
    const mergedData = [...resolvedData, solHoldingData];

    const coinHolding = await processHoldings(mergedData);

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

async function test() {
  console.log("Start getHolding_moralis");
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });
  await getHolding_sol();
}

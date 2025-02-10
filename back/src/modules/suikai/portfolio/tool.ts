import axios, { AxiosResponse } from "axios";
import { swap as realSwap } from "./swap";
import * as dotenv from "dotenv";
dotenv.config();

const accountAddress3 =
  "0xb187b074ba8fe02ef8ba86a42ccb09f824e29e3decdee3f5793be9feedc431ef";

const url = `https://api.blockberry.one/sui/v1/accounts/${accountAddress3}/balance`;
const headers = {
  accept: "*/*",
  "x-api-key": process.env.BLUEBERRY_API,
};
export interface CoinBalance {
  coinType: string;
  coinName: string | null;
  coinSymbol: string | null;
  balance: number;
  balanceUsd: number | null;
  decimals: number | null;
  coinPrice: number | null;
}

type ResponseData = CoinBalance[];

// 获取并处理有效持仓的功能
function processHoldings(responseData: ResponseData) {
  // 过滤掉没有 balanceUSD 的持仓
  const validBalances = responseData.filter(
    (balance) => balance.balanceUsd !== null
  );

  // 计算每个代币的百分比
  const totalBalanceUsd = validBalances.reduce(
    (total, balance) => total + (balance.balanceUsd || 0),
    0
  );
  const tokenPercentages = validBalances.map((balance) => ({
    coinSymbol: balance.coinSymbol,
    percentage: (balance.balanceUsd! / totalBalanceUsd) * 100,
  }));

  // 按百分比排序，并合并“others”
  tokenPercentages.sort((a, b) => b.percentage - a.percentage);
  if (tokenPercentages.length > 10) {
    const othersPercentage = tokenPercentages
      .slice(10)
      .reduce((sum, token) => sum + token.percentage, 0);
    tokenPercentages.splice(10, tokenPercentages.length - 10, {
      coinSymbol: "others",
      percentage: othersPercentage,
    });
  }

  // 输出代币百分比
  console.log("Token Percentages:", tokenPercentages);

  // 输出总代币的 balanceUSD
  console.log("Total balanceUSD:", totalBalanceUsd);

  return { validBalances, totalBalanceUsd, tokenPercentages };
}

// 根据目标比例执行调整的功能
export async function adjustToTargetSUIProportion(
  //   validBalances: CoinBalance[],
  //   totalBalanceUsd: number,
  targetSUIProportion: number
) {
  const { validBalances, totalBalanceUsd } = await getHolding();

  // 获取当前 USDC 和 SUI 的余额及其比例
  const usdcBalance = validBalances.find(
    (balance) => balance.coinSymbol === "USDC"
  );
  const suiBalance = validBalances.find(
    (balance) => balance.coinSymbol === "SUI"
  );

  if (usdcBalance && suiBalance) {
    const suiCurrentPercentage =
      (suiBalance.balanceUsd! / totalBalanceUsd) * 100;

    console.log("Current SUI percentage:", suiCurrentPercentage);

    // 计算需要调整的比例
    const suiDifference = targetSUIProportion - suiCurrentPercentage;
    const usdcAvailable = usdcBalance.balance!;

    // 判断是否需要执行 swap 操作
    if (Math.abs(suiDifference) > 0) {
      console.log("Executing swap...");

      // 计算需要交换的金额并调用 swap 函数（swap 函数由你来实现）
      let usdcAmountToSwap = (suiDifference / 100) * totalBalanceUsd;

      // 如果 USDC 不够，使用 90% 的 USDC 来进行交易
      if (usdcAmountToSwap > usdcAvailable) {
        usdcAmountToSwap = usdcAvailable * 0.9;
        console.log(
          "Not enough USDC, using 90% of available USDC:",
          usdcAmountToSwap
        );
      }

      // 如果需要买入 SUI（目标是增加 SUI 占比）
      if (suiDifference > 0) {
        // console.log(`Buying SUI using ${usdcAmountToSwap} USDC`);
        await swap("USDC", "SUI", usdcAmountToSwap); // 需要你实现 swap 函数
      }

      // 如果需要卖出 SUI（目标是减少 SUI 占比）
      if (suiDifference < 0) {
        const suiAmountToSell =
          (Math.abs(suiDifference) / 100) * suiBalance.balance!;
        // console.log(`Selling ${suiAmountToSell} SUI to USDC`);
        await swap("SUI", "USDC", suiAmountToSell); // 需要你实现 swap 函数
      }
    }
  }
}

async function swap(fromCoin: string, toCoin: string, amount: number) {
  console.log(`Swapping ${amount} ${fromCoin} to ${toCoin}...`);

  await realSwap({
    type: fromCoin === "USDC" ? "USDC->SUI" : "SUI->USDC",
    inputAmount: amount,
  });
}

let cachedData: {
  validBalances: CoinBalance[];
  totalBalanceUsd: number;
  tokenPercentages: { coinSymbol: string | null; percentage: number }[];
  timestamp: number;
} | null = null;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 缓存过期时间（5分钟）

export async function getHolding() {
  // 如果缓存存在并且没有过期，直接返回缓存
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY_TIME) {
    console.log("Using cached data");
    return cachedData;
  }

  try {
    // 发起请求
    const response: AxiosResponse<ResponseData> = await axios.get(url, {
      headers,
    });

    const processedData = processHoldings(response.data);

    // 更新缓存
    cachedData = {
      validBalances: processedData.validBalances,
      totalBalanceUsd: processedData.totalBalanceUsd,
      tokenPercentages: processedData.tokenPercentages,
      timestamp: Date.now(), // 更新缓存时间
    };

    return processedData;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.log(
        "Received 429 - Rate limit exceeded. Returning cached data if available."
      );
      if (cachedData) {
        return cachedData; // 如果有缓存数据，返回缓存的结果
      } else {
        throw new Error("Rate limit exceeded and no cached data available.");
      }
    } else {
      // 如果是其他错误，直接抛出
      throw error;
    }
  }
}

// async function test() {
//   try {
//     const { validBalances, totalBalanceUsd } = await getHolding();
//     await getHolding();
//     await getHolding();
//     // await adjustToTargetSUIProportion(validBalances, totalBalanceUsd, 10);
//     // await adjustToTargetSUIProportion(50);
//   } catch (e) {
//     console.log(e);
//   }
// }
// test();

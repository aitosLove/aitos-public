// 实现该部分需要注意小持仓攻击的可能性，只过滤出需要调整的资产，其他部分直接去掉，让用户自己处理。

import * as dotenv from "dotenv";
dotenv.config();

import { getHolding } from "./getHolding";
import { TokenOnPortfolio } from "../config/holding-type";
// import { swap } from "../defi/1inch/swap";
import { swap } from "../defi/panora/swap";
import { STABLE_COIN } from "../config/portfolio";
export interface TokenOnTargetPortfolio {
  coinType: string;
  coinSymbol: string;
  targetPercentage: number; //整数，例如20%就是20
}

export async function adjustPortfolio({
  targetPortfolio,
}: {
  targetPortfolio: TokenOnTargetPortfolio[];
}) {
  try {
    const { validPortfolio, totalBalanceUsd } = await getHolding();
    await makePortfolioRoute({
      originalPortfolio: validPortfolio,
      targetPortfolio,
    });
  } catch (e) {
    console.log(e);
  }
}

async function makePortfolioRoute({
  originalPortfolio,
  targetPortfolio,
}: {
  originalPortfolio: TokenOnPortfolio[];
  targetPortfolio: TokenOnTargetPortfolio[];
}) {
  try {
    // 首先检测是不是target portfolio是否完整，也就是跟portfolio里面的能不能对上
    // 如果不是，报错处理

    console.log("开始完整性检测...");
    checkPortfolioCompleteness(originalPortfolio, targetPortfolio);
    console.log("完整性检测通过");

    // 然后检测target portfolio是不是总和为100%
    // 如果不是，进行归一化处理，也就是使其最终相加等于100%
    // 处理的时候，颗粒度应该设置为5%，也就是任何portfolio的比例都应该是5%/10%/15%等，不要有更细的值
    // 这是为了帮助AI更好地理解持仓结构

    console.log("开始百分比归一化...");
    const normalizedTargetPortfolio = normalizeTargetPortfolio(targetPortfolio);
    console.log("归一化完成，调整后目标投资组合:", normalizedTargetPortfolio);

    // 然后进行调整路径规划，即比照当前的portfolio，调整到目标portfolio，得到哪个要增加、哪个要减少
    // 特别的，USDC不应被考虑在规划过程内，因为USDC起到的作用是对最后残留的调整进行补充
    // 调仓的算法是这样的：
    // 1. 对所有需要进行的调整进行排序，从小到大排序，需要减仓的应该被视为负数，需要加仓的被视为正数
    // 2. 以0为分界线，需要降仓的视为水桶，需要加仓的的视为水杯
    // 3. 从最大的水桶开始迭代，从最小的水杯开始灌水，逐个灌满，直到水桶被耗尽（在被耗尽前灌入的水杯可以不被装满，留给下个水桶）。“灌水”的过程，就是从需要减仓的token卖出为需要加持的token，调用swap函数。

    // 4. 当某个水桶的水倒尽后，移动向下一个水桶，重复3的步骤进行迭代，直到所有的水桶都倒尽、或者所有水杯都被装满
    // 5. 如果剩下的是水桶，把所有的水桶都卖成USDC，如果剩下的是水杯，则使用USDC买入水杯所代表的token份额（特别的，如果USDC不足以买入，将其耗尽即可）
    console.log("开始调整路径规划...");
    await planAdjustments(originalPortfolio, normalizedTargetPortfolio);
    console.log("调整路径规划完成");
    // 调整完毕
  } catch (e) {
    console.log(`error in make portfolio route`, e);
  }
}

/**
 * 检查目标投资组合的完整性，确保与当前投资组合的代币类型一致
 * @param originalPortfolio 当前投资组合
 * @param targetPortfolio 目标投资组合
 * @throws 如果代币类型不匹配，抛出错误
 */
function checkPortfolioCompleteness(
  originalPortfolio: TokenOnPortfolio[],
  targetPortfolio: TokenOnTargetPortfolio[]
): void {
  const originalCoinTypes = new Set(
    originalPortfolio.map((token) => token.coinType)
  );
  const targetCoinTypes = new Set(
    targetPortfolio.map((token) => token.coinType)
  );

  for (const coinType of originalCoinTypes) {
    if (!targetCoinTypes.has(coinType)) {
      throw new Error(`目标投资组合缺少代币类型: ${coinType}`);
    }
  }
  for (const coinType of targetCoinTypes) {
    if (!originalCoinTypes.has(coinType)) {
      throw new Error(`目标投资组合中存在多余代币类型: ${coinType}`);
    }
  }
}

/**
 * 检查目标投资组合百分比总和是否为100%，若不是则归一化并调整为5%的倍数
 * @param targetPortfolio 目标投资组合
 * @returns 调整后的目标投资组合
 */
function normalizeTargetPortfolio(
  targetPortfolio: TokenOnTargetPortfolio[]
): TokenOnTargetPortfolio[] {
  const totalPercentage = targetPortfolio.reduce(
    (sum, token) => sum + token.targetPercentage,
    0
  );

  if (totalPercentage === 100) {
    return targetPortfolio;
  }

  // 归一化处理
  const normalizedPortfolio = targetPortfolio.map((token) => ({
    ...token,
    targetPercentage: (token.targetPercentage / totalPercentage) * 100,
  }));

  // 调整为5%的倍数
  const adjustedPortfolio = normalizedPortfolio.map((token) => {
    const roundedPercentage = Math.round(token.targetPercentage / 5) * 5;
    return { ...token, targetPercentage: roundedPercentage };
  });

  // 修正总和不为100%的情况
  const adjustedTotal = adjustedPortfolio.reduce(
    (sum, token) => sum + token.targetPercentage,
    0
  );
  if (adjustedTotal !== 100) {
    const difference = 100 - adjustedTotal;
    adjustedPortfolio[adjustedPortfolio.length - 1].targetPercentage +=
      difference;
  }

  return adjustedPortfolio;
}

/**
 * 使用“水桶法”规划调整路径，从当前投资组合调整到目标投资组合
 * @param originalPortfolio 当前投资组合
 * @param targetPortfolio 目标投资组合
 */
async function planAdjustments(
  originalPortfolio: TokenOnPortfolio[],
  targetPortfolio: TokenOnTargetPortfolio[]
): Promise<void> {
  // 计算每个代币的调整比例（目标比例 - 当前比例）
  const adjustments = originalPortfolio.map((token) => {
    const targetToken = targetPortfolio.find(
      (t) => t.coinType === token.coinType
    )!;
    const deltaPercentage = targetToken.targetPercentage - token.percentage;
    return {
      coinType: token.coinType,
      deltaPercentage,
      balance: token.balance,
    };
  });

  // 过滤掉变动小于2%的代币
  const significantAdjustments = adjustments.filter(
    (adj) => Math.abs(adj.deltaPercentage) >= 2
  );

  // 排除USDC
  const nonUsdcAdjustments = significantAdjustments.filter(
    (adj) => adj.coinType !== STABLE_COIN.coinType
  );

  // “水桶”和“水杯”：按deltaPercentage排序
  const buckets = nonUsdcAdjustments
    .filter((adj) => adj.deltaPercentage < 0)
    .sort((a, b) => a.deltaPercentage - b.deltaPercentage); // 从最负到小负
  const cups = nonUsdcAdjustments
    .filter((adj) => adj.deltaPercentage > 0)
    .sort((a, b) => a.deltaPercentage - b.deltaPercentage); // 从小正到大正

  // “水桶法”核心逻辑
  while (buckets.length > 0 && cups.length > 0) {
    const bucket = buckets.pop()!; // 最大的水桶（最负）
    const cup = cups.shift()!; // 最小的水杯（最正）

    const bucketDelta = -bucket.deltaPercentage; // 需要减少的比例
    const cupDelta = cup.deltaPercentage; // 需要增加的比例

    const tradePercentage = Math.min(bucketDelta, cupDelta);

    // 计算需要卖出的代币数量
    const sellAmount = (tradePercentage / 100) * bucket.balance;

    // 执行swap：从bucket卖出到cup

    console.log(
      `Swapping ${tradePercentage}% ${
        originalPortfolio.find((t) => t.coinType === bucket.coinType)!.coinName
      } to ${
        originalPortfolio.find((t) => t.coinType === cup.coinType)!.coinName
      }...`
    );

    try {
      await swap({
        inputAmount: sellAmount,
        fromCoinAddress: bucket.coinType,
        toCoinAddress: cup.coinType,
        fromDecimals: originalPortfolio.find(
          (t) => t.coinType === bucket.coinType
        )!.decimals,
        fromName: originalPortfolio.find((t) => t.coinType === bucket.coinType)!
          .coinName,
        toName: originalPortfolio.find((t) => t.coinType === cup.coinType)!
          .coinName,
      });
    } catch (e) {
      console.log(
        `error happens in swap ${bucket.coinType} to ${cup.coinType}`
      );
      console.log(e);
    }

    // 更新调整量
    bucket.deltaPercentage += tradePercentage;
    cup.deltaPercentage -= tradePercentage;

    if (bucket.deltaPercentage < 0) buckets.push(bucket);
    if (cup.deltaPercentage > 0) cups.unshift(cup);
  }

  // 处理剩余水桶：卖成USDC
  for (const bucket of buckets) {
    const sellPercentage = -bucket.deltaPercentage;
    const sellAmount = (sellPercentage / 100) * bucket.balance;

    try {
      await swap({
        inputAmount: sellAmount,
        fromCoinAddress: bucket.coinType,
        toCoinAddress: STABLE_COIN.coinType,
        fromDecimals: originalPortfolio.find(
          (t) => t.coinType === bucket.coinType
        )!.decimals,
        fromName: originalPortfolio.find((t) => t.coinType === bucket.coinType)!
          .coinName,
        toName: STABLE_COIN.coinName,
      });
    } catch (e) {
      console.log(`error happens in swap ${bucket.coinType} to USDC`);
      console.log(e);
    }
  }

  // 处理剩余水杯：用USDC买入
  for (const cup of cups) {
    const buyPercentage = cup.deltaPercentage;
    const targetBalance = originalPortfolio.find(
      (t) => t.coinType === cup.coinType
    )!.balance;
    const buyAmount = (buyPercentage / 100) * targetBalance; // 基于目标代币的当前数量估算

    try {
      await swap({
        inputAmount: buyAmount,
        fromCoinAddress: STABLE_COIN.coinType,
        toCoinAddress: cup.coinType,
        fromDecimals: STABLE_COIN.decimals,
        fromName: STABLE_COIN.coinName,
        toName: originalPortfolio.find((t) => t.coinType === cup.coinType)!
          .coinName,
      });
    } catch (e) {
      console.log(`error happens in swap USDC to ${cup.coinType}`);
      console.log(e);
    }
  }
}

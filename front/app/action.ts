"use server";

import { db } from "@/db";

// interface PairInfo {
//   pair: string;
//   "1h": { value: number; change: number };
//   "1d": { value: number; change: number };
//   "3d": { value: number; change: number };
//   "7d": { value: number; change: number };
//   "30d": { value: number; change: number };
// }

interface PriceData {
  value: number;
  change: number;
}

interface RatioData {
  pair: string;
  [key: string]: PriceData | string;
  "1h": PriceData;
  "1d": PriceData;
  "3d": PriceData;
  "7d": PriceData;
  "30d": PriceData;
}
export async function getNewestMarketState() {
  try {
    const marketState = await db.query.marketStateTable.findFirst({
      orderBy: (marketStateTable, { desc }) => [
        desc(marketStateTable.timestamp),
      ],
    });

    if (!marketState) {
      throw new Error("No market state found");
    }

    return marketState.marketData as RatioData[];
  } catch (e) {
    console.log(e);
  }
}

export async function getInsights() {
  try {
    const insightState = await db.query.insightStateTable.findMany({
      limit: 10,
      orderBy: (insightStateTable, { desc }) => [
        desc(insightStateTable.timestamp),
      ],
    });

    if (!insightState) {
      throw new Error("No insight state found");
    }

    return insightState;
  } catch (e) {
    console.log(e);
  }
}

export async function getEvents() {
  try {
    return db.query.eventsTable.findMany({
      limit: 10,

      orderBy: (eventsTable, { desc }) => [desc(eventsTable.timestamp)],
    });
  } catch (e) {
    console.log(e);
  }
}

export async function getTasks() {
  try {
    return db.query.tasksTable.findMany({
      orderBy: (tasksTable, { desc }) => [desc(tasksTable.timestamp)],
      limit: 10,
    });
  } catch (e) {
    console.log(e);
  }
}

// 代币余额信息
interface CoinBalance {
  balance: number;
  coinName: string;
  coinType: string;
  decimals: number;
  coinPrice: number;
  balanceUsd: number;
  coinSymbol: string;
}

// 代币百分比信息
interface TokenPercentage {
  coinSymbol: string;
  percentage: number;
}

// 返回的数据类型
interface HoldingData {
  timestamp?: number;
  validBalances: CoinBalance[];
  totalBalanceUsd: number;
  tokenPercentages: TokenPercentage[];
}

export async function getNewestHolding() {
  try {
    const holdingState = await db.query.holdingStateTable.findFirst({
      orderBy: (holdingStateTable, { desc }) => [
        desc(holdingStateTable.timestamp),
      ],
    });

    if (!holdingState) {
      throw new Error("No holding state found");
    }

    return holdingState.holding as HoldingData;
  } catch (e) {
    console.log(e);
  }
}

export async function getActions() {
  try {
    return db.query.actionStateTable.findMany({
      orderBy: (actionStateTable, { desc }) => [
        desc(actionStateTable.timestamp),
      ],
      limit: 10,
    });
  } catch (e) {
    console.log(e);
  }
}

"use server";

import { db } from "@/db";
import { insightStateTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TokenOnTargetPortfolio } from "@/types/portfolio";

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

export async function getDefiStrategies() {
  try {
    const defiStrategy = await db.query.defiInsightTable.findMany({
      limit: 10,
      orderBy: (insightStateTable, { desc }) => [
        desc(insightStateTable.timestamp),
      ],
    });

    if (!defiStrategy) {
      throw new Error("No insight state found");
    }

    return defiStrategy;
  } catch (e) {
    console.log(e);
  }
}

export async function getInsightContent(insightId: number): Promise<string> {
  try {
    const record = await db.query.insightStateTable.findFirst({
      where: eq(insightStateTable, insightId),
    });
    if (!record) {
      throw new Error(`Insight ${insightId} not found`);
    }
    return record.insight;
  } catch (error) {
    console.error("Failed to fetch insight:", error);
    throw new Error("Failed to retrieve insight content");
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
export interface TokenOnPortfolio {
  coinType: string;
  coinName: string;
  coinSymbol: string;
  balance: number;
  balanceUsd: number;
  decimals: number;
  coinPrice: number;
  percentage: number;
}

// 代币百分比信息
interface TokenPercentage {
  coinSymbol: string;
  percentage: number;
}

// 返回的数据类型
interface HoldingData {
  timestamp?: number;
  validPortfolio: TokenOnPortfolio[];
  totalBalanceUsd: number;
  totalBalanceUsd_notFiltered: number;
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

    // console.log(holdingState.holding);

    return holdingState.holding as HoldingData;
  } catch (e) {
    console.log(e);
  }
}

export interface PositionHistory {
  timestamp: Date;
  action: string;
  reason: string;
  details: {
    target_portfolio: TokenOnTargetPortfolio[];
  };
}

export async function getActions() {
  try {
    const result = (await db.query.actionStateTable.findMany({
      orderBy: (actionStateTable, { desc }) => [
        desc(actionStateTable.timestamp),
      ],
      limit: 10,
    })) as PositionHistory[];

    return result;
  } catch (e) {
    console.log(e);
  }
}

export async function getTgMessageRecord() {
  try {
    return await db.query.tgMessageTable.findMany({
      orderBy: (tgMessageTable, { desc }) => [desc(tgMessageTable.sentAt)],
      limit: 20,
    });
  } catch (e) {
    console.log(e);
  }
}

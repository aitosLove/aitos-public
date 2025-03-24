"use server";

import { db } from "@/db";
import {
  defiInstructTable,
  insightInstructTable,
  insightStateTable,
  tradingInstructTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getNewestMarketInstruct() {
  try {
    const instruct = await db.query.insightInstructTable.findFirst({
      orderBy: (insightStateTable, { desc }) => [
        desc(insightStateTable.timestamp),
      ],
    });

    if (!instruct) {
      throw new Error("No Market instruct found");
    }

    return instruct.instruct;
  } catch (e) {
    console.log(e);
    return "as default";
  }
}

export async function getNewestDefiInstruct() {
  try {
    const instruct = await db.query.defiInstructTable.findFirst({
      orderBy: (insightStateTable, { desc }) => [
        desc(insightStateTable.timestamp),
      ],
    });

    if (!instruct) {
      throw new Error("No Defi instruct found");
    }
    return instruct.instruct;
  } catch (e) {
    console.log(e);
    return "as default";
  }
}

export async function getNewestTradingInstruct() {
  try {
    const instruct = await db.query.tradingInstructTable.findFirst({
      orderBy: (insightStateTable, { desc }) => [
        desc(insightStateTable.timestamp),
      ],
    });

    if (!instruct) {
      throw new Error("No Trading instruct found");
    }
    return instruct.instruct;
  } catch (e) {
    console.log(e);
    return "as default";
  }
}

export async function addMarketInstruct({ instruct }: { instruct: string }) {
  console.log(`Adding Market instruct: ${instruct}`);
  try {
    const value = await db
      .insert(insightInstructTable)
      .values({
        instruct: instruct,
        timestamp: new Date(),
      })
      .returning();
    return {
      success: true,
      value: value,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      value: null,
    };
  }
}

export async function addDefiInstruct({ instruct }: { instruct: string }) {
  console.log(`Adding Defi instruct: ${instruct}`);
  try {
    const value = await db
      .insert(defiInstructTable)
      .values({
        instruct: instruct,
        timestamp: new Date(),
      })
      .returning();
    return {
      success: true,
      value: value,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      value: null,
    };
  }
}

export async function addTradingInstruct({ instruct }: { instruct: string }) {
  console.log(`Adding Trading instruct: ${instruct}`);
  try {
    const value = await db
      .insert(tradingInstructTable)
      .values({
        instruct: instruct,
        timestamp: new Date(),
      })
      .returning();
    return {
      success: true,
      value: value,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      value: null,
    };
  }
}

import { db } from "@/db";
import { insightStateTable } from "@/db/schema";
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

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { insightInstructTable } from "@/db/schema/moduleSchema/defiSchema";

export async function getNewestTradingInstruct() {
  try {
    const instruct = await db.query.insightInstructTable.findFirst({
      orderBy: (insightInstructTable, { desc }) => [
        desc(insightInstructTable.timestamp),
      ],
    });

    if (!instruct) {
      // throw new Error("No Trading instruct found");
      return "as default";
    }
    return instruct.instruct;
  } catch (e) {
    console.log(e);
    return "as default";
  }
}

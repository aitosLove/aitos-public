import { RateAnalysis } from "./type";
import { db } from "@/db";
import { insightInstructTable } from "@/db/schema/moduleSchema/defiSchema";
import { eq } from "drizzle-orm";

export async function getMarketInsightPrompt({
  analysisPortfolio,
  preference_instruct,
  agentId,
}: {
  analysisPortfolio: RateAnalysis[];
  preference_instruct?: string;
  agentId: string;
}) {
  if (!preference_instruct) {
    preference_instruct = await getNewestMarketInstruct({
      agentId,
    });
  }

  const market_instruct = `
  Here are a few crypto asset ratio data for one month. Please analyze it. What do you think of the current market situation? And what's your opinion of this blockchain's ecosystem?
  
  [Prefenence Instruct]
  ${preference_instruct}
  
  [Potential Assets Indicators Interpretation] & [All these tokens are ecosystem tokens]
  ${analysisPortfolio
    .map(
      (coin) =>
        `- ${coin.assetA.symbol}/ ${coin.assetB.symbol}: ${coin.A_on_B_introduction}`
    )
    .join("\n")}
  
  [ratio data]
  `;

  return market_instruct;
}

export async function getNewestMarketInstruct({
  agentId,
}: {
  agentId: string;
}) {
  try {
    const result = await db.query.insightInstructTable.findFirst({
      where: eq(insightInstructTable.agentId, agentId),
      orderBy: (insightInstructTable, { desc }) => [
        desc(insightInstructTable.timestamp),
      ],
    });

    if (!result) {
      //   throw new Error("No Market instruct found");
      console.log("No Market instruct found");
      return "as default";
    }

    return result.instruct;
  } catch (e) {
    console.log(e);
    return "as default";
  }
}

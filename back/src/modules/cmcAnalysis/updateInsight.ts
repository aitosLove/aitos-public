import type { Agent } from "@/src/agent";
import {
  insightStateTable,
  marketStateTable,
} from "@/db/schema/moduleSchema/defiSchema";
import type { InvestmentState } from "./cmc";
import { RateAnalysis } from "./type";
import { getMarketInsightPrompt } from "./prompt";

import { db } from "@/db";
// import { analysis_portfolio } from "../config";

export async function updateInsight({
  agent,
  investmentState,
  analysisPortfolio,
}: {
  agent: Agent;
  investmentState: InvestmentState;
  analysisPortfolio: RateAnalysis[];
}) {
  try {
    const { formattedString, marketData } =
      investmentState.generateRate(analysisPortfolio);

    console.log(marketData);
    console.log("-----");

    const instruct = await getMarketInsightPrompt({
      analysisPortfolio,
      agentId: agent.agentId,
    });

    console.log(`system prompt is ${instruct}${formattedString}`);
    agent.thinking
      .response({
        model: "reason",
        platform: "deepseek",
        input: `
${instruct}
${formattedString}
`,
        systemPrompt: `You are a professional crypto investor. Please analyze the current market situation.`,
      })
      .then((insight) => {
        if (insight === "error") {
          throw new Error("insight is error. Please check.");
        }
        console.log("-----");

        console.log(`update insight is`, insight);

        db.insert(insightStateTable)
          .values({
            insight: insight,
            agentId: agent.agentId,
          })
          .then((res) => {
            console.log(`${Date.now()}insert insight success`);
          });
      })
      .catch((e) => {
        console.log("error in generating response", e);
      });

    db.insert(marketStateTable)
      .values({
        marketData: marketData,
        agentId: agent.agentId,
      })
      .then((res) => {
        console.log(`${Date.now()}insert market success`);
      });
  } catch (error) {
    console.error("Error updating insights:", error);
  }
}

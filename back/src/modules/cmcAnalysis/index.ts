import { Agent } from "@/src/agent";
import { updateInsight } from "./updateInsight";
import { updatePriceFromCMC } from "./updatePrice";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import { RateAnalysis } from "./type";
import { InvestmentState } from "./cmc";

interface AnalysisOptions {
  analysisPortfolio: RateAnalysis[];
  detailed?: boolean;
}

export function enableAnalystModule(
  agent: Agent,
  { analysisPortfolio, detailed = false }: AnalysisOptions
) {
  const investmentState = new InvestmentState();

  const offUpdatePriceListener = agent.sensing.registerListener(
    (evt: AgentEvent) => {
      if (detailed) {
        console.log("Received update price event. Starting task...");
      }

      if (evt.type === "UPDATE_PRICE_USE_CMC") {
        agent.taskManager.createTask<null>({
          type: "UPDATE_PRICE_TASK",
          description: "Update Price by CoinMarketCap API",
          payload: null,
          callback: async () => {
            try {
              await updatePriceFromCMC({
                agent,
                investmentState: investmentState,
                updateAssets: analysisPortfolio,
              });

              agent.sensing.emitEvent({
                type: "UPDATE_RATE_SUCCESS",
                description: "Price updated. Now you should update insight.",
                payload: {},
                timestamp: Date.now(),
              });
            } catch (e) {
              console.error("Error updating prices:", e);
              agent.sensing.emitEvent({
                type: "UPDATE_RATE_EVENT_ERROR",
                description: "Using CMC to update price failed.",
                payload: {},
                timestamp: Date.now(),
              });
            }
          },
        });
      }
    }
  );

  const offUpdateInsightListener = agent.sensing.registerListener(
    (evt: AgentEvent) => {
      if (evt.type === "UPDATE_INSIGHT") {
        if (detailed) {
          console.log("Received update insight event. Starting task...");
        }
        agent.taskManager.createTask<null>({
          type: "UPDATE_INSIGHT_TASK",
          description: "Update Insight by CoinMarketCap API",
          payload: null,
          callback: async () => {
            try {
              await updateInsight({
                agent,
                investmentState: investmentState,
                analysisPortfolio: analysisPortfolio,
              });

              agent.sensing.emitEvent({
                type: "UPDATE_INSIGHT_SUCCESS",
                description: "Insight updated successfully.",
                payload: {},
                timestamp: Date.now(),
              });
            } catch (e) {
              console.error("Error updating insight:", e);
              agent.sensing.emitEvent({
                type: "UPDATE_INSIGHT_ERROR",
                description: "Insight update failed.",
                payload: {},
                timestamp: Date.now(),
              });
            }
          },
        });
      }
    }
  );

  return {
    offListener: {
      updatePrice: offUpdatePriceListener,
      updateInsight: offUpdateInsightListener,
    },
  };
}

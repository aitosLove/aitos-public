import type { Agent } from "@/src/agent";
import { adjustPortfolio_by_AI } from "../portfolio/ai-helper";
import { db } from "@/db";
import { getHolding } from "../portfolio/getHolding";

export function updatePortfolio(agent: Agent) {
  const portfolioTask = agent.taskManager.createTask<null>({
    type: "UPDATE_PORTFOLIO_TASK",
    descrpition: "Update Portfolio using AI",
    payload: null,
    callback: async () => {
      try {
        const current_holding = await getHolding();
        const insight = await db.query.insightStateTable.findFirst({
          orderBy: (marketStateTable, { desc }) => [
            desc(marketStateTable.timestamp),
          ],
        });
        if (!insight) {
          throw new Error("No insight state found");
        }

        const portfolio = adjustPortfolio_by_AI({
          current_holding: JSON.stringify(current_holding.validPortfolio),
          insight: insight.insight,
        }).then((res) => {
          // 完成后立刻更新持仓
          agent.sensing.emitEvent({
            type: "UPDATE_HOLDING_EVENT",
            description: "Agent should update holding",
            payload: {},
            timestamp: Date.now(),
          });
        });
      } catch (error) {
        console.error("Error updating portfolio:", error);
      }
    },
  });
}

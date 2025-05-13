import type { Agent } from "@/src/agent";
import { db } from "@/db";
import { holdingStateTable } from "@/db/schema";
import { getHolding } from "../portfolio/getHolding";
export function updateHolding(agent: Agent) {
  const holdingTask = agent.taskManager.createTask<null>({
    type: "UPDATE_HOLDING_TASK",
    descrpition: "Update Holding using getHolding Module",
    payload: null,
    callback: async () => {
      try {
        console.log("update holding task");

        const holding = await getHolding();

        db.insert(holdingStateTable)
          .values({
            holding: holding,
          })
          .then((res) => {
            console.log(`${Date.now()}insert holding data success`);
          });

        // console.log("Holding:", holding);
      } catch (error) {
        console.error("Error updating holding:", error);
      }
    },
  });
}

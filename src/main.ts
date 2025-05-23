import { Agent } from "./agent";
import { enableAitosModule } from "./modules/aitos";
import { enableTgInsightModule } from "./modules/tg/throw_insight";

export const agent = new Agent();

async function main() {
  enableAitosModule(agent);
  console.log("[main] Agent started with Wonderland V1 module enabled.");

  enableTgInsightModule(agent);
  console.log("[main] Agent started with TG module enabled.");
}
main().catch((err) => console.error(err));

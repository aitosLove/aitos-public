

import { Agent } from "@/src/agent";
import { DefaultSensing } from "@/src/agent/core/Sensing";
import { NullDatabase } from "@/src/agent/core/Store";
import { enableXCrawlerModule } from "@/src/modules/xContentCrawler";
import { enableTelegramModule } from "@/src/modules/telegram";
import { enableAitosBlueprint } from "@/src/blueprints";
import { DrizzleDatabase } from "@/src/templateDB";
import { APT, USDC, AMI, THL, PROPS } from "@/src/modules/autoPortfolio/chain/apt/coin";
import * as dotenv from "dotenv";
import { analysis_portfolio_apt } from "./aitos-config"
dotenv.config();

const nullDatabase = new NullDatabase();
const groupChannel = new DefaultSensing({
  db: nullDatabase,
  sensingId: "wonderland-v2-group-sensing",
});


const agentId =  "cdaf5083-9d73-494c-99fa-69924d696788";
// any uuid works

export const mainAgent = new Agent({
  db: new DrizzleDatabase(agentId),
  groupSensing: groupChannel,
});

async function main() {

  // Enable Aitos Blueprint (CMC Analysis + APTOS Portfolio)
  try {
    // Get private key
    const privateKey = process.env.APTS_SECRET_KEY || "";
    if (!privateKey) {
      console.error("[main] Error: Missing APTS_SECRET_KEY environment variable");
    } else {
      const aitosBlueprint = enableAitosBlueprint(mainAgent, {
        // CMC Analysis module configuration
        cmcAnalysisOptions: {
          analysisPortfolio: analysis_portfolio_apt,
          detailed: true
        },
        // APTOS Portfolio module configuration
        aptosPortfolioOptions: {
          privateKey: privateKey,
          selectedTokens: [APT, USDC, AMI, THL, PROPS],
          detailed: true
        }
      });
      console.log("[main] Aitos Blueprint (CMC Analysis + APTOS Portfolio) enabled.");
      
      // Handle program shutdown
      process.on("SIGINT", () => {
        console.log("\n[main] Received interrupt signal, shutting down...");
        if (aitosBlueprint && aitosBlueprint.teardown) {
          aitosBlueprint.teardown();
        }
        process.exit(0);
      });
    }
  } catch (error) {
    console.error("[main] Failed to enable Aitos Blueprint:", error);
  }
}
// Start
main().catch((err) => console.error(err));

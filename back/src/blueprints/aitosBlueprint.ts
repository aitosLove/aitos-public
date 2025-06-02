
import { Agent } from "@/src/agent";
import { enableAnalystModule } from "../modules/cmcAnalysis";
import { enableAptosPortfolioModule } from "../modules/aptosPortfolio";
import * as cron from "node-cron";
import { CMC_TOKEN, RateAnalysis } from "../modules/cmcAnalysis/type";
import { OnChainCoin } from "../modules/autoPortfolio/type";
import { AgentEvent } from "@/src/agent/core/EventTypes";

/**
 * Aitos Blueprint Configuration Options
 */
interface AitosBlueprintOptions {
  /**
   * CMC Analysis Module Configuration
   */
  cmcAnalysisOptions: {
    // Analysis portfolio must include asset pair relationships
    analysisPortfolio: {
      assetA: CMC_TOKEN;
      assetB: CMC_TOKEN;
      A_on_B_introduction: string;
    }[];
    detailed?: boolean;
  };
  
  /**
   * APTOS Portfolio Module Configuration
   */
  aptosPortfolioOptions: {
    selectedTokens: OnChainCoin[];
    privateKey: string;
    panoraApiKey?: string;
    slippage?: number;
    detailed?: boolean;
  };
}

/**
 * Enable Aitos Blueprint, combining CMC Analysis and APTOS Portfolio functionality
 * - Refreshes CMC analysis every 1 hour
 * - Gets portfolio holdings every 5 minutes
 * - Triggers APTOS portfolio rebalancing after each CMC analysis update
 * 
 * @param agent Agent instance
 * @param options Blueprint configuration options
 * @returns Blueprint instance and cleanup function
 */
export function enableAitosBlueprint(
  agent: Agent,
  options: AitosBlueprintOptions
) {
  console.log("Starting Aitos Blueprint...");
  
  // Initialize both modules
  const cmcModule = enableAnalystModule(agent, options.cmcAnalysisOptions);
  const aptosModule = enableAptosPortfolioModule(agent, options.aptosPortfolioOptions);
  
  // Register listener to trigger portfolio rebalancing after CMC analysis update
  const offCmcUpdateListener = agent.sensing.registerListener(async (evt: AgentEvent) => {
    if (evt.type === "UPDATE_INSIGHT_SUCCESS") {
      console.log("CMC analysis updated successfully, triggering portfolio rebalancing...");
      
      // Get the latest market insight and request portfolio suggestion
      if (evt.payload?.insight) {
        agent.sensing.emitEvent({
          type: "GET_PORTFOLIO_SUGGESTION_REQUEST",
          description: "Request portfolio suggestion based on latest market insight",
          payload: {
            insight: evt.payload.insight,
          },
          timestamp: Date.now(),
        });
      }
    }
  });
  
  // Setup scheduled tasks
  
  // 1. Refresh CMC analysis every hour
  const cmcAnalysisJob = cron.schedule("0 * * * *", () => {
    console.log("Running scheduled CMC market analysis...");
    agent.sensing.emitEvent({
      type: "UPDATE_PRICE_USE_CMC",
      description: "Periodic market analysis update",
      payload: {},
      timestamp: Date.now(),
    });
  });
  
  // 2. Get portfolio holdings every 5 minutes
  const portfolioHoldingJob = cron.schedule("*/5 * * * *", () => {
    console.log("Running scheduled portfolio holdings update...");
    agent.sensing.emitEvent({
      type: "GET_HOLDING_REQUEST",
      description: "Periodic portfolio holding update",
      payload: {},
      timestamp: Date.now(),
    });
  });
  
  // Initialization process: immediately get holdings and trigger CMC analysis
  console.log("Initialization: Getting current portfolio holdings...");
  agent.sensing.emitEvent({
    type: "GET_HOLDING_REQUEST",
    description: "Initial portfolio holding request",
    payload: {},
    timestamp: Date.now(),
  });
  
  console.log("Initialization: Triggering market analysis...");
  agent.sensing.emitEvent({
    type: "UPDATE_PRICE_USE_CMC",
    description: "Initial market analysis",
    payload: {},
    timestamp: Date.now(),
  });
  
  // Return cleanup function to stop scheduled tasks and cancel event listeners
  return {
    cmcModule,
    aptosModule,
    teardown: () => {
      // Stop scheduled tasks
      cmcAnalysisJob.stop();
      portfolioHoldingJob.stop();
      
      // Cancel event listeners
      offCmcUpdateListener();
      
      // Clean up CMC module resources
      if (cmcModule && cmcModule.offListener) {
        cmcModule.offListener.updatePrice();
        cmcModule.offListener.updateInsight();
      }
      
      // Clean up APTOS module resources
      if (aptosModule && aptosModule.offListener) {
        aptosModule.offListener.getHolding();
        aptosModule.offListener.getSuggestion();
        aptosModule.offListener.confirmAdjustment();
      }
      
      console.log("Aitos Blueprint has been shut down");
    }
  };
}

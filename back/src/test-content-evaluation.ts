/**
 * test-content-evaluation.ts
 * 
 * Test script for ContentEvaluationModule by emitting mock events
 */

import { Agent } from "@/src/agent";
import { ContentInsight, Entity, Event } from "@/src/modules/x-content-crawler/types";
import dotenv from "dotenv";
import { enableContentEvaluationModule } from "./modules/content-process/contentEvalModule";

// Load environment variables from .env file
dotenv.config();

// Make sure a userId is set
const userId = process.env.userId || "test-user-123";
const agent = new Agent();

/**
 * Create and emit a mock X_CONTENT_TO_PROCESS_EVENT
 */
function emitMockContentToProcessEvent() {
  console.log("\n[TEST] Emitting mock X_CONTENT_TO_PROCESS_EVENT...");
  
  const mockPost = {
    userId: userId,
    post_content: `🚨 Timing the market 24/7? Optimal trades need split-second moves most miss.  

AITOS auto-trades entries/exits via AI, crunching real-time data to grab alpha.  

Sleep while bots handle the grind. ⏳🤖 #AptosDegen`,
    authorUsername: "techanalyst42",
    url: "https://twitter.com/techanalyst42/status/1743529939",
    timestamp: new Date().toISOString()
  };
  
  agent.sensing.emitEvent({
    type: "X_CONTENT_TO_PROCESS_EVENT",
    description: "X content to be processed",
    payload: mockPost,
    timestamp: Date.now(),
  });
  
  console.log("[TEST] Mock X_CONTENT_TO_PROCESS_EVENT emitted successfully");
}

/**
 * Run the test
 */
async function runTest() {
    enableContentEvaluationModule(agent,userId);

  // Wait for modules to initialize
  console.log("[TEST] Waiting for modules to initialize...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // First test: X_CONTENT_TO_PROCESS_EVENT
  // This will trigger content evaluation and then emit CONTENT_INSIGHT_AVAILABLE_EVENT automatically
  emitMockContentToProcessEvent();
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Second test: Direct CONTENT_INSIGHT_AVAILABLE_EVENT
  // This will bypass content evaluation and directly trigger Perplexity search
  
  // Keep process running to see results
  console.log("[TEST] Test events emitted. Waiting for processing...");
  console.log("[TEST] Press Ctrl+C to exit");
}

// Run the test
runTest().catch(error => {
  console.error("Test failed:", error);
});
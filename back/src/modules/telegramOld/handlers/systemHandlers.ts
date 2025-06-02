/**
 * System Handlers for Telegram Bot
 * 
 * This file contains handlers for system events and errors
 * that are sent to the Telegram bot.
 */

import { AgentEvent } from "@/src/agent/core/EventTypes";

/**
 * Handler for system error events
 * Processes system errors and sends alerts to Telegram
 */
export async function handleSystemErrorEvent(evt: AgentEvent, telegramBot: any) {
  try {
    console.error(`[Event] System error: ${evt.description}`);
    
    // Build error message
    const message = `⚠️ **System Alert**\n\n` +
      `❗ **Error Type**: ${evt.type}\n` +
      `📝 **Description**: ${evt.description}\n` +
      `⏱️ Occurrence Time: ${new Date(evt.timestamp).toLocaleString()}`;
      
    await telegramBot.sendMessage(message);
  } catch (error) {
    console.error("[Event] Failed to send system error notification:", error);
  }
}

/**
 * Handler for agent heartbeat events
 * Processes system heartbeat events for monitoring
 */
export async function handleHeartbeatEvent(evt: AgentEvent) {
  try {
    // Just log the heartbeat, don't send notifications
    const memoryUsage = evt.payload?.memoryUsage;
    const memoryUsedMB = memoryUsage ? (memoryUsage.rss / 1024 / 1024).toFixed(2) : 'unknown';
    const uptime = evt.payload?.uptime || 0;
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    console.log(
      `[Heartbeat] Agent heartbeat at ${new Date().toLocaleString()} | ` + 
      `Uptime: ${uptimeHours}h ${uptimeMinutes}m | Memory: ${memoryUsedMB} MB`
    );
  } catch (error) {
    console.error("[Heartbeat] Error processing heartbeat event:", error);
  }
}

/**
 * Generate system status information
 * @param agent Agent instance to get information from
 * @returns Formatted status message
 */
export function generateSystemStatus(agent: any) {
  const uptime = process.uptime();
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);
  const uptimeSeconds = Math.floor(uptime % 60);
  
  const memory = process.memoryUsage();
  const memoryUsedMB = (memory.rss / 1024 / 1024).toFixed(2);
  
  return {
    agentId: agent.agentId,
    uptime: {
      hours: uptimeHours,
      minutes: uptimeMinutes,
      seconds: uptimeSeconds,
      formattedString: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`
    },
    memory: {
      usedMB: memoryUsedMB,
      heapUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (memory.heapTotal / 1024 / 1024).toFixed(2)
    },
    timestamp: new Date().toISOString()
  };
}

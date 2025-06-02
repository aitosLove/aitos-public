// filepath: /Users/ryuko/dev/24531/wonderland-v2/back/src/agent/core/EventTypes.ts
/**
 * EventTypes.ts
 *
 * Defines the event structure flowing through the Agent.
 * These events are received and distributed by Sensing.ts (perception layer),
 * and modules or tasks can inject events via Sensing.emitEvent().
 */

/** Common event interface in the Agent */
export interface AgentEvent {
  /** Event type (e.g., "TASK_CREATED", "CREATE_CRON_TASK", etc.) */
  type: string;

  /** Event payload, specific data determined by the event type */
  payload?: any;

  /** EventDescription */
  description: string;

  /** Timestamp when the event was triggered */
  timestamp: number;
}

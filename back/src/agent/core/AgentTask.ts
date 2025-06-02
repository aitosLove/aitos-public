// filepath: /Users/ryuko/dev/24531/wonderland-v2/back/src/agent/core/AgentTask.ts
/**
 * AgentTask.ts
 *
 * Defines the most basic "task" interface in the Agent.
 * Each task has a unique ID, type, payload, status, and other information.
 * Various modules can define their own extended Payload based on this interface.
 */

export interface AgentTask<TPayload = any> {
  /** Task unique ID (automatically generated when created by TaskManager) */
  id: string;

  /**
   * Task type, used to distinguish tasks from different modules or logic
   * For example: "CRON_TASK", "WEBHOOK_TASK", etc.
   */
  type: string;
  description: string;

  /**
   * Module-defined payload type
   * For example: CronTaskPayload, WebhookPayload, etc.
   */
  payload: TPayload;

  /** Task creation timestamp */
  createdAt: number;

  /** Task status */
  status: TaskStatus;

  /** Task final result (if needed) */
  result?: any;

  // Callback function invoked when the task is executed
  callback?: (payload: TPayload) => any;
}

type TaskStatus = "pending" | "running" | "completed" | "failed";

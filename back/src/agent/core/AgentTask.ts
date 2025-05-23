/**
 * AgentTask.ts
 *
 * 定义 Agent 中的最基础“任务”接口。
 * 每个任务都拥有一个唯一ID、类型、payload、状态等信息。
 * 各种模块都可以基于这个接口，定义自己的扩展 Payload。
 */

export interface AgentTask<TPayload = any> {
  /** 任务唯一ID（由TaskManager创建时自动生成） */
  id: string;

  /**
   * 任务类型，用于区分不同模块或逻辑的任务
   * 例如："CRON_TASK"、"WEBHOOK_TASK" 等
   */
  type: string;
  description: string;

  /**
   * 模块自定义的负载类型
   * 例如 CronTaskPayload, WebhookPayload 等
   */
  payload: TPayload;

  /** 任务创建时间戳 */
  createdAt: number;

  /** 任务状态 */
  status: TaskStatus;

  /** 任务最终结果（如有需要） */
  result?: any;

  // 任务执行时调用的回调函数
  callback?: (payload: TPayload) => any;
}

type TaskStatus = "pending" | "running" | "completed" | "failed";

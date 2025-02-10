/**
 * EventTypes.ts
 *
 * 定义在 Agent 中流转的事件结构。
 * 这些事件由 Sensing.ts（感知层）负责接收和分发，
 * 模块或任务可通过 Sensing.emitEvent() 注入事件。
 */

/** Agent 里通用的事件接口 */
export interface AgentEvent {
  /** 事件类型 (如 "TASK_CREATED", "CREATE_CRON_TASK" 等) */
  type: string;

  /** 事件负载，具体数据由事件类型决定 */
  payload?: any;

  /** EventDescription */
  description: string;

  /** 事件触发的时间戳 */
  timestamp: number;
}

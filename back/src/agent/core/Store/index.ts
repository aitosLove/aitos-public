/**
 * Database.ts
 *
 * 定义统一的数据库接口，用于存储事件和任务
 */

export interface IDatabase {
  /**
   * 保存事件到数据库
   * @param eventData 事件数据
   */
  saveEvent(eventData: {
    name: string;
    description: string;
    // agentId: string;
  }): void;

  /**
   * 保存任务到数据库
   * @param taskData 任务数据
   */
  saveTask(taskData: {
    id: string;
    type: string;
    description: string;
    status: string;
    // agentId: string;
  }): void;

  /**
   * 更新任务状态
   * @param taskData 任务状态数据
   */
  editTaskStatus(taskData: { id: string; status: string }): void;

  /**
   * 生成唯一ID
   */
  generateId(): string;
}

/**
 * 空数据库实现，不执行任何实际操作
 */
export class NullDatabase implements IDatabase {
  private detailed: boolean;

  constructor(detailed: boolean = false) {
    this.detailed = detailed;
    // if (this.detailed) {
    //   console.log("NullDatabase initialized with detailed logging.");
    // }
  }

  saveEvent(_eventData: { name: string; description: string }): void {
    // 空实现
    if (this.detailed) {
      console.log("Event saved to NullDatabase:", _eventData);
    }
  }

  saveTask(_taskData: {
    id: string;
    type: string;
    description: string;
    status: string;
  }): void {
    // 空实现
    if (this.detailed) {
      console.log("Task saved to NullDatabase:", _taskData);
    }
  }

  editTaskStatus(_taskData: { id: string; status: string }): void {
    // 空实现
    if (this.detailed) {
      console.log("Task status updated in NullDatabase:", _taskData);
    }
  }

  generateId(): string {
    return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}

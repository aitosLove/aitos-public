/**
 * TaskManager.ts
 *
 * 负责创建和执行任务，并在任务的不同阶段发出相应事件：
 * - TASK_CREATED
 * - TASK_STARTED
 * - TASK_COMPLETED
 * - (可扩展) TASK_FAILED, etc.
 *
 * 这是一个最简实现，演示如何与 Sensing 搭配使用。
 */

import { AgentTask } from "./AgentTask";
import { ISensing } from "./Sensing";
import { saveTask, editTaskStatus, generateId } from "./Store";

export class TaskManager {
  /** 存储所有已创建的任务 */
  private tasks: AgentTask[] = [];

  /** 与感知层交互，用于发事件 */
  private sensing: ISensing;

  constructor(sensing: ISensing) {
    this.sensing = sensing;
  }

  /**
   * 创建一个新任务，并立刻执行
   * @param partialTask 不包含 id、createdAt、status 的部分
   * @returns 完整的 AgentTask
   */
  createTask<T>(
    partialTask: Omit<AgentTask<T>, "id" | "createdAt" | "status">
  ): AgentTask<T> {
    const newTask: AgentTask<T> = {
      ...partialTask,
      id: `task-${Date.now()}`, // 简单生成ID
      createdAt: Date.now(),
      status: "pending",
    };

    // 保存到本地任务列表
    this.tasks.push(newTask);

    // 发出 TASK_CREATED 事件
    // this.sensing.emitEvent({
    //   type: "TASK_CREATED",
    //   payload: newTask,
    //   timestamp: Date.now(),
    // });

    // 启动执行
    this.executeTask(newTask);

    return newTask;
  }

  /**
   * 模拟执行任务的逻辑
   * @param task AgentTask
   */
  private executeTask<T>(task: AgentTask<T>) {
    task.status = "running";

    const taskId = generateId();

    saveTask({
      id: taskId,
      type: task.type,
      description: task.descrpition,
      status: task.status,
    });

    // 发出开始事件
    // this.sensing.emitEvent({
    //   type: "TASK_STARTED",
    //   payload: task,
    //   timestamp: Date.now(),
    // });

    // // 模拟异步执行：此处仅用 setTimeout
    // setTimeout(() => {
    //   task.status = "completed";
    //   task.result = "some result";

    //   // 发出完成事件
    //   this.sensing.emitEvent({
    //     type: "TASK_COMPLETED",
    //     payload: task,
    //     timestamp: Date.now(),
    //   });
    // }, 500);

    // 如果任务包含 callback，则执行它
    if (task.callback) {
      try {
        task.result = task.callback(task.payload); // 执行回调
        task.status = "completed"; // 标记为完成

        editTaskStatus({
          id: taskId,
          status: "completed",
        });
        // this.sensing.emitEvent({
        //   type: "TASK_COMPLETED",
        //   payload: task,
        //   timestamp: Date.now(),
        // });
      } catch (error) {
        task.status = "failed"; // 如果回调执行失败，标记为失败

        editTaskStatus({
          id: taskId,
          status: "failed",
        });

        // this.sensing.emitEvent({
        //   type: "TASK_FAILED",
        //   payload: task,
        //   timestamp: Date.now(),
        // });
      }
    }
  }

  /**
   * 返回当前所有任务 (可供监控)
   */
  getTasks(): AgentTask[] {
    return this.tasks;
  }

  /** 输出当前任务的状态 */
  showStatus() {
    console.log(`TaskManager Status:`);
    console.log(`- Total tasks: ${this.tasks.length}`);
    this.tasks.forEach((task, idx) => {
      console.log(`  ${idx + 1}: Task ID: ${task.id}, Status: ${task.status}`);
    });
  }
}

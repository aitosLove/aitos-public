// filepath: /Users/ryuko/dev/24531/wonderland-v2/back/src/agent/core/TaskManager.ts
/**
 * TaskManager.ts
 *
 * Responsible for creating and executing tasks, and emitting appropriate events at different stages:
 * - TASK_CREATED
 * - TASK_STARTED
 * - TASK_COMPLETED
 * - (extensible) TASK_FAILED, etc.
 *
 * This is a minimal implementation demonstrating how to use with Sensing.
 */

import { AgentTask } from "./AgentTask";
import { ISensing } from "./Sensing";
import { IDatabase } from "./Store";

export class TaskManager {
  /** Stores all created tasks */
  private tasks: AgentTask[] = [];

  /** Interacts with the perception layer for emitting events */
  private sensing: ISensing;

  /** Database instance */
  private db: IDatabase;

  constructor(sensing: ISensing, db: IDatabase) {
    this.sensing = sensing;
    this.db = db;
  }

  /**
   * Creates a new task and executes it immediately
   * @param partialTask The part that doesn't include id, createdAt, status
   * @returns Complete AgentTask
   */
  createTask<T>(
    partialTask: Omit<AgentTask<T>, "id" | "createdAt" | "status">
  ): AgentTask<T> {
    const newTask: AgentTask<T> = {
      ...partialTask,
      id: `task-${Date.now()}`, // Simple ID generation
      createdAt: Date.now(),
      status: "pending",
    };

    // Save to local task list
    this.tasks.push(newTask);

    // Emit TASK_CREATED event
    // this.sensing.emitEvent({
    //   type: "TASK_CREATED",
    //   payload: newTask,
    //   timestamp: Date.now(),
    // });

    // Start execution
    this.executeTask(newTask);

    return newTask;
  }

  /**
   * Logic to simulate task execution
   * @param task AgentTask
   */
  private executeTask<T>(task: AgentTask<T>) {
    task.status = "running";

    const taskId = this.db.generateId();

    this.db.saveTask({
      id: taskId,
      type: task.type,
      description: task.description,
      status: task.status,
    });

    // Emit start event
    // this.sensing.emitEvent({
    //   type: "TASK_STARTED",
    //   payload: task,
    //   timestamp: Date.now(),
    // });

    // // Simulate async execution: just using setTimeout here
    // setTimeout(() => {
    //   task.status = "completed";
    //   task.result = "some result";

    //   // Emit completion event
    //   this.sensing.emitEvent({
    //     type: "TASK_COMPLETED",
    //     payload: task,
    //     timestamp: Date.now(),
    //   });
    // }, 500);

    // If the task includes a callback, execute it
    if (task.callback) {
      try {
        task.result = task.callback(task.payload); // Execute callback
        task.status = "completed"; // Mark as complete

        this.db.editTaskStatus({
          id: taskId,
          status: "completed",
        });
        // this.sensing.emitEvent({
        //   type: "TASK_COMPLETED",
        //   payload: task,
        //   timestamp: Date.now(),
        // });
      } catch (error) {
        task.status = "failed"; // If callback execution fails, mark as failed

        this.db.editTaskStatus({
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
   * Return all current tasks (for monitoring)
   */
  getTasks(): AgentTask[] {
    return this.tasks;
  }

  /** Output the current task status */
  showStatus() {
    console.log(`TaskManager Status:`);
    console.log(`- Total tasks: ${this.tasks.length}`);
    this.tasks.forEach((task, idx) => {
      console.log(`  ${idx + 1}: Task ID: ${task.id}, Status: ${task.status}`);
    });
  }
}

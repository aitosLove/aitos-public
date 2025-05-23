import { db } from "@/db";
import { taskStatus, tasksTable, eventsTable } from "@/db/schema/agentSchema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function saveEvent({
  name,
  description,
  timeStamp,
  agentId,
}: {
  name: string;
  description: string;
  timeStamp?: number | undefined;
  agentId: string;
}) {
  try {
    const result = await db
      .insert(eventsTable)
      .values({
        type: name,
        description,
        timestamp: timeStamp ? new Date(timeStamp) : undefined,
        agentId: agentId,
      })
      .returning();

    return result[0];
  } catch (e) {
    console.log(`Error in saveEvent: ${e}`);
  }
}

async function saveTask({
  id,
  type,
  description,
  status,
  timeStamp,
  agentId,
}: {
  id: string;
  type: string;
  description: string;
  status: "pending" | "completed" | "running" | "failed";
  timeStamp?: number | undefined;
  agentId: string;
}) {
  try {
    const result = await db
      .insert(tasksTable)
      .values({
        id: id,
        type: type,
        description: description,
        status: status,
        timestamp: timeStamp ? new Date(timeStamp) : undefined,
        agentId: agentId,
      })
      .returning();

    return result[0];
  } catch (e) {
    console.log(`Error in saveTask: ${e}`);
  }
}

async function editTaskStatus({
  id,
  status,
}: {
  id: string;
  status: "pending" | "completed" | "running" | "failed";
}) {
  try {
    const result = await db
      .update(tasksTable)
      .set({ status: status })
      .where(eq(tasksTable.id, id))
      .returning();

    return result[0];
  } catch (e) {
    console.log(`Error in editTaskStatus: ${e}`);
  }
}

function generateId() {
  return uuidv4();
}

/**
 * DrizzleDatabase.ts
 *
 * 实现IDatabase接口的Drizzle数据库适配器
 */

import { IDatabase } from "./agent/core/Store";

export class DrizzleDatabase implements IDatabase {
  private agentId: string;

  /**
   * 构造函数
   * @param agentId 代理ID，用于数据库存储
   */
  constructor(agentId: string) {
    this.agentId = agentId;
  }

  /**
   * 保存事件到数据库
   * @param eventData 事件数据
   */
  saveEvent(eventData: { name: string; description: string }): void {
    saveEvent({
      name: eventData.name,
      description: eventData.description,
      timeStamp: Date.now(),
      agentId: this.agentId,
    }).catch((error) => {
      console.error(`Error saving event: ${error}`);
    });
  }

  /**
   * 保存任务到数据库
   * @param taskData 任务数据
   */
  saveTask(taskData: {
    id: string;
    type: string;
    description: string;
    status: string;
  }): void {
    saveTask({
      id: taskData.id,
      type: taskData.type,
      description: taskData.description,
      status: taskData.status as "pending" | "completed" | "running" | "failed",
      timeStamp: Date.now(),
      agentId: this.agentId,
    }).catch((error) => {
      console.error(`Error saving task: ${error}`);
    });
  }

  /**
   * 更新任务状态
   * @param taskData 任务状态数据
   */
  editTaskStatus(taskData: { id: string; status: string }): void {
    editTaskStatus({
      id: taskData.id,
      status: taskData.status as "pending" | "completed" | "running" | "failed",
    }).catch((error) => {
      console.error(`Error updating task status: ${error}`);
    });
  }

  /**
   * 生成唯一ID
   */
  generateId(): string {
    return generateId();
  }
}

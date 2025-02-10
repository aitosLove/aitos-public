import { db } from "@/db";
import { eventsTable, tasksTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function saveEvent({
  name,
  description,
  timeStamp,
}: {
  name: string;
  description: string;
  timeStamp?: number | undefined;
}) {
  try {
    const result = await db
      .insert(eventsTable)
      .values({
        type: name,
        description,
        timestamp: timeStamp ? new Date(timeStamp) : undefined,
      })
      .returning();

    return result[0];
  } catch (e) {
    console.log(`Error in saveEvent: ${e}`);
  }
}

export async function saveTask({
  id,
  type,
  description,
  status,
  timeStamp,
}: {
  id: string;
  type: string;
  description: string;
  status: "pending" | "completed" | "running" | "failed";
  timeStamp?: number | undefined;
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
      })
      .returning();

    return result[0];
  } catch (e) {
    console.log(`Error in saveTask: ${e}`);
  }
}

export async function editTaskStatus({
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

export function generateId() {
  return uuidv4();
}

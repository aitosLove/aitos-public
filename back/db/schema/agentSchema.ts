import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const eventsTable = pgTable("events", {
  id: uuid().primaryKey().defaultRandom(),
  type: varchar({ length: 255 }).notNull(),
  description: text().notNull().default(""),
  timestamp: timestamp().defaultNow().notNull(),
  agentId: uuid().notNull(),
});

export const taskStatus = pgEnum("task_status", [
  "pending",
  "completed",
  "running",
  "failed",
]);

export const tasksTable = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  type: varchar({ length: 255 }).notNull(),
  description: text().notNull().default(""),
  status: taskStatus().notNull(),
  timestamp: timestamp().defaultNow().notNull(),
  agentId: uuid().notNull(),
});

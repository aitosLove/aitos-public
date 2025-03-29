import {
  text,
  integer,
  pgTable,
  varchar,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const jsonLearnTable = pgTable("json_learn", {
  id: uuid().primaryKey().defaultRandom(),
  data: jsonb().notNull(),
});

export const marketStateTable = pgTable("market_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  marketData: jsonb().notNull(),
});

export const insightStateTable = pgTable("insight_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  insight: text().notNull(),
});

export const insightInstructTable = pgTable("insight_instruct", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  instruct: text().notNull(),
});

export const defiInsightTable = pgTable("defi_insight_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  insight: text().notNull(),
});

export const defiInstructTable = pgTable("defi_instruct_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  instruct: text().notNull(),
});

export const holdingStateTable = pgTable("holding_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  holding: jsonb().notNull(),
});

export const tradingInstructTable = pgTable("trading_instruct", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  instruct: text().notNull(),
});

export const actionStateTable = pgTable("action_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  action: text().notNull(),
  reason: text().notNull(),
  details: jsonb().notNull(),
});

export const eventsTable = pgTable("events", {
  id: uuid().primaryKey().defaultRandom(),
  type: varchar({ length: 255 }).notNull(),
  description: text().notNull().default(""),
  timestamp: timestamp().defaultNow().notNull(),
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
});

export const messageStatus = pgEnum("message_status", [
  "pending",
  "sent",
  "failed",
]);

export const tgMessageTable = pgTable("tg_message", {
  id: uuid().primaryKey().defaultRandom(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  status: messageStatus().notNull(),
});

import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  uuid,
  json,
  index,
  uniqueIndex,
  jsonb,
  pgEnum,
  real,
  serial,
} from "drizzle-orm/pg-core";

export const marketStateTable = pgTable("market_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  marketData: jsonb().notNull(),
  agentId: uuid().notNull(),
});

export const insightStateTable = pgTable("insight_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  insight: text().notNull(),
  agentId: uuid().notNull(),
});

export const insightInstructTable = pgTable("insight_instruct", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  instruct: text().notNull(),
  agentId: uuid().notNull(),
});

export const defiInsightTable = pgTable("defi_insight_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  insight: text().notNull(),
  agentId: uuid().notNull(),
});

export const defiInstructTable = pgTable("defi_instruct_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  instruct: text().notNull(),
  agentId: uuid().notNull(),
});

export const holdingStateTable = pgTable("holding_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  holding: jsonb().notNull(),
  agentId: uuid().notNull(),
});

export const tradingInstructTable = pgTable("trading_instruct", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  instruct: text().notNull(),
  agentId: uuid().notNull(),
});

export const actionStateTable = pgTable("action_state", {
  id: uuid().primaryKey().defaultRandom(),
  timestamp: timestamp().defaultNow().notNull(),
  action: text().notNull(),
  reason: text().notNull(),
  details: jsonb().notNull(),
  agentId: uuid().notNull(),
});

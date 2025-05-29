import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  pgEnum,
  real,
  serial,
} from "drizzle-orm/pg-core";

export const messageStatus = pgEnum("message_status", [
  "pending",
  "sent",
  "failed",
]);

export const messageRole = pgEnum("message_role", [
  "user",
  "assistant", 
  "system"
]);

export const messageType = pgEnum("message_type", [
  "text",
  "command",
  "notification"
]);

export const tgMessageTable = pgTable("tg_message", {
  id: serial().primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  role: messageRole().notNull(),
  content: text("content").notNull(),
  messageType: messageType().notNull().default("text"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: text("metadata"), // JSON string for additional data
  sentAt: timestamp("sent_at").defaultNow(),
  status: messageStatus().notNull().default("sent"),
});

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

export const tgMessageTable = pgTable("tg_message", {
  id: uuid().primaryKey().defaultRandom(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  status: messageStatus().notNull(),
});

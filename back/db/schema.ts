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
} from 'drizzle-orm/pg-core';
import { relations, sql, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';


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



// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  // Additional user fields can be added here
});

// Followings table - stores users that are followed by other users
export const followings = pgTable('followings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  followingUsername: text('following_username').notNull(),
  followingDisplayName: text('following_display_name'),
  // Fixed: Ensuring the column name matches what's in the database
  // If the column doesn't exist yet in the database, you'll need to run a migration
  followingUrl: text('followingUrl'), // Changed to match JS property name or create a new migration
  postsCollected: integer('posts_collected').default(0),
  lastUpdate: timestamp('last_update', { withTimezone: true }),
  error: text('error'),
});

// Many-to-many relation is reflected with a join table
export const usersToFollowings = pgTable('users_to_followings', {
  userId: text('user_id').notNull().references(() => users.id),
  followingId: text('following_id').notNull().references(() => followings.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.followingId] }),
}));

// Posts table
export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  url: text('url'),
  timestamp: text('timestamp'),
  text: text('text'),
  authorUsername: text('author_username').notNull(),
  authorDisplayName: text('author_display_name'),
  replies: real('replies'),
  retweets: real('retweets'),
  likes: real('likes'),
  views: real('views'),
});

// ProcessedPosts table - tracks which posts have been processed by which users
export const processedPosts = pgTable('processed_posts', {
  userId: text('user_id').notNull().references(() => users.id),
  postId: text('post_id').notNull().references(() => posts.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.postId] }),
}));

// Insights table - stores insights derived from posts
export const insights = pgTable('insights', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  postId: text('post_id').notNull().references(() => posts.id),
  postUrl: text('post_url'),
  author: text('author').notNull(),
  timestamp: text('timestamp'),
  originalText: text('original_text'),
  insightSummary: text('insight_summary').notNull(),
  insightType: text('insight_type', { enum: ['crypto_trading', 'crypto_project', 'crypto_general'] }).notNull(),
  confidence: real('confidence').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  followings: many(usersToFollowings),
  processedPosts: many(processedPosts),
  insights: many(insights),
}));

export const followingsRelations = relations(followings, ({ many }) => ({
  users: many(usersToFollowings),
}));

export const postsRelations = relations(posts, ({ many }) => ({
  processedBy: many(processedPosts),
  insights: many(insights),
}));


export const userCookies = pgTable('user_cookies', {
  username: text('username').primaryKey(),
  cookieData: json('cookie_data').$type<any[]>(), // Store array of JSON objects
  lastUpdate: timestamp('last_update').defaultNow(), // Automatically set to current time
});

export type Cookie = InferSelectModel<typeof userCookies>; // Select type
export type CookieInsert = InferInsertModel<typeof userCookies>; // Insert type
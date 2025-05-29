/**
 * Twitter Schema for X Content Crawler
 * 
 * Naming conventions:
 * - All tables are prefixed with 'x' (e.g., xUsers, xPosts)
 * - Database column names use snake_case
 * - TypeScript variable names use camelCase
 * - Relations are named consistently with their tables
 */
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
import {
  relations,
  sql,
  type InferSelectModel,
  type InferInsertModel,
} from "drizzle-orm";

// Users table
export const xUsers = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  agentId: text("agent_id").notNull(),
  // Additional user fields can be added here
});

// Followings table - stores users that are followed by other users
export const xFollowings = pgTable("followings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => xUsers.id),
  agentId: text("agent_id").notNull(),
  followingUsername: text("following_username").notNull(),
  followingDisplayName: text("following_display_name"),
  followingUrl: text("following_url"), // Fixed column name to follow snake_case convention
  postsCollected: integer("posts_collected").default(0),
  lastUpdate: timestamp("last_update", { withTimezone: true }),
  error: text("error"),
});

// Many-to-many relation is reflected with a join table
export const xUsersToFollowings = pgTable(
  "users_to_followings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => xUsers.id),
    followingId: text("following_id")
      .notNull()
      .references(() => xFollowings.id),
    agentId: text("agent_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.followingId] }),
  })
);

// Posts table
export const xPosts = pgTable("posts", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  url: text("url"),
  timestamp: text("timestamp"),
  text: text("text"),
  authorUsername: text("author_username").notNull(),
  authorDisplayName: text("author_display_name"),
  replies: real("replies"),
  retweets: real("retweets"),
  likes: real("likes"),
  views: real("views"),
});

// ProcessedPosts table - tracks which posts have been processed by which users
export const xProcessedPosts = pgTable(
  "processed_posts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => xUsers.id),
    postId: text("post_id")
      .notNull()
      .references(() => xPosts.id),
    agentId: text("agent_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] }),
  })
);

export const xPostInsights = pgTable("post_insights", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => xUsers.id),
  postId: text("post_id")
    .notNull()
    .references(() => xPosts.id),
  agentId: text("agent_id").notNull(),
  hasValue: boolean("has_value").notNull(),
  category: text("category", {
    enum: ["trading_idea", "project_intro", "market_insight", "none"],
  }).notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  author: text("author").notNull(),
  timestamp: text("timestamp").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const xUsersRelations = relations(xUsers, ({ many }) => ({
  followings: many(xUsersToFollowings),
  processedPosts: many(xProcessedPosts),
  insights: many(xPostInsights),
}));

export const xFollowingsRelations = relations(xFollowings, ({ many }) => ({
  users: many(xUsersToFollowings),
}));

export const xPostsRelations = relations(xPosts, ({ many }) => ({
  processedBy: many(xProcessedPosts),
  insights: many(xPostInsights),
}));

export const xUserCookies = pgTable("user_cookies", {
  username: text("username").primaryKey(),
  agentId: text("agent_id").notNull(),
  cookieData: json("cookie_data").$type<any[]>(), // Store array of JSON objects
  lastUpdate: timestamp("last_update").defaultNow(), // Automatically set to current time
});

export const xContentInsights = pgTable("content_insights", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  hasValue: boolean("has_value").notNull().default(false),
  category: varchar("category", { length: 50 })
    .notNull()
    .$type<"trading_idea" | "project_intro" | "market_insight" | "none">(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  entity: jsonb("entity").default([]),
  event: jsonb("event").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Citation table
export const xDeepSearchCitations = pgTable("deep_search_citations", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  perplexitySearchId: integer("perplexity_search_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Perplexity Search Table
export const xDeepSearches = pgTable("deep_searches", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  // Metadata
  model: text("model").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  // Usage statistics
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  citationTokens: integer("citation_tokens"),
  searchQueriesCount: integer("search_queries_count"),
  // Related content
  contentId: text("content_id").notNull(),
  username: text("username").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  // Raw response (optional)
  rawResponse: jsonb("raw_response"),
  // System fields
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ContentInsightModel = InferSelectModel<typeof xContentInsights>;
export type PerplexitySearchModel = InferSelectModel<typeof xDeepSearches>;
export type CitationModel = InferSelectModel<typeof xDeepSearchCitations>;

// FormattedCitation type
export interface FormattedCitation {
  url: string;
  title: string;
}

// RelatedContent type
export interface RelatedContent {
  contentId: string;
  username: string;
  category: string;
}

export interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  citation_tokens: number;
  num_search_queries: number;
}

export type Cookie = InferSelectModel<typeof xUserCookies>; // Select type
export type CookieInsert = InferInsertModel<typeof xUserCookies>; // Insert type

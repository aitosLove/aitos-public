// drizzleClient.ts - Fixed to work with revised schema and without transactions

import { v4 as uuidv4 } from "uuid";

import {
  users,
  followings,
  usersToFollowings,
  posts,
  processedPosts,
  insights,
  userCookies,
  Cookie,
} from "@/db/schema/moduleSchema";

import { Following, XPost, ContentInsight } from "./types";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";

export async function getFollowings(userId: string): Promise<Following[]> {
  const userFollowingsRaw = await db
    .select({
      id: followings.id,
      username: followings.followingUsername,
      displayName: followings.followingDisplayName,
      url: followings.followingUrl,
      postsCollected: followings.postsCollected,
      error: followings.error,
      lastUpdate: followings.lastUpdate,
    })
    .from(followings)
    .where(eq(followings.userId, userId));

  const userFollowings: Following[] = [];

  for (const following of userFollowingsRaw) {
    // Get posts for this following
    const userPosts = await getPostsForFollowing(following.username);

    userFollowings.push({
      username: following.username,
      displayName: following.displayName,
      url: following.url,
      posts: userPosts,
      postsCollected: following.postsCollected || 0,
      error: following.error,
      lastUpdate: following.lastUpdate,
    });
  }

  console.log(
    `[DB] Retrieved ${userFollowings.length} followings for user ${userId}`
  );
  return userFollowings;
}
export async function saveFollowings(
  userId: string,
  followingsData: Following[]
): Promise<void> {
  await ensureUserExists(userId);

  let savedCount = 0;
  let updatedCount = 0;

  for (const followingData of followingsData) {
    try {
      // Check if following already exists for this user
      const existingFollowing = await db.query.followings.findFirst({
        where: and(
          eq(followings.userId, userId),
          eq(followings.followingUsername, followingData.username)
        ),
      });

      // Declare followingId variable outside the conditional blocks
      let followingId: string;

      if (existingFollowing) {
        // Use existing following ID
        followingId = existingFollowing.id;

        // Update existing following record
        await db
          .update(followings)
          .set({
            followingDisplayName: followingData.displayName,
            followingUrl: followingData.url,
            postsCollected: followingData.postsCollected,
            error: followingData.error,
          })
          .where(eq(followings.id, followingId));

        updatedCount++;
      } else {
        // Generate new following ID
        followingId = uuidv4();

        await db.insert(followings).values({
          id: followingId,
          userId,
          followingUsername: followingData.username,
          followingDisplayName: followingData.displayName,
          followingUrl: followingData.url,
          postsCollected: followingData.postsCollected,
          error: followingData.error,
        });

        // Create relationship
        await db.insert(usersToFollowings).values({
          userId,
          followingId,
        });

        savedCount++;
      }
    } catch (error) {
      console.error(
        `Error saving following ${followingData.username}: ${error}`
      );
    }
  }

  console.log(
    `[DB] Saved ${savedCount} new followings and updated ${updatedCount} existing followings for ${userId}`
  );
}
export async function updateFollowingLastUpdated(
  userId: string,
  followingUsername: string
): Promise<void> {
  try {
    // Check if following exists for this user
    const existingFollowing = await db.query.followings.findFirst({
      where: and(
        eq(followings.userId, userId),
        eq(followings.followingUsername, followingUsername)
      ),
    });

    if (existingFollowing) {
      // Update the lastUpdated field to the current timestamp
      await db
        .update(followings)
        .set({ lastUpdate: sql`NOW()` })

        .where(eq(followings.id, existingFollowing.id));

      console.log(
        `[DB] Updated lastUpdated timestamp for following ${followingUsername} (user: ${userId})`
      );
    } else {
      console.warn(
        `[DB] Cannot update lastUpdated: Following ${followingUsername} not found for user ${userId}`
      );
    }
  } catch (error) {
    console.error(
      `[DB] Error updating lastUpdated for following ${followingUsername}: ${error}`
    );
  }
}
/**
 * Get followings for a user
 */

/**
 * Save a processed post
 */
export async function saveProcessedPost(
  userId: string,
  post: XPost
): Promise<void> {
  // Ensure user exists
  await ensureUserExists(userId);

  // Save post if not already saved
  await savePost(post);

  // Save relationship to processed posts
  try {
    await db.insert(processedPosts).values({
      userId,
      postId: post.id,
    });
    console.log(`[DB] Saved processed post ${post.id} for user ${userId}`);
  } catch (error) {
    // Post may already be processed, ignore unique constraint errors
    console.log(`[DB] Post ${post.id} already processed for user ${userId}`);
  }
}

/**
 * Check if a post has been processed
 */
export async function isPostProcessed(
  userId: string,
  postId: string
): Promise<boolean> {
  const processedPost = await db
    .select()
    .from(processedPosts)
    .where(
      and(eq(processedPosts.userId, userId), eq(processedPosts.postId, postId))
    )
    .limit(1);

  const isProcessed = processedPost.length > 0;
  console.log(
    `[DB] Checking if post ${postId} is processed for user ${userId}: ${isProcessed}`
  );
  return isProcessed;
}

/**
 * Save an insight
 */
export async function saveInsight(
  userId: string,
  postId: string,
  insight: ContentInsight
): Promise<void> {
  // Ensure user exists
  await ensureUserExists(userId);

  await db.insert(insights).values({
    id: uuidv4(),
    userId,
    postId,
    hasValue: insight.hasValue,
    category: insight.category,
    summary: insight.summary,
    source: insight.source,
    author: insight.username,
    timestamp: insight.timestamp,
  });

  console.log(`[DB] Saved insight for post ${postId} for user ${userId}`);
}

/**
 * Ensure a user exists in the database
 */
export async function ensureUserExists(userId: string): Promise<void> {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: userId,
      username: userId, // Using userId as username for simplicity
    });
  }
}

/**
 * Save or update a post in the database
 */
export async function savePost(post: XPost): Promise<void> {
  try {
    // Use upsert pattern to handle both new and existing posts
    await db
      .insert(posts)
      .values({
        id: post.id,
        url: post.url,
        timestamp: post.timestamp,
        text: post.text,
        authorUsername: post.author.username,
        authorDisplayName: post.author.displayName,
        replies: post.metrics.replies,
        retweets: post.metrics.retweets,
        likes: post.metrics.likes,
        views: post.metrics.views,
      })
      .onConflictDoUpdate({
        target: posts.id,
        set: {
          // Only update metrics which may change over time
          replies: post.metrics.replies,
          retweets: post.metrics.retweets,
          likes: post.metrics.likes,
          views: post.metrics.views,
        },
      });
  } catch (error) {
    console.error(`[DB] Error saving post ${post.id}:`, error);
  }
}

/**
 * Get posts for a specific following
 */
export async function getPostsForFollowing(username: string): Promise<XPost[]> {
  const followingPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorUsername, username));

  return followingPosts.map((post) => ({
    id: post.id,
    url: post.url,
    timestamp: post.timestamp,
    text: post.text,
    author: {
      username: post.authorUsername,
      displayName: post.authorDisplayName,
    },
    metrics: {
      replies: post.replies,
      retweets: post.retweets,
      likes: post.likes,
      views: post.views,
    },
  }));
}

export async function storeCookies(
  username: string,
  cookieData: any[]
): Promise<void> {
  try {
    await db
      .insert(userCookies)
      .values({
        username,
        cookieData,
        lastUpdate: new Date(),
      })
      .onConflictDoUpdate({
        target: userCookies.username,
        set: { cookieData: cookieData, lastUpdate: new Date() },
      });
  } catch (error) {
    console.error("Error storing cookies:", error);
    throw new Error("Failed to store cookies");
  }
}

export async function getCookiesByUsername(
  username: string
): Promise<Cookie | null> {
  try {
    const result = await db
      .select()
      .from(userCookies)
      .where(eq(userCookies.username, username))
      .limit(1);

    if (result.length === 0) return null;

    // Apply setSameSiteStrict to ensure all cookies have sameSite: "Strict"
    const record = result[0];
    if (record.cookieData) {
      record.cookieData = setSameSiteStrict(record.cookieData);
    }

    return record;
  } catch (error) {
    console.error("Error retrieving cookies:", error);
    throw new Error("Failed to retrieve cookies");
  }
}

export function setSameSiteStrict<T extends Cookie>(
  cookies: T[]
): Array<T & { sameSite: "Strict" }> {
  return cookies.map((cookie) => ({
    ...cookie,
    sameSite: "Strict" as const,
  }));
}

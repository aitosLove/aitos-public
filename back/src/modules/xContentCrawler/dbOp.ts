// drizzleClient.ts - Fixed to work with revised schema and without transactions

import { v4 as uuidv4 } from "uuid";

import {
  xUsers,
  xFollowings,
  xUsersToFollowings,
  xPosts,
  xProcessedPosts,
  xPostInsights,
  xUserCookies,
  Cookie,
} from "@/db/schema/moduleSchema/twitterSchema";

import { Following, XPost, ContentInsight } from "./types";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Get all followings for a specific user and agent
 * @param userId - The user ID
 * @param agentId - The agent ID
 * @returns Promise<Following[]> - Array of following users with their posts
 */
export async function getFollowings(userId: string, agentId: string): Promise<Following[]> {
  const userFollowingsRaw = await db
    .select({
      id: xFollowings.id,
      username: xFollowings.followingUsername,
      displayName: xFollowings.followingDisplayName,
      url: xFollowings.followingUrl,
      postsCollected: xFollowings.postsCollected,
      error: xFollowings.error,
      lastUpdate: xFollowings.lastUpdate,
    })
    .from(xFollowings)
    .where(and(
      eq(xFollowings.userId, userId),
      eq(xFollowings.agentId, agentId)
    ));

  const userFollowings: Following[] = [];

  for (const following of userFollowingsRaw) {
    // Get posts for this following
    const userPosts = await getPostsForFollowing(following.username, agentId);

    userFollowings.push({
      username: following.username,
      displayName: following.displayName,
      url: following.url,
      posts: userPosts,
      postsCollected: following.postsCollected || 0,
      error: following.error,
      lastUpdate: following.lastUpdate,
      agentId: agentId,
    });
  }

  console.log(
    `[DB] Retrieved ${userFollowings.length} followings for user ${userId}`
  );
  return userFollowings;
}

/**
 * Save followings data to the database
 * @param userId - The user ID
 * @param agentId - The agent ID
 * @param followingsData - Array of following users to save
 */
export async function saveFollowings(
  userId: string,
  agentId: string,
  followingsData: Following[]
): Promise<void> {
  await ensureUserExists(userId, agentId);

  let savedCount = 0;
  let updatedCount = 0;

  for (const followingData of followingsData) {
    try {
      // Check if following already exists for this user
      const existingFollowing = await db.query.xFollowings.findFirst({
        where: and(
          eq(xFollowings.userId, userId),
          eq(xFollowings.agentId, agentId),
          eq(xFollowings.followingUsername, followingData.username)
        ),
      });

      // Declare followingId variable outside the conditional blocks
      let followingId: string;

      if (existingFollowing) {
        // Use existing following ID
        followingId = existingFollowing.id;

        // Update existing following record
        await db
          .update(xFollowings)
          .set({
            followingDisplayName: followingData.displayName,
            followingUrl: followingData.url,
            postsCollected: followingData.postsCollected,
            error: followingData.error,
          })
          .where(eq(xFollowings.id, followingId));

        updatedCount++;
      } else {
        // Generate new following ID
        followingId = uuidv4();

        await db.insert(xFollowings).values({
          id: followingId,
          userId,
          agentId,
          followingUsername: followingData.username,
          followingDisplayName: followingData.displayName,
          followingUrl: followingData.url,
          postsCollected: followingData.postsCollected,
          error: followingData.error,
        });

        // Create relationship
        await db.insert(xUsersToFollowings).values({
          userId,
          followingId,
          agentId,
        });

        savedCount++;
      }
    } catch (error) {
      console.error(
        `Error saving following ${followingData.username}: ${error}`
      );
    }
  }

  console.log(`Saved ${savedCount} new followings and updated ${updatedCount}`);
}

export async function updateFollowingLastUpdated(
  userId: string,
  agentId: string,
  followingUsername: string
): Promise<void> {
  try {
    // Find the existing following record
    const existingFollowing = await db.query.xFollowings.findFirst({
      where: and(
        eq(xFollowings.userId, userId),
        eq(xFollowings.agentId, agentId),
        eq(xFollowings.followingUsername, followingUsername)
      ),
    });

    if (!existingFollowing) {
      console.log(`No following record found for ${followingUsername}`);
      return;
    }

    // Update the lastUpdate timestamp
    await db
      .update(xFollowings)
      .set({
        lastUpdate: new Date(),
      })
      .where(eq(xFollowings.id, existingFollowing.id));

    console.log(
      `[DB] Updated lastUpdated timestamp for following ${followingUsername} (user: ${userId})`
    );
  } catch (error) {
    console.error(
      `Error updating lastUpdated for following ${followingUsername}: ${error}`
    );
  }
}

export async function saveProcessedPost(
  userId: string,
  agentId: string,
  postId: string
): Promise<void> {
  await ensureUserExists(userId, agentId);

  try {
    // Add entry to processedPosts table
    await db.insert(xProcessedPosts).values({
      userId,
      postId,
      agentId,
    });
  } catch (error) {
    // If error is uniqueness constraint, that's fine
    if (!(error instanceof Error) || !error.message.includes("duplicate key")) {
      console.error(`Error saving processed post: ${error}`);
      throw error;
    }
  }
}

export async function isPostProcessed(
  userId: string,
  agentId: string,
  postId: string
): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(xProcessedPosts)
      .where(
        and(
          eq(xProcessedPosts.userId, userId),
          eq(xProcessedPosts.agentId, agentId),
          eq(xProcessedPosts.postId, postId)
        )
      );
    return result.length > 0;
  } catch (error) {
    console.error(`Error checking if post is processed: ${error}`);
    return false;
  }
}

export async function saveInsight(
  userId: string,
  agentId: string,
  postId: string,
  insight: ContentInsight
): Promise<string> {
  const insightId = uuidv4();

  await db.insert(xPostInsights).values({
    id: insightId,
    userId,
    agentId,
    postId,
    hasValue: insight.hasValue,
    category: insight.category,
    summary: insight.summary,
    source: insight.source,
    author: insight.username,
    timestamp: insight.timestamp,
  });

  return insightId;
}

// Helper function to ensure user exists in the database
export async function ensureUserExists(userId: string, agentId: string): Promise<void> {
  // Check if user exists
  const existingUser = await db
    .select()
    .from(xUsers)
    .where(eq(xUsers.id, userId));

  if (existingUser.length === 0) {
    // Create new user if doesn't exist
    await db.insert(xUsers).values({
      id: userId,
      username: userId,
      agentId: agentId,
    });

    console.log(`Created new user with ID ${userId} and agentId ${agentId}`);
  }
}

// Save a single post to the database
export async function savePost(post: XPost, agentId: string): Promise<string> {
  try {
    // Try to insert the new post
    const result = await db
      .insert(xPosts)
      .values({
        id: post.id,
        agentId: agentId,
        url: post.url,
        timestamp: post.timestamp,
        text: post.text,
        authorUsername: post.author.username,
        authorDisplayName: post.author.displayName || null,
        replies: post.metrics.replies,
        retweets: post.metrics.retweets,
        likes: post.metrics.likes,
        views: post.metrics.views,
      })
      .onConflictDoUpdate({
        target: xPosts.id,
        set: {
          agentId: agentId,
          url: post.url,
          timestamp: post.timestamp,
          text: post.text,
          authorUsername: post.author.username,
          authorDisplayName: post.author.displayName || null,
          replies: post.metrics.replies,
          retweets: post.metrics.retweets,
          likes: post.metrics.likes,
          views: post.metrics.views,
        },
      });

    return post.id;
  } catch (error) {
    console.error(`Error saving post: ${error}`);
    throw error;
  }
}

// Fetch posts for a specific user
export async function getPostsForFollowing(
  username: string,
  agentId: string
): Promise<XPost[]> {
  const followingPosts = await db
    .select()
    .from(xPosts)
    .where(and(
      eq(xPosts.authorUsername, username),
      eq(xPosts.agentId, agentId)
    ));

  // Convert raw DB data to XPost format
  return followingPosts.map((post) => ({
    id: post.id,
    url: post.url || null,
    timestamp: post.timestamp || null,
    text: post.text || null,
    author: {
      username: post.authorUsername,
      displayName: post.authorDisplayName || null,
    },
    metrics: {
      replies: post.replies || null,
      retweets: post.retweets || null,
      likes: post.likes || null,
      views: post.views || null,
    },
    agentId: post.agentId,
  }));
}

// Save X cookies to database
export async function saveUserCookies(
  username: string,
  agentId: string,
  cookieData: any[]
): Promise<void> {
  try {
    await db
      .insert(xUserCookies)
      .values({
        username,
        agentId,
        cookieData,
      })
      .onConflictDoUpdate({
        target: xUserCookies.username,
        set: {
          cookieData,
          agentId,
          lastUpdate: new Date(),
        },
      });

    console.log(`Saved cookies for user ${username}`);
  } catch (error) {
    console.error(`Error saving cookies for user ${username}: ${error}`);
    throw error;
  }
}

// Get X cookies from database
export async function getCookiesByUsername(
  username: string,
  agentId?: string
): Promise<Cookie | null> {
  try {
    // If agentId is provided, use it in the query
    const query = agentId 
      ? and(
          eq(xUserCookies.username, username),
          eq(xUserCookies.agentId, agentId)
        )
      : eq(xUserCookies.username, username);
      
    const result = await db
      .select()
      .from(xUserCookies)
      .where(query);

    if (result.length === 0) return null;
    return result[0] as Cookie;
  } catch (error) {
    console.error(`Error fetching cookies for user ${username}: ${error}`);
    return null;
  }
}

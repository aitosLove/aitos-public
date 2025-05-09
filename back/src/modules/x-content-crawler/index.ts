import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import cron from "node-cron";

// Import the XCrawlerModule and related types
import { XCrawlerModule, XCrawlerModuleConfig } from "./xCrawlerModule";
import {
  Following,
  XPost,
  XCookie,
  ContentInsight,
  CrawlerConfig,
} from "./types";

// Import database operations
import { getCookiesByUsername, saveProcessedPost, saveInsight } from "./dbOp";

class XCrawlerManager {
  private agent: Agent;
  private xCrawlerModule: XCrawlerModule;
  private userId: string;
  private isInitialized: boolean = false;

  constructor(agent: Agent, userId: string) {
    this.agent = agent;
    this.userId = userId;
    this.xCrawlerModule = new XCrawlerModule();
  }

  public async getValidXCookies(
    userId: string, 
    options: { 
      logErrors?: boolean;
      logSuccess?: boolean;
    } = { logErrors: true, logSuccess: false }
  ): Promise<any[] | null> {
    try {
      // Fetch cookies from the database
      const cookies = await getCookiesByUsername(userId);
      
      // Validate cookies
      if (!cookies || !cookies.cookieData || !Array.isArray(cookies.cookieData) || cookies.cookieData.length === 0) {
        if (options.logErrors) {
          console.log(`No valid X cookies found in database for user ${userId}`);
        }
        return null;
      }
      
      // Cookies are valid
      const cookieData = cookies.cookieData;
      
      if (options.logSuccess) {
        console.log(`Found ${cookieData.length} X cookies for user ${userId}, last updated: ${cookies.lastUpdate || 'unknown'}`);
      }
      
      return cookieData;
    } catch (error) {
      if (options.logErrors) {
        console.error(`Error retrieving X cookies for user ${userId}:`, error);
      }
      return null;
    }
  }

  async init() {
    console.log(`Initializing XCrawlerManager for user ${this.userId}`);

    // 1. Load cookies from database
    const cookieData = await this.getValidXCookies(this.userId, { logSuccess: true });
  
    if (!cookieData) {
      // Emit an event to notify that authentication is needed
      this.agent.sensing.emitEvent({
        type: "X_AUTH_REQUIRED_EVENT",
        description: "X crawler requires authentication. No cookies found.",
        payload: { userId: this.userId },
        timestamp: Date.now(),
      });
      return false;
    }

    // 3. Initialize the XCrawlerModule
    const initialized = await this.xCrawlerModule.initialize(
      this.userId,
      cookieData
    );

    if (!initialized) {
      console.error("Failed to initialize XCrawlerModule");
      return false;
    }

    this.isInitialized = true;

    // 4. Register event listeners
    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (!this.isInitialized) return;

      if (evt.type === "UPDATE_X_FOLLOWING_EVENT") {
        this.updateFollowingListTask();
      }

      if (evt.type === "UPDATE_X_CONTENT_EVENT") {
        this.updateContentTask();
      }
    });

    // console.log("XCrawlerManager initialized successfully");
    return true;
  }

  // Task: Update following list
  async updateFollowingListTask() {
    console.log(`time${Date.now()} updateXFollowingListTask`);

    if (!this.isInitialized) {
      console.log(
        "Cannot update following list: XCrawlerModule not initialized"
      );
      return;
    }

    try {
      // Directly call the public method to update followings
      console.log(`Updating X following list for user ${this.userId}`);
      
      const followings = await this.xCrawlerModule.updateFollowingList();
      
      console.log(`Updated X following list: ${followings.length} users found`);
      
      // Emit event with the updated followings count
      this.agent.sensing.emitEvent({
        type: "X_FOLLOWING_UPDATED_EVENT",
        description: "X following list has been updated",
        payload: { 
          userId: this.userId,
          followingsCount: followings.length 
        },
        timestamp: Date.now(),
      });
      
      return followings;
    } catch (error) {
      console.error("Failed to update X following list:", error);
      
      // Emit error event
      this.agent.sensing.emitEvent({
        type: "X_ERROR_EVENT",
        description: "Error updating X following list",
        payload: { 
          userId: this.userId,
        },
        timestamp: Date.now(),
      });
      
      return [];
    }
  }

  // Task: Update content
  async updateContentTask() {
    console.log(`time${Date.now()} updateXContentTask`);

    if (!this.isInitialized) {
      console.log("Cannot update X content: XCrawlerModule not initialized");
      return;
    }

      
      console.log(`Updating X content for user ${this.userId}`);
      
      let newPostsCount = 0;
      
      const processedPostsCount = await this.xCrawlerModule.processFollowingContent()
      
      // Process each following
      // for (const following of followings) {
      //   const posts = await this.xCrawlerModule.processFollowingContent(following);
        
      //   for (const post of posts) {
      //     const isAlreadyProcessed = await this.xCrawlerModule.isPostProcessed(post.id);
          
      //     if (isAlreadyProcessed) {
      //       processedPostsCount++;
      //       continue;
      //     }
          
      //     console.log(`Processing new post ${post.id} from @${following.username}`);
      //     newPostsCount++;
          
          
      //     const insight: ContentInsight = {
      //       id: `insight-${post.id}`,
      //       postId: post.id,
      //       type: 'basic',
      //       content: {
      //         summary: `Post from ${following.username}`,
      //         keyTopics: this.extractKeyTopics(post),
      //         sentiment: this.analyzeSentiment(post)
      //       },
      //       createdAt: new Date().toISOString()
      //     };
          
      //     await this.xCrawlerModule.saveInsight(insight);
          
      //     await this.xCrawlerModule.saveProcessedPost(post);
      //   }
        
      //   await new Promise(resolve => setTimeout(resolve, this.randomBetween(2000, 4000)));
      // }
      
      // console.log(`X content update completed: ${newPostsCount} new posts processed, ${processedPostsCount} already processed`);
      
      // Emit event with the results
      this.agent.sensing.emitEvent({
        type: "X_CONTENT_UPDATED_EVENT",
        description: "X content has been updated",
        payload: { 
          userId: this.userId,
          processedPostsCount: processedPostsCount,
        },
        timestamp: Date.now(),
      });
    } 
  

  // Helper method to generate a random number for delays
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Example content analysis methods - replace with your actual implementation
  private extractKeyTopics(post: XPost): string[] {
    // Simple example - you would implement more sophisticated analysis
    const text = post.text || '';
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'and', 'is', 'in', 'to', 'of', 'a', 'for', 'with', 'on', 'at']);
    
    // Extract potential topics (words longer than 4 chars, not common words)
    return [...new Set(
      words.filter(word => word.length > 4 && !commonWords.has(word))
    )].slice(0, 3); // Take top 3 as topics
  }
  
  private analyzeSentiment(post: XPost): string {
    // Simple example - replace with actual sentiment analysis
    const text = post.text || '';
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'disappointed', 'angry'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Clean up resources
  async shutdown() {
    if (this.isInitialized) {
      await this.xCrawlerModule.shutdown();
      this.isInitialized = false;
    }
  }
}

// Module export and event pump
export function enableXCrawlerModule(agent: Agent, userId: string) {
  console.log(`Enabling X crawler module for user ${userId}`);

  const xCrawlerManager = new XCrawlerManager(agent, userId);

  // Initialize the X crawler manager
  xCrawlerManager.init().catch((error) => {
    console.error("Failed to initialize X crawler module:", error);
  });

  // 1. Event pump for updating following list (every 24h)
  // cron.schedule("0 */1 * * * *", async () => {

    cron.schedule("0 0 */24 * * *", async () => {
      console.log("update followings list")
    agent.sensing.emitEvent({
      type: "UPDATE_X_FOLLOWING_EVENT",
      description: "Agent should update the X following list",
      payload: {},
      timestamp: Date.now(),
    });
  });

  // 2. Event pump for updating content (every 30min)
  cron.schedule("0 */30 * * * *", async () => {
    agent.sensing.emitEvent({
      type: "UPDATE_X_CONTENT_EVENT",
      description: "Agent should update X content",
      payload: {},
      timestamp: Date.now(),
    });
  });

  // Return the manager in case it's needed elsewhere
  return xCrawlerManager;
}

// Get cookies
export async function getValidXCookies(
  userId: string, 
  options: { 
    logErrors?: boolean;     
    logSuccess?: boolean;    
  } = { logErrors: true, logSuccess: false }
): Promise<any[] | null> {
  try {
    // Fetch cookies from the database
    const cookies = await getCookiesByUsername(userId);
    
    // Validate cookies
    if (!cookies || !cookies.cookieData || !Array.isArray(cookies.cookieData) || cookies.cookieData.length === 0) {
      if (options.logErrors) {
        console.log(`No valid X cookies found in database for user ${userId}`);
      }
      
      // Try to get cookies from environment variables
      const envCookies = process.env.X_COOKIES ? JSON.parse(process.env.X_COOKIES) : null;
      
      if (envCookies && Array.isArray(envCookies) && envCookies.length > 0) {
        if (options.logSuccess) {
          console.log(`Using ${envCookies.length} X cookies from environment variables for user ${userId}`);
        }
        return envCookies;
      }
      
      return null;
    }
    
    // Cookies are valid
    const cookieData = cookies.cookieData;
    
    if (options.logSuccess) {
      console.log(`Found ${cookieData.length} X cookies for user ${userId}, last updated: ${cookies.lastUpdate || 'unknown'}`);
    }
    
    return cookieData;
  } catch (error) {
    if (options.logErrors) {
      console.error(`Error retrieving X cookies for user ${userId}:`, error);
    }
    
    // Try to get cookies from environment variables on error
    try {
      const envCookies = process.env.X_COOKIES ? JSON.parse(process.env.X_COOKIES) : null;
      
      if (envCookies && Array.isArray(envCookies) && envCookies.length > 0) {
        if (options.logSuccess) {
          console.log(`Using ${envCookies.length} X cookies from environment variables as fallback for user ${userId}`);
        }
        return envCookies;
      }
    } catch (envError) {
      if (options.logErrors) {
        console.error(`Error retrieving X cookies from environment for user ${userId}:`, envError);
      }
    }
    
    return null;
  }
}
// xCrawlerModule.ts - Main module for X content crawling and analysis

import { XCrawler, DEFAULT_CONFIG } from './xcrawler';
import { Following, XPost, XCookie, ContentInsight, CrawlerConfig } from './types';

// Import database operations directly from drizzleClient
import {
  saveFollowings,
  getFollowings,
  saveProcessedPost,
  isPostProcessed,
  saveInsight,
} from './dbOp';

export interface XCrawlerModuleConfig {
  crawler?: Partial<CrawlerConfig>;
}

/**
 * Main module for X content crawling and analysis with separated initialization and task logic
 */
export class XCrawlerModule {
  private crawler: XCrawler;
  private config: XCrawlerModuleConfig;
  private followings: Following[] = [];
  private userId: string = '';
  private agentId: string = '';
  private isInitialized: boolean = false;
  
  constructor(
    config: XCrawlerModuleConfig = {},
  ) {
    this.config = config;
    this.crawler = new XCrawler(config.crawler);
  }
  
  /**
   * Initialize the module for a specific user
   */
  public async initialize(userId: string, cookies: any[], agentId: string): Promise<boolean> {
    this.userId = userId;
    this.agentId = agentId;
    
    try {
      // console.log(`Initializing XCrawlerModule for user ${userId}...`);
      
      // Initialize crawler
      const initialized = await this.crawler.initialize(userId, agentId, cookies);
      
      if (!initialized) {
        throw new Error('Failed to initialize crawler');
      }
      
      // Try to load existing followings from database
      try {
        this.followings = await getFollowings(userId, this.agentId);
        console.log(`Loaded ${this.followings.length} followings from database`);
      } catch (error) {
        console.log(`No existing followings found, will fetch new ones`);
      }
      
      this.isInitialized = true;
      // console.log(`XCrawlerModule initialized for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Failed to initialize XCrawlerModule: ${error}`);
      await this.shutdown();
      return false;
    }
  }

  /**
   * Check if module is initialized
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('XCrawlerModule not initialized');
    }
  }
  
  /**
   * Update the following list
   * This can be called by the parent manager
   */
  public async updateFollowingList(): Promise<Following[]> {
    this.checkInitialized();
    
    console.log('Updating following list...');
    
    try {
      // Get current followings
      const currentFollowings = await this.crawler.getFollowings();
      
      if (currentFollowings.length === 0) {
        console.log('No followings found or error occurred');
        return this.followings;
      }
      
      // Update local followings list
      this.followings = currentFollowings;
      
      // Save to database using drizzleClient function
      await saveFollowings(this.userId, this.agentId, this.followings);
      
      console.log(`Updated following list: ${this.followings.length} users`);
      return this.followings;
    } catch (error) {
      console.error(`Error updating following list: ${error}`);
      return this.followings;
    }
  }
  
  /**
   * Process content from a specific following
   * Returns the posts that were fetched
   */
  public async processFollowingContent(): Promise<Following[]> {
    this.checkInitialized();
    
    const followings = await getFollowings(this.userId, this.agentId);
    try {
      // Pass an array with the single following object
      const updatedFollowings = await this.crawler.processUserForPosts(followings);
      // Get the first (and only) item from the returned array
      return updatedFollowings;
    } catch (error) {
      return [];
    }
  }



  
  /**
   * Shutdown the module and release resources
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down XCrawlerModule...');
    
    // Close the crawler
    if (this.crawler) {
      await this.crawler.close();
    }
    
    this.isInitialized = false;
    console.log('XCrawlerModule shutdown complete');
  }
  
  /**
   * Get current status of the module
   */
  public getStatus(): {
    initialized: boolean;
    userId: string;
    followingsCount: number;
  } {
    return {
      initialized: this.isInitialized,
      userId: this.userId,
      followingsCount: this.followings.length
    };
  }
}
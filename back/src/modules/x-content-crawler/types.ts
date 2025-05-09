// types.ts - Core data structures for X (Twitter) crawler

/**
 * Represents a user on X
 */
export interface XUser {
    username: string;
    displayName: string | null;
    url: string | null;
  }
  
  /**
   * Extended user with posts
   */
  export interface Following extends XUser {
    posts: XPost[];
    postsCollected: number;
    lastUpdate: Date | null;
    error: string | null;
  }
  
  /**
   * X post structure
   */
  export interface XPost {
    id: string;
    url: string | null;
    timestamp: string | null;
    text: string | null;
    author: {
      username: string;
      displayName: string | null;
    };
    metrics: {
      replies: number | null;
      retweets: number | null;
      likes: number | null;
      views: number | null;
    };
  }
  
export type BrowserElement = Element | null;


  /**
   * Configuration for the crawler
   */
  export interface CrawlerConfig {
    // Target user to fetch followings from
    target: {
      username: string;
    };
    
    // Content collection limits
    limits: {
      maxPostsPerUser: number;
      maxFollowingsToProcess: number;
      maxScrollAttempts: number;
      maxFollowings:number;
      minHoursBetweenUpdates:number;
    };
    
    // Update intervals (in milliseconds)
    intervals: {
      followingUpdate: number; // How often to update following list
      contentFetch: number;    // How often to fetch content from each following
    };
    
    // Browser settings
    browser: {
      headless: boolean;
      slowMo?: number;
    };
  }
  
  /**
   * X authentication cookies
   */
  export interface XCookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expirationDate?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  }
  
  /**
   * Insight extracted from content
   */
  export interface ContentInsight {
    postId: string;
    postUrl: string | null;
    author: string;
    timestamp: string | null;
    originalText: string | null;
    insightSummary: string;
    insightType: 'crypto_trading' | 'crypto_project' | 'crypto_general';
    confidence: number;
  }


  
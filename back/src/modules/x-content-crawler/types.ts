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
      displayName?: string | null;
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
    hasValue: boolean;
    category: 'trading_idea' | 'project_intro' | 'market_insight' | 'none';
    // keyDetails: string[];
    summary: string;
    source: string;
    username: string;
    timestamp: string;
    entity: Entity;
    event: Event;
  }

  


  export interface XPostPayload {
  userId: string;
  post_content: string;
  authorUsername: string;
  url?: string;
  timestamp?: string;
}


export interface Entity {
  name: string;
  context: string;
}
export interface Event {
  name: string;
  details: string;
}


 
interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  citation_tokens: number;
  num_search_queries: number;
}

/**
 * Message in the Perplexity API response
 */
interface PerplexityMessage {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

/**
 * Delta in Perplexity API response (for streaming)
 */
interface PerplexityDelta {
  role?: 'assistant';
  content: string;
}

/**
 * Choice in Perplexity API response
 */
interface PerplexityChoice {
  index: number;
  finish_reason: 'stop' | 'length' | 'content_filter';
  message: PerplexityMessage;
  delta?: PerplexityDelta;
}

/**
 * Raw Perplexity API response
 */
export interface PerplexityApiResponse {
  id: string;
  model: string;
  created: number;
  usage: PerplexityUsage;
  citations: string[];
  object: string;
  choices: PerplexityChoice[];
}

/**
 * Citation source with formatted title
 */
interface FormattedCitation {
  url: string;
  title: string;
}

/**
 * Metadata about the content insight that triggered the search
 */
interface RelatedContent {
  contentId: string;
  username: string;
  category: string;
}

/**
 * Structured search result returned by usePerplexitySearch
 */
export interface PerplexitySearchResult {
  query: string;
  response: string;
  citations: FormattedCitation[];
  metadata: {
    model: string;
    usage: PerplexityUsage;
    timestamp: string;
  };
  relatedTo: RelatedContent;
  rawResponse?: PerplexityApiResponse; // Optional raw response for debugging
}

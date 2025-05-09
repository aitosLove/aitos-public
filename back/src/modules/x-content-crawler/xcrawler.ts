// xcrawler.ts - Enhanced X content crawler implementation

import { Browser, BrowserContext, Page, chromium } from "playwright";
import {
  XUser,
  Following,
  XPost,
  CrawlerConfig,
  XCookie,
  BrowserElement,
} from "./types";
import { savePost, storeCookies, updateFollowingLastUpdated } from "./dbOp";

// Default configuration
export const DEFAULT_CONFIG: CrawlerConfig = {
  target: {
    username: "",
  },

  limits: {
    maxPostsPerUser: 10,
    maxFollowingsToProcess: 5, // Limit to 5 each time
    maxScrollAttempts: 5,
    maxFollowings: 250,
    minHoursBetweenUpdates: 12, // Minimum hours between updates
  },

  intervals: {
    followingUpdate: 24 * 60 * 60 * 1000, // Once per day
    contentFetch: 60 * 60 * 1000, // Once per hour
  },

  browser: {
    headless: true,
    slowMo: 5,
  },
};

// Enhanced selectors for X (Twitter) elements
const SELECTORS = {
  // User related selectors
  user: {
    cell: '[data-testid="UserCell"]',
    name: '[data-testid="User-Name"] span',
    username: '[data-testid="UserName"]',
    bio: '[data-testid="UserDescription"]',
    profileImage: '[data-testid="UserAvatar-Container"]',
  },

  // Post related selectors with enhanced metrics detection
  post: {
    // Main containers
    // container: '[data-testid="cellInnerDiv"]',
    tweet: '[data-testid="tweet"]',
    article: "article",
    tweetWrapper: '[data-testid="tweetText"]',

    // Text content selectors
    tweetText: '[data-testid="tweetText"]',
    paragraphs: 'div[dir="auto"] > span',
    textContent: 'div[dir="auto"]',

    // Link and metadata selectors
    tweetLink: 'a[href*="/status/"]',
    timestamp: "time",

    // Enhanced metric selectors with view count support
    metrics: {
      reply: '[data-testid="reply"]',
      retweet: '[data-testid="retweet"]',
      like: '[data-testid="like"]',
      // Enhanced analytics detection with multiple fallbacks
      analytics: [
        'a[href$="/analytics"]', // Direct href match
        '[data-testid="analytics"]', // Test ID fallback
        '[aria-label*="analytics" i]', // Case-insensitive aria label
        '[role="link"][href*="/analytics"]', // Role-based selector
      ].join(","),

      // New view count detection with multiple strategies
      viewCount: {
        container: '[data-testid="app-text-transition-container"]', // Container element
        text: "span", // Actual number element
        // Combined selector for direct access
        combined: '[data-testid="app-text-transition-container"] span',
        // Alternative detection through analytics link
        viaAnalytics: 'a[href$="/analytics"] > div > div > span',
      },

      // Enhanced alternative metrics with aria-label specificity
      replyAlt: '[aria-label*="repl" i]', // Case-insensitive partial match
      retweetAlt: '[aria-label*="retweet" i]',
      likeAlt: '[aria-label*="like" i]',
      viewCountAlt: '[aria-label*="view count" i] span', // Direct alt view count
    },
  },

  // Expanded content selectors with improved specificity
  expandContent: {
    showMore: 'div[role="button"]:has-text("Show more")',
    showThread: [
      'div[role="button"]:has-text("Show this thread")',
      '[aria-label="Show this thread"]',
    ].join(","),
    readMore: 'span:has-text("Read more")',
    seeMore: 'div[role="button"]:has-text("more"):not(:has-text("Show more"))',
  },
};

// Timeouts
const TIMEOUTS = {
  navigation: 30000,
  element: 5000,
  scroll: 2000,
};

/**
 * Core crawler for X content with enhanced robustness
 */
export class XCrawler {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: CrawlerConfig;
  private cookies: XCookie[] = [];
  private isInitialized: boolean = false;
  private userId: string = "";

  constructor(config?: Partial<CrawlerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the crawler with cookies
   */
  public async initialize(
    userId: string,
    cookies: XCookie[]
  ): Promise<boolean> {
    try {
      this.cookies = cookies;
      this.userId = userId;
      // Launch browser
      this.browser = await chromium.launch({
        headless: this.config.browser.headless,
        slowMo: this.config.browser.slowMo,
      });

      this.context = await this.browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 },
      });

      // Set cookies for authentication
      await this.context.addCookies(this.cookies);

      this.page = await this.context.newPage();
      this.isInitialized = true;

      // console.log('XCrawler initialized successfully');
      return true;
    } catch (error) {
      console.error(`Failed to initialize XCrawler: ${error}`);
      await this.close();
      return false;
    }
  }

  /**
   * Close browser and clean up resources
   */
  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.isInitialized = false;
    }
  }

  public async fetchCookies(): Promise<any[]> {
    if (!this.isInitialized || !this.page) {
      throw new Error("Crawler not initialized");
    }

    try {
      // Get cookies from the page
      const pageCookies = await this.page.context().cookies();
      console.log(`Fetched ${pageCookies.length} cookies`);
      return pageCookies;
    } catch (error) {
      console.error(`Error fetching cookies: ${error}`);
      return [];
    }
  }

  /**
   * Get following list for the target user
   */
  public async getFollowings(): Promise<Following[]> {
    if (!this.isInitialized || !this.page) {
      throw new Error("Crawler not initialized");
    }

    console.log(`Extracting following list for @${this.userId}...`);

    try {
      // Navigate to following page
      await this.page.goto(`https://x.com/${this.userId}/following`, {
        timeout: TIMEOUTS.navigation,
      });

      // Wait for user cells to load
      await this.page.waitForSelector(SELECTORS.user.cell, {
        timeout: TIMEOUTS.element,
      });

      // Track all found users during scrolling
      const allFoundUsers = new Map<string, XUser>();
      let previousCount = 0;
      let noChangeCounter = 0;
      const maxNoChangeAttempts = 3;

      while (noChangeCounter < maxNoChangeAttempts) {
        // Extract current followings
        const currentBatch = await this.extractFollowings();

        // Add all users with valid userIds to our collection
        let validUsersInBatch = 0;
        for (const user of currentBatch) {
          if (user.username) {
            allFoundUsers.set(user.username, user);
            validUsersInBatch++;
          }
        }

        const currentTotal = allFoundUsers.size;
        // console.log(`Scroll attempt: Found ${validUsersInBatch} valid users in current view, ${currentTotal} total (previous: ${previousCount})`);

        if (currentTotal > previousCount) {
          // We found new users, reset counter
          noChangeCounter = 0;
          previousCount = currentTotal;

          // Scroll to bottom
          await this.page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
          );
          await this.page.waitForTimeout(randomBetween(2000, 3000));
        } else {
          // No new users found
          noChangeCounter++;
          // console.log(`No new followings found (attempt ${noChangeCounter}/${maxNoChangeAttempts})`);

          // Try a different scroll pattern
          await this.page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
          );
          await this.page.waitForTimeout(randomBetween(2500, 3500));
        }

        // Break if we've reached the configured limit
        if (currentTotal >= this.config.limits.maxFollowings) {
          // console.log(`Reached configured limit of ${this.config.limits.maxFollowings} followings`);
          break;
        }
      }

      // Convert our map of users to an array
      const followingsList = Array.from(allFoundUsers.values());
      console.log(`Total followings collected: ${followingsList.length}`);

      // Convert to Following objects - keep any user with a userId
      const followings: Following[] = followingsList.map((user) => ({
        ...user,
        posts: [],
        postsCollected: 0,
        error: null,
        lastUpdate: null,
      }));

      // Fetch and store cookies
      const cookies = await this.page.context().cookies();
      if (cookies.length > 0 && this.userId) {
        await storeCookies(this.userId, cookies);
      }

      return followings;
    } catch (error) {
      console.error(
        `Error getting followings: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * Extract followings from the current page with improved robustness
   */
  private async extractFollowings(): Promise<XUser[]> {
    if (!this.page) {
      return [];
    }

    return this.page.$$eval(SELECTORS.user.cell, (cells) => {
      return cells
        .map((cell) => {
          // Try multiple approaches to extract username
          const linkElement = cell.querySelector("a");
          const href = linkElement?.getAttribute("href") || "";
          const usernameFromHref = href.substring(1);

          const nameElement = cell.querySelector(
            '[data-testid="User-Name"] span'
          );
          const displayName = nameElement?.textContent?.trim() || null;

          // First approach: extract from href
          if (usernameFromHref) {
            return {
              username: usernameFromHref,
              displayName,
              url: `https://x.com/${usernameFromHref}`,
            };
          }

          // Second approach: extract from UserName element
          const usernameElement = cell.querySelector(
            '[data-testid="UserName"]'
          );
          if (usernameElement) {
            const usernameText = usernameElement.textContent || "";
            const match = usernameText.match(/@(\w+)/);

            if (match && match[1]) {
              return {
                username: match[1],
                displayName,
                url: `https://x.com/${match[1]}`,
              };
            }
          }

          // Third approach: try to find any element with @ username format
          const allElements = cell.querySelectorAll("span");
          for (const el of allElements) {
            const text = el.textContent || "";
            const match = text.match(/@(\w+)/);
            if (match && match[1]) {
              return {
                username: match[1],
                displayName,
                url: `https://x.com/${match[1]}`,
              };
            }
          }

          return null;
        })
        .filter(Boolean) as XUser[];
    });
  }

  /**
   * Process a batch users to collect their posts with enhanced robustness
   */
  public async processUserForPosts(
    followings: Following[]
  ): Promise<Following[]> {
    if (!this.isInitialized || !this.page) {
      throw new Error("Crawler not initialized");
    }
  
    // Get the minimum hours between updates from config, default to 24 if not specified
    const minHoursBetweenUpdates = DEFAULT_CONFIG.limits.minHoursBetweenUpdates || 24;
    
    // Filter followings that haven't been updated recently enough
    const now = new Date();
    const filteredFollowings = followings.filter((following) => {
      // Include if never updated
      if (!following.lastUpdate){
        // console.log(`No lastUpdate for ${following.username}, including for update`);
        return true;
      } 
  
      try {
        // Parse the date safely
        const lastUpdateDate = new Date(following.lastUpdate);
        
        // Validate the date is valid
        if (isNaN(lastUpdateDate.getTime())) {
          console.warn(`Invalid lastUpdate date for ${following.username}: ${following.lastUpdate}`);
          return true; // Include accounts with invalid dates to fix them
        }
        
        const hoursSinceUpdate =
          (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
        console.log(hoursSinceUpdate)
          
        return hoursSinceUpdate >= minHoursBetweenUpdates;
      } catch (error) {
        console.warn(`Error calculating time gap for ${following.username}:`, error);
        return true; // Include in case of errors to fix the data
      }
    });
  
    console.log(
      `Processing ${filteredFollowings.length} followings due for update (of ${followings.length} total)`
    );
  
    // Sort followings by lastUpdate date (oldest first or null first)
    const sortedFollowings = [...filteredFollowings].sort((a, b) => {
      if (!a.lastUpdate) return -1; // Nulls first
      if (!b.lastUpdate) return 1;
      return new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
    });
  
    // Limit the number of followings to process
    const maxToProcess = DEFAULT_CONFIG.limits.maxFollowingsToProcess;
    const followingsToProcess = sortedFollowings.slice(0, maxToProcess);
  
    // Process each following in sequence and collect results
    const updatedFollowings: Following[] = [];
  
    for (const following of followingsToProcess) {
      try {
        const updated = await this.processSingleFollowing(following);
        updatedFollowings.push(updated);
      } catch (error) {
        console.error(`Failed to process ${following.username}:`, error);
        // Add the following with error information
        updatedFollowings.push({
          ...following,
          error: String(error),
          lastUpdate: new Date(), // Still update the lastUpdate even on error
        });
      }
    }
  
    return updatedFollowings;
  }

  public async processSingleFollowing(
    following: Following
  ): Promise<Following> {
    if (!this.isInitialized || !this.page) {
      throw new Error("Crawler not initialized");
    }

    console.log(`Visiting @${following.username}'s profile...`);

    try {
      // Navigate to the profile
      await this.page.goto(`https://x.com/${following.username}`, {
        timeout: TIMEOUTS.navigation,
      });

      // Check for accessibility issues first
      const pageContent = await this.page.content();
      const inaccessible =
        pageContent.includes("These posts are protected") ||
        pageContent.includes("Account suspended") ||
        pageContent.includes("This account doesn't exist");

      if (inaccessible) {
        return {
          ...following,
          posts: [],
          postsCollected: 0,
          error: "Account not accessible",
          lastUpdate: new Date(),
        };
      }

      await updateFollowingLastUpdated(this.userId, following.username);

      // Wait for any post content to appear
      try {
        await Promise.race([
          this.page.waitForSelector(SELECTORS.post.tweetWrapper, {
            timeout: TIMEOUTS.element,
          }),
          this.page.waitForSelector(SELECTORS.post.tweet, {
            timeout: TIMEOUTS.element,
          }),
          this.page.waitForSelector(SELECTORS.post.article, {
            timeout: TIMEOUTS.element,
          }),
          this.page.waitForSelector(SELECTORS.post.tweetText, {
            timeout: TIMEOUTS.element,
          }),
        ]);
      } catch (error) {
        // No posts found or timeout
        return {
          ...following,
          posts: [],
          postsCollected: 0,
          error: "No posts found",
          lastUpdate: new Date(),
        };
      }

      // Simple scroll to load more content
      await this.page.evaluate(() => window.scrollBy(0, 800));
      await this.page.waitForTimeout(2000);

      // Collect posts
      const posts = await this.collectPosts(following.username);

      return {
        ...following,
        posts,
        postsCollected: posts.length,
        error: null,
        lastUpdate: new Date(),
      };
    } catch (error) {
      return {
        ...following,
        posts: [],
        postsCollected: 0,
        error: String(error),
        lastUpdate: new Date(),
      };
    }
  }

  /**
   * Extract visible posts using multiple strategies for enhanced robustness
   */
  private async extractVisiblePosts(username: string): Promise<XPost[]> {
    if (!this.page) {
      return [];
    }

    try {
      const posts: XPost[] = [];
      const processedIds = new Set<string>();

      // Strategy 1: Find posts by container elements
      const containers = await this.page.$$(SELECTORS.post.tweetWrapper);
      console.log(`Strategy 1: Found ${containers.length} post containers`);

      for (const container of containers) {
        try {
          const postData = await this.extractPostDataFromContainer(
            container,
            username
          );
          if (postData && !processedIds.has(postData.id)) {
            processedIds.add(postData.id);
            posts.push(postData);
          }
        } catch (error) {
          // Continue to next container
          console.log(`Error processing container: ${error}`);
        }
      }

      // Strategy 2: Find posts by data-testid="tweet" elements
      const tweetElements = await this.page.$$(SELECTORS.post.tweet);
      console.log(`Strategy 2: Found ${tweetElements.length} tweet elements`);

      for (const tweetElement of tweetElements) {
        try {
          const postData = await this.extractPostDataFromTweetElement(
            tweetElement,
            username
          );
          if (postData && !processedIds.has(postData.id)) {
            processedIds.add(postData.id);
            posts.push(postData);
          }
        } catch (error) {
          // Continue to next element
          console.log(`Error processing tweet element: ${error}`);
        }
      }

      // Strategy 3: Find posts by article elements
      // const articleElements = await this.page.$$(SELECTORS.post.article);
      // console.log(
      //   `Strategy 3: Found ${articleElements.length} article elements`
      // );

      // for (const articleElement of articleElements) {
      //   try {
      //     const postData = await this.extractPostDataFromArticle(
      //       articleElement,
      //       username
      //     );
      //     if (postData && !processedIds.has(postData.id)) {
      //       processedIds.add(postData.id);
      //       posts.push(postData);
      //     }
      //   } catch (error) {
      //     // Continue to next article
      //     console.log(`Error processing article: ${error}`);
      //   }
      // }

      // Strategy 4: Direct text extraction (fallback)
      // if (posts.length === 0) {
      //   console.log(`Applying fallback strategy to extract tweets`);
      //   const fallbackPosts = await this.extractFallbackPosts(username);
      //   for (const post of fallbackPosts) {
      //     if (!processedIds.has(post.id)) {
      //       processedIds.add(post.id);
      //       posts.push(post);
      //     }
      //   }
      // }

      console.log(`Total extracted posts: ${posts.length}`);
      return posts;
    } catch (error) {
      console.error(`Error extracting posts: ${error}`);
      return [];
    }
  }

  /**
   * Extract text from an element using multiple selectors for robustness
   */
  private async extractTextFromElement(element: any): Promise<string | null> {
    try {
      // Try primary selector
      const tweetTextElement = await element.$(SELECTORS.post.tweetText);
      if (tweetTextElement) {
        const text = await tweetTextElement.textContent();
        if (text) return text.trim();
      }

      // Try alternative selectors
      const textContentElement = await element.$(SELECTORS.post.textContent);
      if (textContentElement) {
        const text = await textContentElement.textContent();
        if (text) return text.trim();
      }

      // Try paragraphs
      const paragraphs = await element.$$(SELECTORS.post.paragraphs);
      if (paragraphs.length > 0) {
        let combinedText = "";
        for (const p of paragraphs) {
          const text = await p.textContent();
          if (text) combinedText += text + " ";
        }
        if (combinedText.trim()) return combinedText.trim();
      }

      // Try generic div with dir="auto" (common for tweet text)
      const dirAutoElements = await element.$$('div[dir="auto"]');
      for (const dirElement of dirAutoElements) {
        const text = await dirElement.textContent();
        if (text && text.length > 10) {
          // Arbitrary threshold to filter out small UI text
          return text.trim();
        }
      }

      // Last resort: find any element with substantial text
      const anyText = await element.evaluate((el: any) => {
        // Get all text nodes within the element
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        let text = "";

        while ((node = walker.nextNode())) {
          if (node.textContent && node.textContent.trim().length > 0) {
            text += " " + node.textContent.trim();
          }
        }

        return text.trim();
      });

      return anyText && anyText.length > 0 ? anyText : null;
    } catch (error) {
      console.error(`Error extracting text: ${error}`);
      return null;
    }
  }

  /**
   * Extract post data from a container element with improved robustness
   */
  private async extractPostDataFromContainer(
    container: any,
    username: string
  ): Promise<XPost | null> {
    try {
      // Extract post ID and URL from link
      const linkElement = await container.$(SELECTORS.post.tweetLink);
      let id = "unknown-" + Math.random().toString(36).substring(2, 10);
      let url = null;

      if (linkElement) {
        const href = await linkElement.getAttribute("href");
        if (href) {
          const idMatch = href.match(/\/status\/(\d+)/);
          if (idMatch) {
            id = idMatch[1];
            url = `https://x.com${href}`;
          }
        }
      }

      // Extract post text using multiple selectors
      let text = await this.extractTextFromElement(container);

      // Return null if no text and unknown ID - likely not a valid post
      if (!text && id.startsWith("unknown-")) {
        return null;
      }

      // Extract timestamp
      const timeElement = await container.$(SELECTORS.post.timestamp);
      let timestamp = null;

      if (timeElement) {
        timestamp = await timeElement.getAttribute("datetime");
      }

      // Extract metrics
      const metrics = await this.extractMetrics(container);

      // Return the complete post object
      return {
        id,
        url,
        timestamp,
        text: text || "", // Use empty string if text is null
        author: {
          username,
          displayName: null,
        },
        metrics,
      };
    } catch (error) {
      console.error(`Error extracting post data: ${error}`);
      return null;
    }
  }

  /**
   * Extract post data from a tweet element
   */
  private async extractPostDataFromTweetElement(
    tweetElement: any,
    username: string
  ): Promise<XPost | null> {
    try {
      // Extract text first - this is the most important part
      const text = await this.extractTextFromElement(tweetElement);

      if (!text) {
        // If no text, check if it has any content at all
        const hasContent = await tweetElement.evaluate(
          (el: any) => el.textContent.trim().length > 0
        );
        if (!hasContent) return null;
      }

      // Extract URL and ID
      const linkElement = await tweetElement.$(SELECTORS.post.tweetLink);
      let id = "unknown-" + Math.random().toString(36).substring(2, 10); // Generate a random ID as fallback
      let url = null;

      if (linkElement) {
        const href = await linkElement.getAttribute("href");
        if (href) {
          const idMatch = href.match(/\/status\/(\d+)/);
          if (idMatch) {
            id = idMatch[1];
            url = `https://x.com${href}`;
          }
        }
      }

      // Extract timestamp
      const timeElement = await tweetElement.$(SELECTORS.post.timestamp);
      let timestamp = null;

      if (timeElement) {
        timestamp = await timeElement.getAttribute("datetime");
      }

      // Extract metrics
      const metrics = await this.extractMetrics(tweetElement);

      // Return the post
      return {
        id,
        url,
        timestamp,
        text: text || "", // Use empty string if text is null
        author: {
          username,
          displayName: null,
        },
        metrics,
      };
    } catch (error) {
      console.error(`Error extracting tweet element data: ${error}`);
      return null;
    }
  }

  /**
   * Extract post data from an article element
   */
  private async extractPostDataFromArticle(
    articleElement: any,
    username: string
  ): Promise<XPost | null> {
    try {
      // Extract text
      const text = await this.extractTextFromElement(articleElement);

      // Extract URL and ID
      const linkElement = await articleElement.$(SELECTORS.post.tweetLink);
      let id = "unknown-" + Math.random().toString(36).substring(2, 10);
      let url = null;

      if (linkElement) {
        const href = await linkElement.getAttribute("href");
        if (href) {
          const idMatch = href.match(/\/status\/(\d+)/);
          if (idMatch) {
            id = idMatch[1];
            url = `https://x.com${href}`;
          }
        }
      }

      // If we have no text and no ID, skip this article as it's likely not a tweet
      if (!text && id.startsWith("unknown-")) {
        return null;
      }

      // Extract timestamp
      const timeElement = await articleElement.$(SELECTORS.post.timestamp);
      let timestamp = null;

      if (timeElement) {
        timestamp = await timeElement.getAttribute("datetime");
      }

      // Extract metrics
      const metrics = await this.extractMetrics(articleElement);

      // Return the post
      return {
        id,
        url,
        timestamp,
        text: text || "", // Use empty string if text is null
        author: {
          username,
          displayName: null,
        },
        metrics,
      };
    } catch (error) {
      console.error(`Error extracting article data: ${error}`);
      return null;
    }
  }

  /**
   * Extract posts using fallback approach (direct page evaluation)
   */
  private async extractFallbackPosts(username: string): Promise<XPost[]> {
    if (!this.page) {
      return [];
    }

    try {
      // Use page evaluation to find all potential tweet text directly
      return await this.page.evaluate((usernameParam: string) => {
        const posts: Array<{
          id: string;
          url: string | null;
          timestamp: string | null;
          text: string;
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
        }> = [];
        const processedIds = new Set<string>();

        // Helper function to extract text from element
        const extractText = (element: Element): string => {
          return element.textContent?.trim() || "";
        };

        // Find all potential tweet texts using multiple strategies
        // Strategy 1: Find text in div[dir="auto"] elements
        const tweetTexts = Array.from(
          document.querySelectorAll('div[dir="auto"]')
        ).filter((el) => {
          const text = extractText(el);
          // Filter out short texts and UI elements
          return (
            text.length > 20 &&
            !text.includes("Follow") &&
            !text.includes("Log in")
          );
        });

        // Process found text elements
        tweetTexts.forEach((textElement, index) => {
          // Look for a parent that might be a tweet container
          let parent = textElement.parentElement;
          let container = null;
          let depth = 0;
          const maxDepth = 6;

          // Traverse up to find a possible container
          while (parent && depth < maxDepth) {
            if (
              parent.querySelector('a[href*="/status/"]') ||
              parent.matches("article") ||
              parent.getAttribute("data-testid") === "tweet" ||
              parent.getAttribute("data-testid") === "cellInnerDiv"
            ) {
              container = parent;
              break;
            }
            parent = parent.parentElement;
            depth++;
          }

          let id = `unknown-${index}`;
          let url = null;

          // If we found a container with a status link, extract the ID
          if (container) {
            const linkEl = container.querySelector('a[href*="/status/"]');
            if (linkEl && linkEl.getAttribute("href")) {
              const href = linkEl.getAttribute("href");
              if (href) {
                const match = href.match(/\/status\/(\d+)/);
                if (match) {
                  id = match[1];
                  url = `https://x.com${href}`;
                }
              }
            }
          }

          // Skip if we've already processed this ID
          if (processedIds.has(id)) {
            return;
          }

          processedIds.add(id);

          // Extract timestamp if available
          let timestamp = null;
          if (container) {
            const timeEl = container.querySelector("time");
            if (timeEl) {
              timestamp = timeEl.getAttribute("datetime");
            }
          }

          // Create post object
          posts.push({
            id,
            url,
            timestamp,
            text: extractText(textElement),
            author: {
              username: usernameParam,
              displayName: null,
            },
            metrics: {
              replies: null,
              retweets: null,
              likes: null,
              views: null,
            },
          });
        });

        return posts;
      }, username);
    } catch (error) {
      console.error(`Error in fallback extraction: ${error}`);
      return [];
    }
  }

  /**
   * Extract metrics using multiple strategies
   */
  private async extractMetrics(element: any): Promise<{
    replies: number | null;
    retweets: number | null;
    likes: number | null;
    views: number | null;
  }> {
    const metrics: {
      replies: number | null;
      retweets: number | null;
      likes: number | null;
      views: number | null;
    } = {
      replies: null,
      retweets: null,
      likes: null,
      views: null,
    };

    try {
      // Try primary selectors
      metrics.replies = await this.getMetricCount(
        element,
        SELECTORS.post.metrics.reply
      );
      metrics.retweets = await this.getMetricCount(
        element,
        SELECTORS.post.metrics.retweet
      );
      metrics.likes = await this.getMetricCount(
        element,
        SELECTORS.post.metrics.like
      );
      metrics.views = await this.getMetricCount(
        element,
        SELECTORS.post.metrics.analytics
      );

      // If primary selectors failed, try alternative selectors
      if (metrics.replies === null) {
        metrics.replies = await this.getMetricCount(
          element,
          SELECTORS.post.metrics.replyAlt
        );
      }

      if (metrics.retweets === null) {
        metrics.retweets = await this.getMetricCount(
          element,
          SELECTORS.post.metrics.retweetAlt
        );
      }

      if (metrics.likes === null) {
        metrics.likes = await this.getMetricCount(
          element,
          SELECTORS.post.metrics.likeAlt
        );
      }

      if (metrics.views === null) {
        metrics.views = await this.getMetricCount(
          element,
          SELECTORS.post.metrics.viewCount.viaAnalytics
        );
      }

      // Try finding metrics by aria-label (third strategy)
      if (
        metrics.replies === null ||
        metrics.retweets === null ||
        metrics.likes === null ||
        metrics.views === null
      ) {
        await this.extractMetricsByAriaLabel(element, metrics);
      }

      return metrics;
    } catch (error) {
      console.error(`Error extracting metrics: ${error}`);
      return metrics;
    }
  }

  /**
   * Extract metrics by aria-label attributes
   */
  private async extractMetricsByAriaLabel(
    element: any,
    metrics: any
  ): Promise<void> {
    try {
      const ariaLabeledElements = await element.$$("[aria-label]");

      for (const ariaElement of ariaLabeledElements) {
        const ariaLabel = await ariaElement.getAttribute("aria-label");

        if (!ariaLabel) continue;

        // Check for replies
        if (
          metrics.replies === null &&
          (ariaLabel.includes("repl") || ariaLabel.includes("comment"))
        ) {
          metrics.replies = await this.extractNumberFromAriaLabel(ariaLabel);
        }

        // Check for retweets
        if (
          metrics.retweets === null &&
          (ariaLabel.includes("retweet") || ariaLabel.includes("Repost"))
        ) {
          metrics.retweets = await this.extractNumberFromAriaLabel(ariaLabel);
        }

        // Check for likes
        if (
          metrics.likes === null &&
          (ariaLabel.includes("like") || ariaLabel.includes("Love"))
        ) {
          metrics.likes = await this.extractNumberFromAriaLabel(ariaLabel);
        }

        // Check for views
        if (
          metrics.views === null &&
          (ariaLabel.includes("view") || ariaLabel.includes("impression"))
        ) {
          metrics.views = await this.extractNumberFromAriaLabel(ariaLabel);
        }
      }
    } catch (error) {
      console.error(`Error extracting metrics by aria-label: ${error}`);
    }
  }

  /**
   * Extract number from aria-label text
   */
  private async extractNumberFromAriaLabel(
    ariaLabel: string
  ): Promise<number | null> {
    const matches = ariaLabel.match(/(\d+(?:[,.]\d+)?[KkMmBb]?)/);

    if (!matches || !matches[1]) return null;

    let numStr = matches[1];
    let multiplier = 1;

    if (numStr.endsWith("k") || numStr.endsWith("K")) {
      multiplier = 1000;
      numStr = numStr.slice(0, -1);
    } else if (numStr.endsWith("m") || numStr.endsWith("M")) {
      multiplier = 1000000;
      numStr = numStr.slice(0, -1);
    } else if (numStr.endsWith("b") || numStr.endsWith("B")) {
      multiplier = 1000000000;
      numStr = numStr.slice(0, -1);
    }

    const num = parseFloat(numStr.replace(",", "."));
    return isNaN(num) ? null : num * multiplier;
  }

  /**
   * Get metric count from an element
   */
  private async getMetricCount(
    element: any,
    selector: string
  ): Promise<number | null> {
    try {
      const metricElement = await element.$(selector);
      if (!metricElement) return null;

      // Find the count element inside the metric element
      const countElement = await metricElement.$(
        'span[data-testid="app-text-transition-container"]'
      );
      if (!countElement) {
        // Try alternative approach
        return await metricElement.evaluate((el: Element) => {
          const text = el.textContent?.trim() || "";
          if (!text || text === "0") return 0;

          // Parse numeric value
          const numericMatch = text.match(/(\d+(?:[,.]\d+)?[KkMmBb]?)/);
          if (!numericMatch) return null;

          let numStr = numericMatch[1];
          let multiplier = 1;

          if (numStr.endsWith("k") || numStr.endsWith("K")) {
            multiplier = 1000;
            numStr = numStr.slice(0, -1);
          } else if (numStr.endsWith("m") || numStr.endsWith("M")) {
            multiplier = 1000000;
            numStr = numStr.slice(0, -1);
          } else if (numStr.endsWith("b") || numStr.endsWith("B")) {
            multiplier = 1000000000;
            numStr = numStr.slice(0, -1);
          }

          const num = parseFloat(numStr.replace(",", "."));
          return isNaN(num) ? null : num * multiplier;
        });
      }

      const countText = await countElement.textContent();
      if (!countText) return null;

      let numericValue = parseFloat(countText.replace(/[KkMmBb]$/, ""));
      if (countText.endsWith("K") || countText.endsWith("k"))
        return numericValue * 1000;
      if (countText.endsWith("M") || countText.endsWith("m"))
        return numericValue * 1_000_000;
      if (countText.endsWith("B") || countText.endsWith("b"))
        return numericValue * 1_000_000_000;
      return Number.isNaN(numericValue) ? null : numericValue;
    } catch (error) {
      console.error(`Error getting metric count: ${error}`);
      return null;
    }
  }

  /**
   * Collect posts from a user's profile with improved robustness
   */
  private async collectPosts(username: string): Promise<XPost[]> {
    if (!this.page) {
      return [];
    }

    console.log(`Collecting posts from @${username}...`);

    // Initialize post collection
    const allPosts: XPost[] = [];
    const processedIds = new Set<string>();
    let attempts = 0;
    const MAX_ATTEMPTS = 3; // Increased for better collection
    let noNewPostsCount = 0;

    while (
      allPosts.length < this.config.limits.maxPostsPerUser &&
      attempts < MAX_ATTEMPTS &&
      noNewPostsCount < 2
    ) {
      attempts++;
      console.log(`Collection attempt ${attempts}/${MAX_ATTEMPTS}`);

      // Extract all visible posts using multiple strategies
      const visiblePosts = await this.extractVisiblePosts(username);

      // Add new posts to our collection
      let newPostsAdded = 0;
      for (const post of visiblePosts) {
        if (
          !processedIds.has(post.id) &&
          allPosts.length < this.config.limits.maxPostsPerUser
        ) {
          processedIds.add(post.id);
          allPosts.push(post);
          newPostsAdded++;
        }
      }

      console.log(
        `Found ${visiblePosts.length} posts, added ${newPostsAdded} new posts`
      );

      // Check if we're still finding new posts
      if (newPostsAdded === 0) {
        noNewPostsCount++;
      } else {
        noNewPostsCount = 0;
      }

      // Stop if we have enough posts
      if (allPosts.length >= this.config.limits.maxPostsPerUser) {
        break;
      }

      // Scroll down to load more content with randomized behavior for better evasion
      await this.page.evaluate(() => {
        // Redefine randomBetween within the browser context
        const randomBetween = (min: number, max: number) =>
          Math.floor(Math.random() * (max - min + 1)) + min;
        window.scrollBy(0, randomBetween(600, 1000));
      });
      await this.page.waitForTimeout(randomBetween(1500, 3000)); // Randomized wait time

      // Try to expand any "Show more" or "Show thread" buttons
      await this.expandContent();

      // Sometimes wait a bit longer
      if (Math.random() > 0.7) {
        await this.page.waitForTimeout(randomBetween(500, 1500));
      }
    }

    // Save each post to the database
    for (const post of allPosts) {
      try {
        await savePost(post);
      } catch (dbError) {
        console.error(`Error saving post ${post.id}:`, dbError);
        // Continue with the next post even if this one fails
      }
    }

    console.log(`Collected ${allPosts.length} posts from @${username}`);

    // Return only the requested number of posts
    return allPosts.slice(0, this.config.limits.maxPostsPerUser);
  }

  /**
   * Expand content by clicking various buttons that might show more content
   */
  private async expandContent(): Promise<boolean> {
    if (!this.page) {
      return false;
    }

    let expanded = false;

    try {
      // Try to find and click "Show more" buttons
      const showMoreButtons = await this.page.$$(
        SELECTORS.expandContent.showMore
      );
      for (const button of showMoreButtons) {
        await button.click().catch(() => {});
        expanded = true;
      }

      // Try to find and click "Show thread" buttons
      const showThreadButtons = await this.page.$$(
        SELECTORS.expandContent.showThread
      );
      for (const button of showThreadButtons) {
        await button.click().catch(() => {});
        expanded = true;
      }

      // Try to find and click "Read more" buttons
      const readMoreButtons = await this.page.$$(
        SELECTORS.expandContent.readMore
      );
      for (const button of readMoreButtons) {
        await button.click().catch(() => {});
        expanded = true;
      }

      // Try to find any generic "See more" type buttons
      const seeMoreButtons = await this.page.$$(
        SELECTORS.expandContent.seeMore
      );
      for (const button of seeMoreButtons) {
        if (await button.isVisible()) {
          await button.click().catch(() => {});
          expanded = true;
        }
      }

      if (expanded) {
        console.log(`Expanded content by clicking buttons`);
        await this.page.waitForTimeout(randomBetween(800, 1500));
      }
    } catch (error) {
      console.error(`Error expanding content: ${error}`);
    }

    return expanded;
  }
}

/**
 * Helper function to generate a random number within range (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

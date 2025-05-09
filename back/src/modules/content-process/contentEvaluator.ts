// contentEvaluator.ts - Evaluates post content for crypto insights

import { XPost, ContentInsight } from '@/src/modules/x-content-crawler/types';


export interface ChatModelClient {
  evaluateContent: (text: string, prompt: string) => Promise<any>;
}

export class ContentEvaluator {
  private chatModel: ChatModelClient;
  
  constructor(chatModel: ChatModelClient) {
    this.chatModel = chatModel;
  }
  
  /**
   * Evaluate a post for crypto insights
   */
  public async evaluatePost(post: XPost): Promise<ContentInsight | null> {
    if (!post.text || post.text.length < 20) {
      return null; // Skip short posts
    }
    
    try {
      // Prepare the evaluation prompt
      const prompt = `
        Analyze the following social media post for crypto-related insights. 
        Determine if it contains useful information about:
        1. Cryptocurrency trading suggestions
        2. Crypto project introductions
        3. General crypto insights
        
        Return a JSON object with:
        - hasCryptoInsight (boolean): Whether the post has useful crypto info
        - insightType (string): Either "crypto_trading", "crypto_project", or "crypto_general"
        - summary (string): Brief summary of the insight (2-3 sentences)
        - confidence (number): From 0.0 to 1.0, how confident you are in this assessment
        
        Only return insights if confidence is above 0.6.
        
        Post: "${post.text}"
      `;
      
      // Call the chat model API
      const response = await this.chatModel.evaluateContent(post.text, prompt);
      
      // Check if we have a crypto insight with sufficient confidence
      if (response.hasCryptoInsight && response.confidence > 0.6) {
        return {
          postId: post.id,
          postUrl: post.url,
          author: post.author.username,
          timestamp: post.timestamp,
          originalText: post.text,
          insightSummary: response.summary,
          insightType: response.insightType,
          confidence: response.confidence
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error evaluating post ${post.id}: ${error}`);
      return null;
    }
  }
  
  /**
   * Mock implementation for testing - replace with real LLM API in production
   */
  public static createMockClient(): ChatModelClient {
    return {
      evaluateContent: async (text: string, prompt: string): Promise<any> => {
        // Simple keyword-based evaluation
        const cryptoKeywords = [
          'bitcoin', 'eth', 'ethereum', 'crypto', 'blockchain', 'token', 'defi',
          'nft', 'altcoin', 'trading', 'market', 'bull', 'bear', 'wallet'
        ];
        
        const tradingKeywords = ['buy', 'sell', 'long', 'short', 'position', 'entry', 'exit', 'trade'];
        const projectKeywords = ['launch', 'project', 'protocol', 'platform', 'mainnet', 'testnet'];
        
        // Count keyword matches
        const lcText = text.toLowerCase();
        const cryptoMatches = cryptoKeywords.filter(kw => lcText.includes(kw)).length;
        const tradingMatches = tradingKeywords.filter(kw => lcText.includes(kw)).length;
        const projectMatches = projectKeywords.filter(kw => lcText.includes(kw)).length;
        
        // Determine if there's a crypto insight
        const hasCryptoInsight = cryptoMatches >= 2;
        
        // Determine insight type
        let insightType: 'crypto_trading' | 'crypto_project' | 'crypto_general' = 'crypto_general';
        
        if (tradingMatches >= 2) {
          insightType = 'crypto_trading';
        } else if (projectMatches >= 2) {
          insightType = 'crypto_project';
        }
        
        // Calculate confidence score
        const confidence = Math.min(0.5 + 0.1 * cryptoMatches, 0.95);
        
        // Generate a summary
        let summary = '';
        
        if (hasCryptoInsight) {
          if (insightType === 'crypto_trading') {
            summary = `Trading insight: Suggests ${
              lcText.includes('buy') ? 'buying' : lcText.includes('sell') ? 'selling' : 'trading'
            } ${
              lcText.includes('bitcoin') ? 'Bitcoin' : lcText.includes('eth') ? 'Ethereum' : 'crypto assets'
            }.`;
          } else if (insightType === 'crypto_project') {
            summary = `Project info: Mentions a ${
              lcText.includes('launch') ? 'launch' : 'development'
            } related to a ${
              lcText.includes('protocol') ? 'protocol' : 'project'
            } in the crypto space.`;
          } else {
            summary = `General crypto insight: Contains information about ${
              lcText.includes('market') ? 'market conditions' : 'crypto developments'
            }.`;
          }
        } else {
          summary = 'No relevant crypto insights found.';
        }
        
        return {
          hasCryptoInsight,
          insightType,
          summary,
          confidence
        };
      }
    };
  }
}
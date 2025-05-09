// notificationManager.ts - Handles sending crypto insights to users

import { ContentInsight } from './types';

export interface NotificationConfig {
  // Delivery methods
  methods: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  
  // Filtering criteria
  filters: {
    minConfidence: number;
    insightTypes: ('crypto_trading' | 'crypto_project' | 'crypto_general')[];
  };
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  methods: {
    email: true,
    push: true,
    inApp: true
  },
  filters: {
    minConfidence: 0.7,
    insightTypes: ['crypto_trading', 'crypto_project', 'crypto_general']
  }
};

export class NotificationManager {
  private config: NotificationConfig;
  
  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = {
      methods: { ...DEFAULT_NOTIFICATION_CONFIG.methods, ...config.methods },
      filters: { ...DEFAULT_NOTIFICATION_CONFIG.filters, ...config.filters }
    };
  }
  
  /**
   * Send insight notification to user
   */
  public async sendInsight(insight: ContentInsight, userId: string): Promise<boolean> {
    // Check if insight meets notification criteria
    if (insight.confidence < this.config.filters.minConfidence) {
      console.log(`Insight confidence (${insight.confidence}) below threshold, not sending.`);
      return false;
    }
    
    if (!this.config.filters.insightTypes.includes(insight.insightType)) {
      console.log(`Insight type (${insight.insightType}) not in notification filters, not sending.`);
      return false;
    }
    
    try {
      // Log notification
      console.log(`Sending insight to user ${userId}:`);
      console.log(`Type: ${insight.insightType}`);
      console.log(`From: @${insight.author}`);
      console.log(`Summary: ${insight.insightSummary}`);
      console.log(`URL: ${insight.postUrl || 'N/A'}`);
      
      // Send via enabled channels
      if (this.config.methods.email) {
        await this.sendEmailNotification(insight, userId);
      }
      
      if (this.config.methods.push) {
        await this.sendPushNotification(insight, userId);
      }
      
      if (this.config.methods.inApp) {
        await this.sendInAppNotification(insight, userId);
      }
      
      return true;
    } catch (error) {
      console.error(`Error sending notification: ${error}`);
      return false;
    }
  }
  
  /**
   * Send email notification (mock implementation)
   */
  private async sendEmailNotification(insight: ContentInsight, userId: string): Promise<void> {
    console.log(`[MOCK] Sending email notification to user ${userId}`);
    // In real implementation, this would use an email service
  }
  
  /**
   * Send push notification (mock implementation)
   */
  private async sendPushNotification(insight: ContentInsight, userId: string): Promise<void> {
    console.log(`[MOCK] Sending push notification to user ${userId}`);
    // In real implementation, this would use a push notification service
  }
  
  /**
   * Send in-app notification (mock implementation)
   */
  private async sendInAppNotification(insight: ContentInsight, userId: string): Promise<void> {
    console.log(`[MOCK] Sending in-app notification to user ${userId}`);
    // In real implementation, this would store notification in a database
  }
}
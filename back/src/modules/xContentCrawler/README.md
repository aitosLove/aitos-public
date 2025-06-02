# X Content Crawler Module

This module provides comprehensive functionality for crawling and processing content from X (Twitter) for AI agents.

## Overview

The X Content Crawler module allows AI agents to:
- Authenticate with X using cookies
- Fetch user following lists
- Collect posts from followed users
- Store and manage crawled data with agent isolation
- Process content for insights and analysis

## Architecture

### Core Components

1. **XCrawler** (`xcrawler.ts`) - Low-level browser automation for X crawling
2. **XCrawlerModule** (`xCrawlerModule.ts`) - High-level module interface
3. **XCrawlerManager** (`index.ts`) - Agent integration and event management
4. **Database Operations** (`dbOp.ts`) - Data persistence layer
5. **Types** (`types.ts`) - TypeScript interfaces and types

### Data Isolation

All data is isolated by `agentId` to ensure multiple agents can operate independently without data conflicts.

## Usage

### Basic Setup

```typescript
import { enableXCrawlerModule } from "./xContentCrawler";
import { Agent } from "@/src/agent";

const agent = new Agent({
  agentId: "my-agent-id",
  name: "My Agent",
  // ... other config
});

// Enable X crawler for the agent
const xCrawlerManager = enableXCrawlerModule(agent, "twitter_username");
```

### Authentication

The module requires X authentication cookies. These can be:
1. Stored in the database (recommended for production)
2. Provided via environment variables (for development)

```typescript
// Cookies are automatically loaded from database or environment
// No manual authentication setup required
```

### Data Collection

```typescript
// Update following list
const followings = await xCrawlerManager.updateFollowingListTask();

// Collect content from followings
await xCrawlerManager.updateContentTask();
```

## Database Schema

The module uses the following tables (all prefixed with 'x'):

- **xUsers** - User accounts
- **xFollowings** - Following relationships
- **xPosts** - Collected posts
- **xProcessedPosts** - Tracking processed posts
- **xPostInsights** - Content analysis results
- **xUserCookies** - Authentication data
- **xContentInsights** - Content insights
- **xDeepSearches** - Deep search data
- **xDeepSearchCitations** - Search citations

All tables include an `agentId` field for data isolation.

## Configuration

### Crawler Config

```typescript
interface CrawlerConfig {
  target: {
    username: string;
  };
  limits: {
    maxPostsPerUser: number;
    maxFollowingsToProcess: number;
    maxScrollAttempts: number;
    maxFollowings: number;
    minHoursBetweenUpdates: number;
  };
  intervals: {
    followingUpdate: number;
    contentFetch: number;
  };
  browser: {
    headless: boolean;
    slowMo?: number;
  };
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG: CrawlerConfig = {
  target: { username: "" },
  limits: {
    maxPostsPerUser: 10,
    maxFollowingsToProcess: 50,
    maxScrollAttempts: 5,
    maxFollowings: 1000,
    minHoursBetweenUpdates: 24,
  },
  intervals: {
    followingUpdate: 24 * 60 * 60 * 1000, // 24 hours
    contentFetch: 30 * 60 * 1000,         // 30 minutes
  },
  browser: {
    headless: true,
    slowMo: 1000,
  },
};
```

## Events

The module emits various events that agents can listen to:

- **X_AUTH_REQUIRED_EVENT** - Authentication is needed
- **X_FOLLOWING_UPDATED_EVENT** - Following list was updated
- **X_CONTENT_UPDATED_EVENT** - Content was collected
- **X_CONTENT_TO_PROCESS_EVENT** - New content available for processing
- **X_ERROR_EVENT** - Error occurred

## Migration

To add the `agentId` field to existing tables, run:

```bash
cd /path/to/wonderland/back
./scripts/db-migrate-agentId.sh
```

## Error Handling

The module includes comprehensive error handling:
- Network timeouts and retries
- Authentication failures
- Rate limiting detection
- Database transaction safety
- Graceful degradation

## Best Practices

1. **Rate Limiting** - Respect X's rate limits by using appropriate delays
2. **Cookie Management** - Regularly refresh authentication cookies
3. **Data Cleanup** - Periodically clean old processed posts
4. **Monitoring** - Monitor events for system health
5. **Agent Isolation** - Always use unique `agentId` values

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check cookie validity
   - Verify X account status
   - Update authentication data

2. **Data Collection Issues**
   - Check network connectivity
   - Verify target user accessibility
   - Review rate limiting

3. **Database Errors**
   - Ensure schema is up to date
   - Check database connectivity
   - Verify agent isolation

### Debug Mode

Enable debug logging by setting browser headless mode to false:

```typescript
const config = {
  browser: {
    headless: false,
    slowMo: 2000,
  },
};
```

## Security Considerations

- Store authentication cookies securely
- Use environment variables for sensitive data
- Implement proper access controls
- Regular security audits of crawled data
- Comply with X's terms of service

## Performance Optimization

- Use database indexing on `agentId` fields
- Implement connection pooling
- Cache frequently accessed data
- Optimize browser resource usage
- Monitor memory consumption

## Contributing

When contributing to this module:

1. Maintain data isolation with `agentId`
2. Add comprehensive error handling
3. Include TypeScript types
4. Write JSDoc comments
5. Update this README for new features

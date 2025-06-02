-- Migration to add agentId column to all X Content Crawler related tables

-- Add agentId column to xUsers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xFollowings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'followings' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "followings" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xUsersToFollowings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users_to_followings' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "users_to_followings" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xPosts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "posts" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xProcessedPosts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'processed_posts' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "processed_posts" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xPostInsights table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'post_insights' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "post_insights" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xUserCookies table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_cookies' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "user_cookies" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xContentInsights table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'content_insights' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "content_insights" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xDeepSearchCitations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'deep_search_citations' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "deep_search_citations" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add agentId column to xDeepSearches table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'deep_searches' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE "deep_searches" ADD COLUMN "agent_id" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

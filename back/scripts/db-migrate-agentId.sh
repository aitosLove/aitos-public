#!/bin/bash
set -e

echo "Running database migration for adding agentId to X Content Crawler tables..."
cd "$(dirname "$0")/.."
npx ts-node -T db/migrate.ts
echo "Migration complete."

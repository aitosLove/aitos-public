import "dotenv/config";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Running migration: add_agentId_to_twitter_tables.sql");
    
    const migrationPath = path.join(__dirname, "migrations", "add_agentId_to_twitter_tables.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    await pool.query(migrationSQL);
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();

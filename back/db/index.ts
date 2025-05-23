import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as agentSchema from "./schema/agentSchema";
import moduleSchema from "./schema/moduleSchema";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    ...agentSchema,
    ...moduleSchema,
  },
});

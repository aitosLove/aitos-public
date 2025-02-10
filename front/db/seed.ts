import "dotenv/config";
import {
  //  usersTable,
  jsonLearnTable,
} from "./schema";
import { db } from ".";
import { eq } from "drizzle-orm";

async function main() {
  // const user: typeof usersTable.$inferInsert = {
  //   name: "John",
  //   age: 30,
  //   email: "john@example.com",
  // };
  // await db.insert(usersTable).values(user);
  // console.log("New user created!");
  // const users = await db.select().from(usersTable);
  // console.log("Getting all users from the database: ", users);
  // /*
  //   const users: {
  //     id: number;
  //     name: string;
  //     age: number;
  //     email: string;
  //   }[]
  //   */
  // await db
  //   .update(usersTable)
  //   .set({
  //     age: 31,
  //   })
  //   .where(eq(usersTable.email, user.email));
  // console.log("User info updated!");
  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log("User deleted!");

  const result = await db
    .insert(jsonLearnTable)
    .values({
      data: {
        pair: "ETH/BTC",
        "1h": { value: 0.0023, change: 1.2 },
        "1d": { value: 0.0024, change: -0.8 },
        "3d": { value: 0.0022, change: 2.1 },
        "7d": { value: 0.0025, change: -1.5 },
        "30d": { value: 0.0021, change: 3.2 },
      },
    })
    .returning();

  console.log("New jsonLearnTable created!", result[0].data as PairInfo);
}
main();

interface PairInfo {
  pair: string;
  "1h": { value: number; change: number };
  "1d": { value: number; change: number };
  "3d": { value: number; change: number };
  "7d": { value: number; change: number };
  "30d": { value: number; change: number };
}

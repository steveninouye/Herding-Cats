// Example: src/routes/api/users/index.ts
import { type RequestHandler } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { users } from "~/db/schema";

export const onGet: RequestHandler = async ({ platform, json }) => {
  const db = getDb((platform as unknown as Env).DB);
  const allUsers = await db.select().from(users).all();
  json(200, allUsers);
};
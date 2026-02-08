import type { RequestEvent } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(requestEvent: RequestEvent) {
  const userId = requestEvent.cookie.get("userId")?.value;
  if (!userId) return null;

  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(userId)))
    .get();

  if (!user || !user.isActive || user.isPlatformBanned) return null;

  return user;
}

/**
 * Require authentication — redirects to /login if not authenticated.
 * Use in `onRequest` handlers.
 */
export async function requireAuth(requestEvent: RequestEvent) {
  const user = await getCurrentUser(requestEvent);
  if (!user) {
    throw requestEvent.redirect(302, "/login");
  }
  // Store user in shared map so downstream loaders/actions can access it
  requestEvent.sharedMap.set("user", user);
  return user;
}
// src/middleware/auth.ts
import type { RequestEvent } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { verifyToken, type JwtPayload } from "~/lib/jwt";

const SESSION_COOKIE = "session";

/**
 * Get the JWT secret from environment.
 */
function getJwtSecret(requestEvent: RequestEvent): string {
  const env = requestEvent.platform.env as { JWT_SECRET?: string };
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

/**
 * Get the current authenticated user from the JWT session cookie.
 * Returns the full user row or null.
 */
export async function getCurrentUser(requestEvent: RequestEvent) {
  const token = requestEvent.cookie.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const secret = getJwtSecret(requestEvent);
  const payload = await verifyToken(token, secret);
  if (!payload) return null;

  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .get();

  if (!user || !user.isActive || user.isPlatformBanned) return null;

  return user;
}

/**
 * Get just the JWT payload without a DB call.
 * Useful for lightweight checks.
 */
export async function getSessionPayload(
  requestEvent: RequestEvent
): Promise<JwtPayload | null> {
  const token = requestEvent.cookie.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const secret = getJwtSecret(requestEvent);
  return verifyToken(token, secret);
}

/**
 * Require authentication — redirects to /login if not authenticated.
 */
export async function requireAuth(requestEvent: RequestEvent) {
  const user = await getCurrentUser(requestEvent);
  if (!user) {
    requestEvent.cookie.delete(SESSION_COOKIE, { path: "/" });
    throw requestEvent.redirect(302, "/login");
  }
  requestEvent.sharedMap.set("user", user);
  return user;
}
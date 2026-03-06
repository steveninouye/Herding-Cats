// src/server/auth.ts
import { type RequestEvent } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { verifyToken } from "~/lib/jwt";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  isPlatformAdmin: boolean;
}

/**
 * Extract the current user from the session cookie.
 * Returns null if not authenticated.
 */
export async function getSessionUser(
  requestEvent: RequestEvent
): Promise<AuthUser | null> {
  const token = requestEvent.cookie.get("session")?.value;
  if (!token) return null;

  try {
    const env = requestEvent.platform.env as {
      JWT_SECRET: string;
      herding_cats_db: D1Database;
    };
    const payload = await verifyToken(token, env.JWT_SECRET);
    if (!payload || !payload.userId) return null;

    const db = getDb(env.herding_cats_db);
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        isPlatformAdmin: users.isPlatformAdmin,
      })
      .from(users)
      .where(eq(users.id, payload.userId as number))
      .get();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isPlatformAdmin: user.isPlatformAdmin ?? false,
    };
  } catch {
    return null;
  }
}

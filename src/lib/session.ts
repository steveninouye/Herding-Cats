import type { RequestEvent } from "@builder.io/qwik-city";
import { createToken } from "./jwt";

const SESSION_COOKIE = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface SessionUser {
  id: number;
  email: string;
  isPlatformAdmin: boolean;
}

/**
 * Create a JWT and set it as an httpOnly session cookie.
 */
export async function setSession(
  requestEvent: RequestEvent,
  user: SessionUser
) {
  const env = requestEvent.platform.env as { JWT_SECRET: string };
  const token = await createToken(
    {
      userId: user.id,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
    },
    env.JWT_SECRET
  );

  requestEvent.cookie.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Clear the session cookie.
 */
export function clearSession(requestEvent: RequestEvent) {
  requestEvent.cookie.delete(SESSION_COOKIE, { path: "/" });
}
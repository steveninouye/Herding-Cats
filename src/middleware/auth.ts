// src/middleware/auth.ts
import type { RequestEvent } from "@builder.io/qwik-city";
import { verifyToken } from "~/lib/jwt";

/**
 * Middleware: require a valid session or redirect to /login.
 * Used by the root layout for protected routes.
 */
export async function requireAuth(requestEvent: RequestEvent) {
  const token = requestEvent.cookie.get("session")?.value;

  if (!token) {
    throw requestEvent.redirect(302, "/login");
  }

  try {
    const env = requestEvent.platform.env as { JWT_SECRET: string };
    const payload = await verifyToken(token, env.JWT_SECRET);

    if (!payload || !payload.userId) {
      throw requestEvent.redirect(302, "/login");
    }

    // Attach user info to shared map for downstream loaders
    requestEvent.sharedMap.set("userId", payload.userId);
    requestEvent.sharedMap.set("email", payload.email);
    requestEvent.sharedMap.set("isPlatformAdmin", payload.isPlatformAdmin);
  } catch (e) {
    // Re-throw redirects
    if (e instanceof Response) throw e;
    throw requestEvent.redirect(302, "/login");
  }
}

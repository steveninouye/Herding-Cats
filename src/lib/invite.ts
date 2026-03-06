// src/lib/invite.ts

/**
 * Generate a random alphanumeric invite code.
 * Uses Web Crypto API (available in Cloudflare Workers).
 */
export function generateInviteCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/l confusion
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

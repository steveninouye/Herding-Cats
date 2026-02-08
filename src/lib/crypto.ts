/**
 * Generate a cryptographically secure invite token using Web Crypto API
 * (compatible with Cloudflare Workers — no Node crypto needed)
 */
export function generateInviteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
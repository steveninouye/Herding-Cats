const ALGORITHM: HmacImportParams = { name: "HMAC", hash: "SHA-256" };
const EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface JwtPayload {
  userId: number;
  email: string;
  isPlatformAdmin: boolean;
  iat: number;
  exp: number;
}

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(data: string): string {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

async function getKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    ALGORITHM,
    false,
    ["sign", "verify"]
  );
}

async function sign(input: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    ALGORITHM.name,
    key,
    encoder.encode(input)
  );
  return base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
}

/**
 * Create a signed JWT token.
 */
export async function createToken(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string
): Promise<string> {
  const header = base64UrlEncode(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  );

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + EXPIRY_SECONDS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await sign(`${header}.${encodedPayload}`, secret);

  return `${header}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token.
 * Returns the payload if valid, null if invalid or expired.
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;

  // Verify signature
  const expectedSignature = await sign(`${header}.${payload}`, secret);
  if (signature !== expectedSignature) return null;

  // Decode and check expiry
  try {
    const decoded: JwtPayload = JSON.parse(base64UrlDecode(payload));
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) return null;

    return decoded;
  } catch {
    return null;
  }
}
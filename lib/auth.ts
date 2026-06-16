import { SignJWT, jwtVerify } from "jose";

// Edge-safe admin auth: jose (Web Crypto) for signing/verifying the session cookie,
// and Web Crypto SHA-256 for a constant-time password comparison. No node:crypto,
// so this module is safe to import from both middleware (Edge) and route handlers.

export const SESSION_COOKIE = "dfwe_session";
const SESSION_TTL = "7d";

function secretKey(): Uint8Array {
  // Fail closed: no hardcoded fallback. Checked lazily (not at module load) so it
  // never breaks `next build`, which evaluates this module during static analysis.
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short (must be at least 32 characters).");
  }
  return new TextEncoder().encode(s);
}

/** Issue a signed session token for the admin. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

/** Verify a session token. Returns true only for a valid, unexpired admin session. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

async function sha256(input: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return new Uint8Array(digest);
}

/** Constant-time check of the submitted password against ADMIN_PASSWORD. */
export async function verifyPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  // Fail closed in production if the placeholder password was never changed.
  if (process.env.NODE_ENV === "production" && expected === "change-me") return false;
  const [a, b] = await Promise.all([sha256(input), sha256(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

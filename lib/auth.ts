import crypto from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "maas_ventures_default_secret_2026_key";
const SESSION_COOKIE_NAME = "maas_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function verifyAdminCredentials(username?: string, password?: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "admin@maas2026";

  if (!username || !password) return false;

  const userMatch = crypto.timingSafeEqual(
    Buffer.from(username.padEnd(64, "\0")),
    Buffer.from(expectedUser.padEnd(64, "\0"))
  );

  const passMatch = crypto.timingSafeEqual(
    Buffer.from(password.padEnd(64, "\0")),
    Buffer.from(expectedPass.padEnd(64, "\0"))
  );

  return userMatch && passMatch;
}

export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const data = `${timestamp}:${nonce}`;
  const hmac = crypto.createHmac("sha256", ADMIN_SECRET).update(data).digest("hex");
  return `${data}:${hmac}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [timestamp, nonce, signature] = parts;
  const data = `${timestamp}:${nonce}`;
  const expectedSignature = crypto.createHmac("sha256", ADMIN_SECRET).update(data).digest("hex");

  try {
    const validSig = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!validSig) return false;

    // Check expiration
    const issuedAt = parseInt(timestamp, 10);
    if (isNaN(issuedAt)) return false;
    const now = Date.now();
    if (now - issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(sessionToken);
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };

import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "maas_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function verifyAdminCredentials(username?: string, password?: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass || !process.env.ADMIN_SECRET) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  const digest = (value: string) => crypto.createHash("sha256").update(value).digest();
  const userMatch = crypto.timingSafeEqual(digest(username), digest(expectedUser));
  const passMatch = crypto.timingSafeEqual(digest(password), digest(expectedPass));
  return userMatch && passMatch;
}

export function createSessionToken(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("Admin signing key is not configured");
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const data = `${timestamp}:${nonce}`;
  const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${data}:${hmac}`;
}

export function verifySessionToken(token?: string | null): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [timestamp, nonce, signature] = parts;
  const data = `${timestamp}:${nonce}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex");

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
    if (issuedAt > now || now - issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return false;

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

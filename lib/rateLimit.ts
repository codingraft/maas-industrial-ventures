interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup interval every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier) || { timestamps: [] };

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return { allowed: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  rateLimitMap.set(identifier, record);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

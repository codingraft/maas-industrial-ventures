/**
 * In-memory server-side cache with TTL and pattern invalidation.
 * Eliminates redundant database round-trips for high-traffic read operations.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry<unknown>>();

// Default TTL: 60 seconds (sufficient to absorb traffic spikes while staying fresh)
const DEFAULT_TTL_MS = 60 * 1000;

export function cacheGet<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function cacheInvalidate(pattern: string): void {
  for (const key of cacheStore.keys()) {
    if (key === pattern || key.startsWith(pattern)) {
      cacheStore.delete(key);
    }
  }
}

export function cacheClear(): void {
  cacheStore.clear();
}

export const CACHE_KEYS = {
  SETTINGS: "settings:all",
  PROJECTS_ACTIVE: "projects:active",
  PROJECTS_ALL: "projects:all",
  BLOGS_PUBLISHED: "blogs:published",
  BLOGS_ALL: "blogs:all",
} as const;

/**
 * Redis Cache Utility (Upstash)
 *
 * Opt-in caching layer. Does nothing if UPSTASH_REDIS_REST_URL is not set.
 * All methods are safe to call without Redis configured — they just pass through.
 *
 * Usage:
 *   import { cache } from "@/lib/cache";
 *   const data = await cache.get("key");
 *   await cache.set("key", data, 300); // 300 seconds TTL
 *   await cache.del("key");
 */

import { Redis } from "@upstash/redis";

// ─── Singleton ──────────────────────────────────────────────

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

// ─── Public API ─────────────────────────────────────────────

export const cache = {
  /**
   * Get a cached value. Returns null if not found or Redis not configured.
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const client = getRedis();
      if (!client) return null;
      return await client.get<T>(key);
    } catch (err) {
      console.error("[cache] get error:", err);
      return null;
    }
  },

  /**
   * Set a cached value with optional TTL in seconds.
   * No-op if Redis not configured.
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const client = getRedis();
      if (!client) return;
      if (ttlSeconds) {
        await client.set(key, value, { ex: ttlSeconds });
      } else {
        await client.set(key, value);
      }
    } catch (err) {
      console.error("[cache] set error:", err);
    }
  },

  /**
   * Delete a cached key. No-op if Redis not configured.
   */
  async del(key: string): Promise<void> {
    try {
      const client = getRedis();
      if (!client) return;
      await client.del(key);
    } catch (err) {
      console.error("[cache] del error:", err);
    }
  },

  /**
   * Delete all keys matching a pattern. No-op if Redis not configured.
   * Use sparingly — SCAN-based, safe for production.
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const client = getRedis();
      if (!client) return;
      let cursor = 0;
      do {
        const [nextCursor, keys] = await client.scan(cursor, {
          match: pattern,
          count: 100,
        });
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== 0);
    } catch (err) {
      console.error("[cache] delPattern error:", err);
    }
  },

  /**
   * Get or set — returns cached value if exists, otherwise calls fetcher,
   * caches the result, and returns it.
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    const cached = await cache.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await cache.set(key, fresh, ttlSeconds);
    return fresh;
  },

  /**
   * Check if Redis is configured and available.
   */
  isAvailable(): boolean {
    return getRedis() !== null;
  },
};

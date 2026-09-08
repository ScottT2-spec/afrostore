/**
 * Distributed concurrency limiter for the pipeline engine.
 *
 * Why not a simple INCR/DECR counter: if a process crashes mid-step (OOM,
 * deploy restart, etc.) before it calls release(), a bare counter leaks
 * that slot forever - capacity silently shrinks over time until the whole
 * bucket is permanently stuck. At 500k users that's a slow-motion outage.
 *
 * Instead this uses a Redis sorted set per resource: each held slot is a
 * unique token scored by the time it was acquired. Every acquire() call
 * first prunes any entry older than maxHoldMs - so a crashed holder's slot
 * frees itself on the very next acquire attempt from anyone, no separate
 * sweeper process needed.
 *
 * Falls back to a simple in-process Map-based semaphore if Redis isn't
 * configured (matches cache.ts's "degrade gracefully" pattern) - that
 * only limits per-instance, not globally, which is fine for local dev but
 * NOT sufficient once running multiple replicas in production.
 */

import { Redis } from "@upstash/redis";
import crypto from "crypto";

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

export function isDistributedLimiterActive(): boolean {
  return getRedis() !== null;
}

// In-process fallback state, keyed by resource name.
const localSlots = new Map<string, Set<string>>();

export interface AcquireOptions {
  /** Max concurrent holders of this resource, across all instances (or this process, if Redis isn't configured). */
  limit: number;
  /** Safety ceiling on how long a slot can be considered "held" before it's treated as abandoned and pruned. Should exceed the step's own timeout. */
  maxHoldMs: number;
}

/**
 * Attempts to acquire one slot in `resource`'s bucket. Returns a token to
 * pass to release() if acquired, or null if the bucket is at capacity -
 * callers should back off and retry, not treat null as an error.
 */
export async function acquireSlot(resource: string, opts: AcquireOptions): Promise<string | null> {
  const token = crypto.randomUUID();
  const client = getRedis();

  if (!client) {
    let set = localSlots.get(resource);
    if (!set) { set = new Set(); localSlots.set(resource, set); }
    if (set.size >= opts.limit) return null;
    set.add(token);
    return token;
  }

  const key = `pipeline:sem:${resource}`;
  const now = Date.now();

  // Self-healing prune: drop any holder whose slot is older than
  // maxHoldMs - this is what reclaims a crashed process's slot without
  // needing a background job to notice it died.
  await client.zremrangebyscore(key, 0, now - opts.maxHoldMs);

  const count = await client.zcard(key);
  if (count >= opts.limit) return null;

  await client.zadd(key, { score: now, member: token });
  // Re-check after adding: two concurrent acquires can both pass the
  // zcard check before either writes (a classic TOCTOU race). Whichever
  // one ends up over the limit after the add loses and backs off - cheap
  // insurance against a brief overshoot under real concurrent load.
  const countAfter = await client.zcard(key);
  if (countAfter > opts.limit) {
    await client.zrem(key, token);
    return null;
  }

  return token;
}

export async function releaseSlot(resource: string, token: string): Promise<void> {
  const client = getRedis();
  if (!client) {
    localSlots.get(resource)?.delete(token);
    return;
  }
  await client.zrem(`pipeline:sem:${resource}`, token);
}

/**
 * Runs `fn` once a slot is available, polling with backoff+jitter until
 * one frees up, and always releases afterward (success or failure).
 */
export async function withSlot<T>(resource: string, opts: AcquireOptions, fn: () => Promise<T>): Promise<T> {
  let token: string | null = null;
  let waitMs = 100;
  while (token === null) {
    token = await acquireSlot(resource, opts);
    if (token === null) {
      await new Promise((r) => setTimeout(r, waitMs + Math.random() * waitMs));
      waitMs = Math.min(waitMs * 1.6, 5000);
    }
  }
  try {
    return await fn();
  } finally {
    await releaseSlot(resource, token);
  }
}

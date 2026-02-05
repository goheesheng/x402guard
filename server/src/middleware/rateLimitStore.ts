import { Redis } from "@upstash/redis";

export interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<RateLimitBucket>;
}

interface StoreOptions {
  provider: "memory" | "upstash";
  upstashUrl?: string;
  upstashToken?: string;
}

export function createRateLimitStore(options: StoreOptions): RateLimitStore {
  if (options.provider === "upstash") {
    if (!options.upstashUrl || !options.upstashToken) {
      throw new Error("Upstash configuration is missing for rate limiting");
    }
    return createUpstashRateLimitStore(options.upstashUrl, options.upstashToken);
  }

  return createMemoryRateLimitStore();
}

function createMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, RateLimitBucket>();
  let requestCountSinceCleanup = 0;

  return {
    async increment(key: string, windowMs: number): Promise<RateLimitBucket> {
      const now = Date.now();
      const existing = buckets.get(key);
      const bucket =
        existing && existing.resetAt > now
          ? existing
          : { count: 0, resetAt: now + windowMs };

      bucket.count += 1;
      buckets.set(key, bucket);

      requestCountSinceCleanup += 1;
      if (requestCountSinceCleanup >= 500) {
        for (const [bucketKey, value] of buckets.entries()) {
          if (value.resetAt <= now) {
            buckets.delete(bucketKey);
          }
        }
        requestCountSinceCleanup = 0;
      }

      return bucket;
    },
  };
}

function createUpstashRateLimitStore(
  url: string,
  token: string
): RateLimitStore {
  const redis = new Redis({ url, token });

  return {
    async increment(key: string, windowMs: number): Promise<RateLimitBucket> {
      const now = Date.now();
      const namespacedKey = `x402guard:rl:${windowMs}:${key}`;
      const count = await redis.incr(namespacedKey);

      if (count === 1) {
        await redis.pexpire(namespacedKey, windowMs);
      }

      let ttl = await redis.pttl(namespacedKey);
      if (ttl === null || ttl < 0) {
        await redis.pexpire(namespacedKey, windowMs);
        ttl = windowMs;
      }

      return {
        count,
        resetAt: now + ttl,
      };
    },
  };
}

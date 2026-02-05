import { AppError } from "./errorHandler.js";

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

function getClientIp(req: any): string {
  const forwardedFor = req.headers?.["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim().length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return String(forwardedFor[0]).trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

export function createRateLimitMiddleware(options: RateLimitOptions): any {
  const windowMs = Math.max(1, Number(options.windowMs) || 60_000);
  const max = Math.max(1, Number(options.max) || 100);
  const buckets = new Map<string, RateLimitBucket>();
  let requestCountSinceCleanup = 0;

  return (req: any, res: any, next: any) => {
    // Don't rate limit CORS preflight requests.
    if (req.method === "OPTIONS") {
      next();
      return;
    }

    const now = Date.now();
    const key = getClientIp(req);
    const existing = buckets.get(key);
    const bucket =
      existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + windowMs };

    bucket.count += 1;
    buckets.set(key, bucket);

    res.header("X-RateLimit-Limit", String(max));
    res.header("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.header("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000)
      );
      res.header("Retry-After", String(retryAfterSeconds));
      next(
        new AppError(
          "Too many requests. Please retry later.",
          "RATE_LIMITED",
          429
        )
      );
      return;
    }

    requestCountSinceCleanup += 1;
    if (requestCountSinceCleanup >= 100) {
      for (const [bucketKey, value] of buckets.entries()) {
        if (value.resetAt <= now) {
          buckets.delete(bucketKey);
        }
      }
      requestCountSinceCleanup = 0;
    }

    next();
  };
}

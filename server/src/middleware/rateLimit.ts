import { AppError } from "./errorHandler.js";
import type { RateLimitStore } from "./rateLimitStore.js";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  store: RateLimitStore;
}

function getClientIp(req: any): string {
  // Never trust x-forwarded-for directly from request headers.
  // req.ip respects Express trust proxy settings and is safe by default.
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";
}

export function createRateLimitMiddleware(options: RateLimitOptions): any {
  const windowMs = Math.max(1, Number(options.windowMs) || 60_000);
  const max = Math.max(1, Number(options.max) || 100);
  const store = options.store;

  return async (req: any, res: any, next: any) => {
    try {
      // Don't rate limit CORS preflight requests.
      if (req.method === "OPTIONS") {
        next();
        return;
      }

      const key = getClientIp(req);
      const bucket = await store.increment(key, windowMs);

      res.header("X-RateLimit-Limit", String(max));
      res.header(
        "X-RateLimit-Remaining",
        String(Math.max(0, max - bucket.count))
      );
      res.header("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

      if (bucket.count > max) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((bucket.resetAt - Date.now()) / 1000)
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

      next();
    } catch (error) {
      // Fail open if rate limiting infrastructure is unavailable.
      console.warn("[rate-limit] store error:", error);
      next();
    }
  };
}

import { AppError } from "./errorHandler.js";

const ALLOWED_HEADERS =
  "Content-Type, Authorization, X-Payment, PAYMENT-SIGNATURE, X-PAYMENT, Access-Control-Expose-Headers";
const EXPOSED_HEADERS =
  "PAYMENT-REQUIRED, PAYMENT-RESPONSE, X-Payment-Response, X-Payment-Required";

interface CorsOptions {
  allowedOrigins: string[];
}

function normalizeOrigin(origin: string): string | null {
  try {
    return new URL(origin).origin.toLowerCase();
  } catch {
    return null;
  }
}

function mergeVaryHeader(existing: unknown, value: string): string {
  const existingValue = Array.isArray(existing)
    ? existing.join(",")
    : typeof existing === "string"
      ? existing
      : "";

  const parts = existingValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parts.some((item) => item.toLowerCase() === value.toLowerCase())) {
    parts.push(value);
  }

  return parts.join(", ");
}

export function createCorsMiddleware(options: CorsOptions): any {
  const allowAllOrigins = options.allowedOrigins.includes("*");
  const allowedOrigins = new Set(
    options.allowedOrigins
      .map((origin) => normalizeOrigin(origin))
      .filter((origin): origin is string => Boolean(origin))
  );

  return (req: any, res: any, next: any) => {
    const rawOrigin = req.headers?.origin;
    const requestOrigin =
      typeof rawOrigin === "string" ? normalizeOrigin(rawOrigin) : null;

    if (requestOrigin) {
      if (allowAllOrigins || allowedOrigins.has(requestOrigin)) {
        res.header(
          "Access-Control-Allow-Origin",
          allowAllOrigins ? "*" : requestOrigin
        );
        if (!allowAllOrigins && typeof res.getHeader === "function") {
          const existingVary = res.getHeader("Vary");
          res.header("Vary", mergeVaryHeader(existingVary, "Origin"));
        }
      } else {
        next(
          new AppError(
            "Origin is not allowed by CORS policy",
            "CORS_ORIGIN_DENIED",
            403
          )
        );
        return;
      }
    } else if (allowAllOrigins) {
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Expose-Headers", EXPOSED_HEADERS);

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }

    next();
  };
}

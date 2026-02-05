import { lookup } from "dns/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/middleware/errorHandler.js";
import { createCorsMiddleware } from "../src/middleware/cors.js";
import { createRateLimitMiddleware } from "../src/middleware/rateLimit.js";
import {
  assertSafeOutboundUrl,
  getSecureFetchOptions,
  isPublicIpAddress,
} from "../src/utils/urlSecurity.js";

vi.mock("dns/promises", () => ({
  lookup: vi.fn(),
}));

const mockedLookup = vi.mocked(lookup);

function createMockResponse() {
  const headers: Record<string, string> = {};

  return {
    headers,
    statusCode: 200,
    header(name: string, value: string) {
      headers[name] = value;
      return this;
    },
    getHeader(name: string) {
      return headers[name];
    },
    sendStatus(status: number) {
      this.statusCode = status;
      return this;
    },
  };
}

describe("urlSecurity", () => {
  beforeEach(() => {
    mockedLookup.mockReset();
  });

  it("allows public HTTPS targets", async () => {
    mockedLookup.mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
    ] as any);

    const parsed = await assertSafeOutboundUrl("https://example.com/SKILL.md");

    expect(parsed.protocol).toBe("https:");
    expect(parsed.hostname).toBe("example.com");
  });

  it("rejects non-HTTPS URLs", async () => {
    await expect(
      assertSafeOutboundUrl("http://example.com/SKILL.md")
    ).rejects.toThrow("Only HTTPS URLs are allowed");
  });

  it("rejects localhost hostnames", async () => {
    await expect(
      assertSafeOutboundUrl("https://localhost/SKILL.md")
    ).rejects.toThrow("URL hostname is not allowed");
  });

  it("rejects private IPv4 literals", async () => {
    await expect(
      assertSafeOutboundUrl("https://192.168.1.10/SKILL.md")
    ).rejects.toThrow("private or local network address");
  });

  it("rejects hostnames resolving to private ranges", async () => {
    mockedLookup.mockResolvedValue([
      { address: "10.10.10.10", family: 4 },
    ] as any);

    await expect(
      assertSafeOutboundUrl("https://internal.example/SKILL.md")
    ).rejects.toThrow("private or local network address");
  });

  it("produces fetch options with redirect blocking", () => {
    const options = getSecureFetchOptions("x402guard/test");

    expect(options.redirect).toBe("error");
    expect((options.headers as Record<string, string>)["User-Agent"]).toBe(
      "x402guard/test"
    );
  });

  it("correctly classifies public vs private IPs", () => {
    expect(isPublicIpAddress("8.8.8.8")).toBe(true);
    expect(isPublicIpAddress("127.0.0.1")).toBe(false);
    expect(isPublicIpAddress("10.0.0.5")).toBe(false);
    expect(isPublicIpAddress("::1")).toBe(false);
  });
});

describe("rateLimit middleware", () => {
  it("returns RATE_LIMITED after max requests", () => {
    const middleware = createRateLimitMiddleware({ windowMs: 60_000, max: 2 });
    const req = { method: "POST", headers: {}, ip: "203.0.113.10" };

    const next1 = vi.fn();
    middleware(req, createMockResponse(), next1);
    expect(next1).toHaveBeenCalledWith();

    const next2 = vi.fn();
    middleware(req, createMockResponse(), next2);
    expect(next2).toHaveBeenCalledWith();

    const res3 = createMockResponse();
    const next3 = vi.fn();
    middleware(req, res3, next3);

    const err = next3.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.statusCode).toBe(429);
    expect(res3.headers["Retry-After"]).toBeDefined();
  });

  it("resets quota after the window elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-05T00:00:00.000Z"));

    const middleware = createRateLimitMiddleware({ windowMs: 1_000, max: 1 });
    const req = { method: "POST", headers: {}, ip: "203.0.113.20" };

    const next1 = vi.fn();
    middleware(req, createMockResponse(), next1);
    expect(next1).toHaveBeenCalledWith();

    const next2 = vi.fn();
    middleware(req, createMockResponse(), next2);
    expect(next2.mock.calls[0][0]).toBeInstanceOf(AppError);

    vi.advanceTimersByTime(1_001);

    const next3 = vi.fn();
    middleware(req, createMockResponse(), next3);
    expect(next3).toHaveBeenCalledWith();

    vi.useRealTimers();
  });
});

describe("cors middleware", () => {
  it("allows configured origins", () => {
    const middleware = createCorsMiddleware({
      allowedOrigins: ["https://app.example.com"],
    });
    const req = {
      method: "POST",
      headers: { origin: "https://app.example.com" },
    };
    const res = createMockResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.headers["Access-Control-Allow-Origin"]).toBe(
      "https://app.example.com"
    );
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects disallowed origins", () => {
    const middleware = createCorsMiddleware({
      allowedOrigins: ["https://app.example.com"],
    });
    const req = {
      method: "POST",
      headers: { origin: "https://evil.example.com" },
    };
    const res = createMockResponse();
    const next = vi.fn();

    middleware(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CORS_ORIGIN_DENIED");
    expect(err.statusCode).toBe(403);
  });

  it("answers OPTIONS preflight for allowed origins", () => {
    const middleware = createCorsMiddleware({
      allowedOrigins: ["https://app.example.com"],
    });
    const req = {
      method: "OPTIONS",
      headers: { origin: "https://app.example.com" },
    };
    const res = createMockResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(next).not.toHaveBeenCalled();
  });
});

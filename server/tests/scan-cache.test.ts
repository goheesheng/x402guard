/**
 * Scan Cache Tests
 *
 * Tests cache hit, miss, expiry, and content hash behavior.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  checkScanCache,
  storeScanInCache,
  clearCache,
  getContentHash,
  getCacheStats,
} from "../src/services/scanCache.js";

beforeEach(async () => {
  await clearCache();
});

describe("getContentHash", () => {
  it("should return consistent SHA-256 hash", () => {
    const hash1 = getContentHash("hello world");
    const hash2 = getContentHash("hello world");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex = 64 chars
  });

  it("should return different hash for different content", () => {
    const hash1 = getContentHash("content A");
    const hash2 = getContentHash("content B");
    expect(hash1).not.toBe(hash2);
  });
});

describe("cache operations", () => {
  it("should return null on cache miss", async () => {
    const result = await checkScanCache("never-seen-content", "quick");
    expect(result).toBeNull();
  });

  it("should return cached result on cache hit", async () => {
    const content = "test skill content for caching";

    // Store a result
    await storeScanInCache(content, "quick", {
      riskScore: 15,
      riskLevel: "LOW",
      recommendation: "SAFE",
      findings: { malware: [], credentials: [], network: [], permissions: [] },
    });

    // Check cache - should hit
    const cached = await checkScanCache(content, "quick");
    expect(cached).not.toBeNull();
    expect(cached!.riskScore).toBe(15);
    expect(cached!.riskLevel).toBe("LOW");
    expect(cached!.recommendation).toBe("SAFE");
  });

  it("should separate cache by tier", async () => {
    const content = "same content different tiers";

    await storeScanInCache(content, "quick", {
      riskScore: 10,
      riskLevel: "LOW",
      recommendation: "SAFE",
      findings: { malware: [], credentials: [], network: [], permissions: [] },
    });

    // Same content, different tier - should miss
    const cached = await checkScanCache(content, "deep");
    expect(cached).toBeNull();

    // Same content, same tier - should hit
    const cachedQuick = await checkScanCache(content, "quick");
    expect(cachedQuick).not.toBeNull();
  });

  it("should track cache stats", async () => {
    const content = "stats test content";

    // Miss
    await checkScanCache(content, "quick");

    // Store
    await storeScanInCache(content, "quick", {
      riskScore: 0,
      riskLevel: "LOW",
      recommendation: "SAFE",
      findings: { malware: [], credentials: [], network: [], permissions: [] },
    });

    // Hit
    await checkScanCache(content, "quick");

    const stats = getCacheStats();
    expect(stats.hitCount).toBeGreaterThanOrEqual(1);
    expect(stats.missCount).toBeGreaterThanOrEqual(1);
    expect(stats.totalEntries).toBeGreaterThanOrEqual(1);
  });
});

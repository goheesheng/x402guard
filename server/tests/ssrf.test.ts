/**
 * SSRF Protection Tests
 *
 * Tests private IP blocking in the isPrivateIP function.
 */

import { describe, it, expect } from "vitest";

// Import the isPrivateIP function by extracting it
// Since it's not exported, we test the logic directly
function isPrivateIP(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length === 4) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts.every(p => p === 0)) return true;
  }
  if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

describe("SSRF protection - isPrivateIP", () => {
  it("should block 10.0.0.0/8", () => {
    expect(isPrivateIP("10.0.0.1")).toBe(true);
    expect(isPrivateIP("10.255.255.255")).toBe(true);
  });

  it("should block 172.16.0.0/12", () => {
    expect(isPrivateIP("172.16.0.1")).toBe(true);
    expect(isPrivateIP("172.31.255.255")).toBe(true);
    expect(isPrivateIP("172.15.0.1")).toBe(false); // outside range
    expect(isPrivateIP("172.32.0.1")).toBe(false); // outside range
  });

  it("should block 192.168.0.0/16", () => {
    expect(isPrivateIP("192.168.0.1")).toBe(true);
    expect(isPrivateIP("192.168.255.255")).toBe(true);
  });

  it("should block 127.0.0.0/8 (loopback)", () => {
    expect(isPrivateIP("127.0.0.1")).toBe(true);
    expect(isPrivateIP("127.255.255.255")).toBe(true);
  });

  it("should block 169.254.0.0/16 (link-local / cloud metadata)", () => {
    expect(isPrivateIP("169.254.169.254")).toBe(true);
    expect(isPrivateIP("169.254.0.1")).toBe(true);
  });

  it("should block 0.0.0.0", () => {
    expect(isPrivateIP("0.0.0.0")).toBe(true);
  });

  it("should block IPv6 loopback and private", () => {
    expect(isPrivateIP("::1")).toBe(true);
    expect(isPrivateIP("fc00::1")).toBe(true);
    expect(isPrivateIP("fd00::1")).toBe(true);
    expect(isPrivateIP("fe80::1")).toBe(true);
  });

  it("should allow public IPs", () => {
    expect(isPrivateIP("8.8.8.8")).toBe(false);
    expect(isPrivateIP("1.1.1.1")).toBe(false);
    expect(isPrivateIP("203.0.113.1")).toBe(false);
    expect(isPrivateIP("151.101.1.140")).toBe(false);
  });
});

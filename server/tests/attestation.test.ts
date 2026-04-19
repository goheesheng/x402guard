/**
 * Attestation Tests
 *
 * Tests EIP-712 attestation signing and verification across all tiers.
 */

import { describe, it, expect } from "vitest";
import { signAttestation, verifyAttestation } from "../src/utils/attestation.js";
import type { AuditResponse } from "../src/types/api.js";

// Test private key (NOT a real key, for testing only)
const TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const mockAuditResponse: AuditResponse = {
  risk_score: 15,
  risk_level: "LOW",
  recommendation: "SAFE",
  gate_decision: "allow",
  findings: { malware: [], credentials: [], network: [], permissions: [] },
  audit_id: "test_audit_001",
  timestamp: new Date().toISOString(),
  tier: "quick",
};

describe("attestation signing", () => {
  it("should sign attestation for quick tier", async () => {
    const attestation = await signAttestation(mockAuditResponse, "https://example.com/skill", TEST_PRIVATE_KEY);
    expect(attestation.signature).toBeTruthy();
    expect(attestation.signer).toBeTruthy();
    expect(attestation.message.audit_id).toBe("test_audit_001");
    expect(attestation.message.risk_score).toBe(15);
    expect(attestation.domain.chainId).toBe(8453);
  });

  it("should sign attestation for standard tier", async () => {
    const response = { ...mockAuditResponse, tier: "standard" as const };
    const attestation = await signAttestation(response, "https://example.com/skill", TEST_PRIVATE_KEY);
    expect(attestation.signature).toBeTruthy();
    expect(attestation.signer).toBeTruthy();
  });

  it("should sign attestation for deep tier", async () => {
    const response = { ...mockAuditResponse, tier: "deep" as const };
    const attestation = await signAttestation(response, "https://example.com/skill", TEST_PRIVATE_KEY);
    expect(attestation.signature).toBeTruthy();
    expect(attestation.signer).toBeTruthy();
  });

  it("should return unsigned attestation without private key", async () => {
    const attestation = await signAttestation(mockAuditResponse, "https://example.com/skill", undefined);
    expect(attestation.signature).toBeNull();
    expect(attestation.signer).toBeNull();
    expect(attestation.warning).toBeTruthy();
  });
});

describe("attestation verification", () => {
  it("should verify a valid signed attestation", async () => {
    const attestation = await signAttestation(mockAuditResponse, "https://example.com/skill", TEST_PRIVATE_KEY);
    const result = await verifyAttestation(attestation);
    expect(result.valid).toBe(true);
    expect(result.matches).toBe(true);
  });

  it("should reject unsigned attestation", async () => {
    const attestation = await signAttestation(mockAuditResponse, "https://example.com/skill", undefined);
    const result = await verifyAttestation(attestation);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("should detect signer mismatch", async () => {
    const attestation = await signAttestation(mockAuditResponse, "https://example.com/skill", TEST_PRIVATE_KEY);
    const result = await verifyAttestation(attestation, "0x0000000000000000000000000000000000000000");
    expect(result.valid).toBe(true);
    expect(result.matches).toBe(false);
  });
});

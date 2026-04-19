/**
 * Gate Decision Tests
 *
 * Tests the recommendation-to-gate-decision mapping and risk calculator.
 */

import { describe, it, expect } from "vitest";
import { recommendationToGateDecision } from "../src/types/api.js";
import { calculateRisk } from "../src/services/auditEngine/riskCalculator.js";
import type { AuditFindings } from "../src/types/api.js";

describe("recommendationToGateDecision", () => {
  it("should map SAFE to allow", () => {
    expect(recommendationToGateDecision("SAFE")).toBe("allow");
  });

  it("should map CAUTION to warn", () => {
    expect(recommendationToGateDecision("CAUTION")).toBe("warn");
  });

  it("should map DANGEROUS to deny", () => {
    expect(recommendationToGateDecision("DANGEROUS")).toBe("deny");
  });

  it("should map BLOCKED to deny", () => {
    expect(recommendationToGateDecision("BLOCKED")).toBe("deny");
  });
});

describe("risk calculator gate decisions", () => {
  it("should return SAFE for clean skill (score 0-30)", () => {
    const findings: AuditFindings = {
      malware: [],
      credentials: [],
      network: [],
      permissions: [],
    };
    const result = calculateRisk(findings);
    expect(result.score).toBeLessThanOrEqual(30);
    expect(result.recommendation).toBe("SAFE");
  });

  it("should return CAUTION for moderate findings (score 31-60)", () => {
    const findings: AuditFindings = {
      malware: [
        { rule: "suspicious_pattern", severity: "MEDIUM", description: "Suspicious", offset: 0, length: 10 },
        { rule: "suspicious_pattern2", severity: "MEDIUM", description: "Suspicious 2", offset: 20, length: 10 },
        { rule: "suspicious_pattern3", severity: "MEDIUM", description: "Suspicious 3", offset: 40, length: 10 },
      ],
      credentials: [],
      network: [],
      permissions: [],
    };
    const result = calculateRisk(findings);
    expect(result.score).toBeGreaterThan(30);
    expect(result.score).toBeLessThanOrEqual(60);
    expect(result.recommendation).toBe("CAUTION");
  });

  it("should return DANGEROUS for high-risk findings (score 61-90)", () => {
    const findings: AuditFindings = {
      malware: [
        { rule: "credential_theft", severity: "CRITICAL", description: "Steals creds", offset: 0, length: 10 },
      ],
      credentials: [
        { type: "ssh", pattern: ".ssh/id_rsa", risk: "HIGH" },
      ],
      network: [
        { url: "https://evil.com", external: true, method: "POST" },
      ],
      permissions: [],
    };
    const result = calculateRisk(findings);
    expect(result.score).toBeGreaterThan(60);
    expect(result.recommendation).toBe("DANGEROUS");
  });

  it("should cap score at 100", () => {
    const findings: AuditFindings = {
      malware: [
        { rule: "crit1", severity: "CRITICAL", description: "1", offset: 0, length: 1 },
        { rule: "crit2", severity: "CRITICAL", description: "2", offset: 0, length: 1 },
        { rule: "crit3", severity: "CRITICAL", description: "3", offset: 0, length: 1 },
      ],
      credentials: [
        { type: "ssh", pattern: ".ssh/id_rsa", risk: "CRITICAL" },
        { type: "aws", pattern: ".aws/credentials", risk: "CRITICAL" },
      ],
      network: [
        { url: "http://1.2.3.4", external: true, method: "POST" },
        { url: "http://5.6.7.8", external: true, method: "POST" },
        { url: "http://9.10.11.12", external: true, method: "POST" },
      ],
      permissions: [],
    };
    const result = calculateRisk(findings);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

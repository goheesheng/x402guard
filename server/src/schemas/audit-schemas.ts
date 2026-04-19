/**
 * JSON Schemas for x402scan Bazaar Discovery Extension
 *
 * These schemas define the input/output format for audit API endpoints,
 * enabling x402scan validation and in-app resource invocation.
 */

import type { AuditResponse, AuditTier } from "../types/api.js";

/**
 * JSON Schema for audit API input (POST body)
 * Matches the Zod schema in routes/audit.ts
 */
export const auditInputSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {
    skill_url: {
      type: "string",
      format: "uri",
      description: "URL to fetch skill content from (HTTPS only)",
    },
    skill_content: {
      type: "string",
      maxLength: 1048576,
      description: "Raw skill content to audit (max 1MB)",
    },
    format: {
      type: "string",
      enum: ["json", "markdown"],
      default: "json",
      description: "Output format for the audit response",
    },
  },
  oneOf: [
    { required: ["skill_url"] },
    { required: ["skill_content"] },
  ],
  additionalProperties: false,
} as const;

/**
 * JSON Schema for audit API output (AuditResponse)
 * Matches the TypeScript interface in types/api.ts
 */
export const auditOutputSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["risk_score", "risk_level", "recommendation", "findings", "audit_id", "timestamp", "tier"],
  properties: {
    risk_score: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Overall risk score from 0 (safe) to 100 (critical)",
    },
    risk_level: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      description: "Categorized risk level",
    },
    recommendation: {
      type: "string",
      enum: ["SAFE", "CAUTION", "DANGEROUS", "BLOCKED"],
      description: "Installation recommendation",
    },
    findings: {
      type: "object",
      required: ["malware", "credentials", "network", "permissions"],
      properties: {
        malware: {
          type: "array",
          description: "YARA rule matches for malware signatures",
          items: {
            type: "object",
            properties: {
              rule: { type: "string" },
              severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
              description: { type: "string" },
              offset: { type: "number" },
              length: { type: "number" },
            },
          },
        },
        credentials: {
          type: "array",
          description: "Detected credential access patterns",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              pattern: { type: "string" },
              risk: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            },
          },
        },
        network: {
          type: "array",
          description: "Detected network calls",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              external: { type: "boolean" },
              method: { type: "string" },
            },
          },
        },
        permissions: {
          type: "array",
          description: "Required permissions analysis",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["filesystem", "network", "credential", "system"] },
              action: { type: "string", enum: ["read", "write", "execute", "transmit"] },
              target: { type: "string" },
              risk: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            },
          },
        },
      },
    },
    audit_id: {
      type: "string",
      description: "Unique identifier for this audit",
    },
    timestamp: {
      type: "string",
      format: "date-time",
      description: "ISO8601 timestamp of when the audit was performed",
    },
    tier: {
      type: "string",
      enum: ["quick", "standard", "deep"],
      description: "Audit tier that was executed",
    },
    attestation: {
      type: "object",
      description: "On-chain attestation (deep tier only)",
      properties: {
        signature: { type: "string", description: "Attestation signature" },
        signer: { type: "string", description: "Signer address" },
        chain: { type: "string", description: "Chain identifier" },
      },
    },
  },
  additionalProperties: false,
} as const;

/**
 * Example input for Bazaar info field
 */
export const auditInputExample = {
  skill_url: "https://example.com/skill.md",
};

/**
 * Example output for Bazaar info field
 * Represents a typical safe skill audit result
 */
export const auditOutputExample: AuditResponse = {
  risk_score: 15,
  risk_level: "LOW",
  recommendation: "SAFE",
  gate_decision: "allow",
  findings: {
    malware: [],
    credentials: [],
    network: [
      {
        url: "https://api.example.com/data",
        external: true,
        method: "GET",
      },
    ],
    permissions: [
      {
        type: "network",
        action: "read",
        target: "api.example.com",
        risk: "LOW",
      },
    ],
  },
  audit_id: "abc123xyz789",
  timestamp: "2026-02-02T12:00:00.000Z",
  tier: "quick",
};

/**
 * Get example output for a specific tier
 */
export function getAuditOutputExample(tier: AuditTier): AuditResponse {
  const example = { ...auditOutputExample, tier };

  if (tier === "deep") {
    example.attestation = {
      message: {
        audit_id: example.audit_id,
        skill_url: "https://example.com/skill.md",
        risk_score: example.risk_score,
        risk_level: example.risk_level,
        timestamp: Math.floor(Date.now() / 1000),
      },
      signature: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1c",
      signer: "0x93A0baf7295d99b143cFDc480f4Cc879Cbe1B52c",
      domain: {
        name: "x402guard",
        version: "1",
        chainId: 8453,
      },
    };
  }

  return example;
}

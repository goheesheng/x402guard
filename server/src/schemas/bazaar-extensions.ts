/**
 * Bazaar Discovery Extension Factory
 *
 * Creates properly structured Bazaar extensions for x402scan compatibility.
 * Uses @x402/extensions declareDiscoveryExtension for validation.
 */

import { declareDiscoveryExtension } from "@x402/extensions";
import type { AuditTier } from "../types/api.js";
import {
  auditInputSchema,
  auditOutputSchema,
  auditInputExample,
  getAuditOutputExample,
} from "./audit-schemas.js";

/**
 * Create a Bazaar discovery extension for an audit endpoint
 *
 * @param tier - The audit tier (quick, standard, deep)
 * @returns Bazaar extension object for route config
 */
export function createAuditBazaarExtension(tier: AuditTier): Record<string, unknown> {
  const outputExample = getAuditOutputExample(tier);

  // Use declareDiscoveryExtension to create properly structured extension
  const extension = declareDiscoveryExtension({
    bodyType: "json",
    input: auditInputExample,
    inputSchema: {
      properties: auditInputSchema.properties,
      oneOf: auditInputSchema.oneOf,
      additionalProperties: auditInputSchema.additionalProperties,
    },
    output: {
      example: outputExample,
      schema: {
        properties: auditOutputSchema.properties,
        required: auditOutputSchema.required,
        additionalProperties: auditOutputSchema.additionalProperties,
      },
    },
  });

  return extension;
}

/**
 * Pre-built extensions for each tier (cached for performance)
 */
export const auditBazaarExtensions = {
  quick: createAuditBazaarExtension("quick"),
  standard: createAuditBazaarExtension("standard"),
  deep: createAuditBazaarExtension("deep"),
} as const;

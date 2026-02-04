# Design Document: x402scan Integration

## Overview

This design adds x402scan.com compatibility to x402guard by integrating the Bazaar discovery extension into the x402 middleware. The implementation adds input/output schemas to 402 responses and ownership verification to the discovery document, enabling x402guard to pass all x402scan validation checks.

## Steering Document Alignment

### Technical Standards (tech.md)
- Uses existing `@x402/extensions` package for Bazaar extension
- Follows x402 V2 protocol specification
- Maintains TypeScript type safety with existing API types

### Project Structure (structure.md)
- Schemas defined in `server/src/schemas/` (new directory)
- Middleware enhanced in existing `server/src/middleware/x402.ts`
- Discovery document enhanced in existing `server/src/routes/discovery.ts`

## Code Reuse Analysis

### Existing Components to Leverage
- **`server/src/middleware/x402.ts`**: Extend `createX402Middleware()` to include Bazaar extensions
- **`server/src/types/api.ts`**: Use existing `AuditRequest`, `AuditResponse` types as source of truth for schemas
- **`server/src/routes/discovery.ts`**: Enhance discovery document with ownership proofs
- **`@x402/extensions`**: Use `declareDiscoveryExtension()` and `bazaarResourceServerExtension`

### Integration Points
- **x402 Middleware**: Add `extensions` field to each route configuration
- **Discovery Document**: Add `ownershipProofs` array for verification
- **x402ResourceServer**: Register `bazaarResourceServerExtension`

## Architecture

The implementation adds a schema layer that generates JSON Schemas from TypeScript types and integrates them into the x402 payment middleware via the Bazaar extension.

```mermaid
graph TD
    subgraph "Schema Layer"
        TS[TypeScript Types<br/>api.ts] --> AS[Audit Schemas<br/>audit-schemas.ts]
        AS --> IS[Input Schema]
        AS --> OS[Output Schema]
    end

    subgraph "x402 Middleware"
        IS --> BE[Bazaar Extension]
        OS --> BE
        BE --> RC[Route Config<br/>extensions field]
        RC --> PM[paymentMiddleware]
    end

    subgraph "Discovery"
        DD[Discovery Document] --> OP[Ownership Proofs]
        OP --> EIP[EIP-712 Signature]
    end

    PM --> 402[402 Response<br/>with extensions.bazaar]
    DD --> WK[/.well-known/x402]
```

## Components and Interfaces

### Component 1: Audit Schemas (`server/src/schemas/audit-schemas.ts`)
- **Purpose:** Define JSON Schemas for audit API input/output
- **Interfaces:**
  ```typescript
  export const auditInputSchema: object;       // JSON Schema for POST body
  export const auditOutputSchema: object;      // JSON Schema for response
  export const auditInputExample: object;      // Example request
  export const auditOutputExample: object;     // Example response
  ```
- **Dependencies:** None (pure schema definitions)
- **Reuses:** Based on `AuditRequest`, `AuditResponse` from `types/api.ts`

### Component 2: Bazaar Extension Factory (`server/src/schemas/bazaar-extensions.ts`)
- **Purpose:** Create Bazaar discovery extensions for each audit endpoint
- **Interfaces:**
  ```typescript
  export function createAuditBazaarExtension(tier: AuditTier): Record<string, unknown>;
  ```
- **Dependencies:** `@x402/extensions`, `audit-schemas.ts`
- **Reuses:** `declareDiscoveryExtension()` from `@x402/extensions`

### Component 3: Enhanced x402 Middleware (`server/src/middleware/x402.ts`)
- **Purpose:** Add Bazaar extensions to route configurations
- **Interfaces:** Same as existing `createX402Middleware()`, now includes extensions
- **Dependencies:** `bazaar-extensions.ts`, `@x402/extensions`
- **Reuses:** Existing middleware structure, adds `extensions` field and registers extension

### Component 4: Ownership Proof Generator (`server/src/utils/ownership-proof.ts`)
- **Purpose:** Generate EIP-712 signatures for domain ownership verification
- **Interfaces:**
  ```typescript
  export function generateOwnershipProof(origin: string, privateKey: string): string;
  ```
- **Dependencies:** `viem` for EIP-712 signing
- **Reuses:** Existing viem dependency

### Component 5: Enhanced Discovery Document (`server/src/routes/discovery.ts`)
- **Purpose:** Add ownership proofs to discovery document
- **Interfaces:** Same endpoint, enhanced response
- **Dependencies:** `ownership-proof.ts`
- **Reuses:** Existing discovery route structure

## Data Models

### Input Schema (JSON Schema Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "skill_url": {
      "type": "string",
      "format": "uri",
      "description": "URL to fetch skill content from (HTTPS only)"
    },
    "skill_content": {
      "type": "string",
      "maxLength": 1048576,
      "description": "Raw skill content to audit"
    },
    "format": {
      "type": "string",
      "enum": ["json", "markdown"],
      "default": "json",
      "description": "Output format"
    }
  },
  "oneOf": [
    { "required": ["skill_url"] },
    { "required": ["skill_content"] }
  ]
}
```

### Output Schema (JSON Schema Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["risk_score", "risk_level", "recommendation", "findings", "audit_id", "timestamp", "tier"],
  "properties": {
    "risk_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "risk_level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    "recommendation": { "type": "string", "enum": ["SAFE", "CAUTION", "DANGEROUS", "BLOCKED"] },
    "findings": {
      "type": "object",
      "properties": {
        "malware": { "type": "array" },
        "credentials": { "type": "array" },
        "network": { "type": "array" },
        "permissions": { "type": "array" }
      }
    },
    "audit_id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "tier": { "type": "string", "enum": ["quick", "standard", "deep"] },
    "attestation": {
      "type": "object",
      "properties": {
        "signature": { "type": "string" },
        "signer": { "type": "string" },
        "chain": { "type": "string" }
      }
    }
  }
}
```

### Bazaar Extension Structure
```typescript
{
  bazaar: {
    info: {
      input: { skill_url: "https://example.com/skill.md" },
      output: { risk_score: 25, risk_level: "LOW", ... }
    },
    schema: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        input: { /* input schema */ },
        output: { /* output schema */ }
      }
    }
  }
}
```

### Discovery Document with Ownership
```typescript
{
  version: 1,
  resources: [...],
  instructions: "...",
  ownershipProofs: [
    {
      origin: "https://x402guard.xyz",
      signature: "0x...",  // EIP-712 signature
      address: "0xdc7f6ebefe62a402e7c75dd0b6d20ed7c4cb326a"
    }
  ]
}
```

## Error Handling

### Error Scenarios
1. **Missing private key for ownership proof**
   - **Handling:** Log warning, serve discovery document without ownership proofs
   - **User Impact:** Service appears "Unverified" on x402scan but still functional

2. **Invalid schema generation**
   - **Handling:** Schema modules have compile-time type checking
   - **User Impact:** Build fails if schemas don't match expected structure

3. **Extension registration failure**
   - **Handling:** Log error, fall back to basic x402 (no bazaar extension)
   - **User Impact:** Endpoints work but may fail x402scan schema validation

## Testing Strategy

### Unit Testing
- Test `auditInputSchema` validates correct inputs and rejects invalid ones
- Test `auditOutputSchema` validates actual API response structure
- Test `createAuditBazaarExtension()` produces valid extension objects
- Test `generateOwnershipProof()` creates valid EIP-712 signatures

### Integration Testing
- Test 402 response includes `extensions.bazaar` with correct structure
- Test discovery document includes `ownershipProofs` when configured
- Test `@x402/extensions` `validateDiscoveryExtension()` passes for generated extensions

### End-to-End Testing
- Manually test with x402scan Developer Hub Resource Preview
- Verify all validation checklist items pass:
  - Returns 402 ✓
  - x402 parses ✓
  - Has accepts ✓
  - Input schema ✓
  - Output schema ✓
  - Ownership verified ✓

## Implementation Notes

### Using `declareDiscoveryExtension()`
The `@x402/extensions` package provides `declareDiscoveryExtension()` which generates properly structured Bazaar extensions:

```typescript
import { declareDiscoveryExtension } from "@x402/extensions";

const extension = declareDiscoveryExtension({
  method: "POST",
  bodyType: "json",
  input: { skill_url: "https://example.com/skill.md" },
  inputSchema: {
    properties: {
      skill_url: { type: "string", format: "uri" },
      skill_content: { type: "string" },
      format: { type: "string", enum: ["json", "markdown"] }
    }
  },
  output: {
    example: { risk_score: 25, risk_level: "LOW", ... },
    schema: { /* output schema */ }
  }
});
```

### Registering Bazaar Extension
The `bazaarResourceServerExtension` must be registered with the x402 resource server to enrich the PaymentRequired response:

```typescript
import { bazaarResourceServerExtension } from "@x402/extensions";

x402Server.registerExtension(bazaarResourceServerExtension);
```

### Route Config Extensions
Each route config can include extensions that get merged into the 402 response:

```typescript
{
  "POST /audit/quick": {
    accepts: [...],
    description: "...",
    mimeType: "application/json",
    extensions: createAuditBazaarExtension("quick")
  }
}
```

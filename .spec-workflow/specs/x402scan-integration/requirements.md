# Requirements: x402scan Integration

## Introduction

Add x402guard to the x402scan.com developer hub and resource directory. x402scan is the official discovery platform for x402-enabled services, allowing AI agents and developers to find and verify x402 payment endpoints. Currently, x402guard endpoints fail x402scan validation due to missing input/output schemas in the payment-required response.

## Alignment with Product Vision

x402guard aims to be the trusted security auditing service for AI agent skills. Being discoverable on x402scan will:
- Increase visibility among AI agent developers
- Validate our x402 protocol compliance
- Enable automatic discovery by x402-compatible clients
- Establish trust through verified resource registration

## x402scan Validation Schema

x402scan validates against a stricter schema than the default x402 protocol to enable in-app resource invocation UI. The 402 response MUST conform to:

```typescript
type X402Response = {
    x402Version: 2,
    error?: string,
    accepts?: Array<Accepts>,
    resource?: Resource,
    extensions?: Extensions
}

type Accepts = {
    scheme: "exact",
    network: string,  // CAIP-2 format. Example for Base: "eip155:8453"
    amount: string,   // V2 uses "amount" instead of "maxAmountRequired"
    payTo: string,
    maxTimeoutSeconds: number,
    asset: string,
    extra: Record<string, any>  // Required in V2
}

type Resource = {
    url: string,
    description: string,
    mimeType: string
}

// Bazaar extension for discoverable APIs (x402scan uses this for UI)
type Extensions = {
    bazaar?: {
        info?: {
            input: any,   // Example request data
            output?: any  // Example response data
        },
        schema?: any      // JSON Schema for input/output validation
    }
}
```

## Requirements

### Requirement 1: x402 V2 Response Format Compliance

**User Story:** As an x402scan validator, I want x402guard 402 responses to follow the exact V2 schema, so that the endpoints pass validation and appear correctly in the UI.

#### Acceptance Criteria

1. WHEN a client sends a request without payment THEN the server SHALL return a 402 response with `x402Version: 2`
2. WHEN the response is parsed THEN the `accepts` array SHALL use `amount` field (not `maxAmountRequired`)
3. WHEN the response is parsed THEN each accepts entry SHALL include `extra: {}` (required in V2)
4. WHEN the response is parsed THEN it SHALL include a `resource` object with `url`, `description`, and `mimeType`
5. IF x402scan validates the response THEN the "x402 parses" check SHALL pass

### Requirement 2: Bazaar Extension with Input Schema

**User Story:** As an AI agent using x402scan, I want to see the expected input format, so that I can construct valid requests to x402guard.

#### Acceptance Criteria

1. WHEN the 402 response is returned THEN it SHALL include `extensions.bazaar` object
2. WHEN the bazaar extension is present THEN `info.input` SHALL contain example request data matching the POST body format
3. WHEN the bazaar extension is present THEN `schema` SHALL contain a valid JSON Schema for the input with:
   - `skill_url`: optional string (URL format)
   - `skill_content`: optional string (max length constraint)
   - `format`: optional enum `["json", "markdown"]` defaulting to `"json"`
4. IF x402scan validates the response THEN the "Input schema" check SHALL pass

### Requirement 3: Bazaar Extension with Output Schema

**User Story:** As an AI agent, I want to know the response structure before paying, so that I can plan how to process the audit results.

#### Acceptance Criteria

1. WHEN the bazaar extension is present THEN `info.output` SHALL contain example response data
2. WHEN the bazaar extension is present THEN `schema` SHALL describe the output with:
   - `risk_score`: number (0-100)
   - `risk_level`: enum `["LOW", "MEDIUM", "HIGH", "CRITICAL"]`
   - `recommendation`: enum `["SAFE", "CAUTION", "DANGEROUS", "BLOCKED"]`
   - `findings`: object with `malware`, `credentials`, `network`, `permissions` arrays
   - `audit_id`: string
   - `timestamp`: string (ISO8601)
   - `tier`: enum `["quick", "standard", "deep"]`
3. IF the tier is "deep" THEN the output schema SHALL document the optional `attestation` object
4. IF x402scan validates the response THEN the "Output schema" check SHALL pass

### Requirement 4: Ownership Verification

**User Story:** As the x402guard operator, I want to prove ownership of the payment address, so that x402scan marks the service as "Verified".

#### Acceptance Criteria

1. WHEN the discovery document is served at `/.well-known/x402` THEN it SHALL include an `ownershipProofs` array
2. WHEN a proof is provided THEN it SHALL be an EIP-712 signature of the origin URL using the `payTo` private key
3. IF x402scan validates the ownership proof THEN the service SHALL be marked as "Verified"
4. IF x402scan checks the "Ownership verified" box THEN the recovered address SHALL match the `payTo` address

### Requirement 5: Complete Validation Checklist Pass

**User Story:** As a developer using x402scan Developer Hub, I want all validation checks to pass for x402guard, so that I can trust the integration.

#### Acceptance Criteria

1. WHEN x402scan tests `/api/audit/quick` THEN all checklist items SHALL pass:
   - Returns 402 ✓
   - x402 parses ✓
   - Has accepts ✓
   - Input schema ✓
   - Output schema ✓
   - Ownership verified ✓
2. WHEN x402scan tests `/api/audit/standard` THEN all checklist items SHALL pass
3. WHEN x402scan tests `/api/audit/deep` THEN all checklist items SHALL pass
4. IF all checks pass THEN the endpoint status SHALL show success (not "ERR")

## Non-Functional Requirements

### Code Architecture and Modularity
- **Schema Definitions**: Input and output JSON schemas SHALL be defined in reusable TypeScript modules
- **Extension Configuration**: Bazaar extension SHALL be configured using `@x402/extensions` package
- **Type Safety**: Schema definitions SHALL be validated against existing TypeScript API types

### Performance
- Discovery document SHALL be served with caching headers (max-age 3600)
- Schema generation SHALL not add measurable latency to 402 responses

### Security
- Ownership proof signing SHALL use secure key management
- Private keys for signing SHALL never be committed to source control

### Compatibility
- Implementation SHALL use `@x402/extensions` package `declareDiscoveryExtension()` function
- Implementation SHALL follow x402 V2 protocol specification exactly
- 402 responses SHALL be compatible with `@x402/fetch` client automatic payment handling

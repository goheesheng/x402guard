# Requirements Document: Cryptographic Attestation

## Introduction

Currently, x402guard's "attestation" for deep scans is fake - it's just hex-encoded JSON that anyone can forge:

```javascript
// Current fake implementation
signature: `0x${Buffer.from(JSON.stringify({ audit_id, risk_score })).toString('hex')}`
```

This needs to be replaced with **real EIP-712 typed data signing** so that:
1. Attestations are cryptographically verifiable
2. No one can forge a scan result
3. Agents/services can trust the attestation without re-scanning

## Problem Statement

**Current state:** Anyone can create a fake attestation by encoding JSON to hex
**Required state:** Only x402guard's private key can sign valid attestations

## Alignment with Product Vision

x402guard aims to be the trusted security layer for AI agent skills. Trust requires cryptographic proof that:
- x402guard actually performed the scan
- The risk score hasn't been tampered with
- The attestation is tied to a specific skill URL and timestamp

## Requirements

### Requirement 1: EIP-712 Typed Data Signing

**User Story:** As a developer verifying a skill, I want attestations to be cryptographically signed so that I can verify x402guard actually performed the scan.

#### Acceptance Criteria

1. WHEN a deep scan completes THEN the server SHALL sign the audit result using EIP-712
2. The signed message SHALL include:
   - `audit_id` (string)
   - `skill_url` (string)
   - `risk_score` (uint8)
   - `risk_level` (string)
   - `timestamp` (uint256)
3. The signature SHALL be recoverable to x402guard's known public address
4. The domain separator SHALL include chain ID 8453 (Base mainnet)

### Requirement 2: Attestation Response Format

**User Story:** As a developer, I want a standardized attestation format so that I can verify it programmatically.

#### Acceptance Criteria

1. The attestation response SHALL include:
   ```json
   {
     "message": {
       "audit_id": "string",
       "skill_url": "string",
       "risk_score": "number",
       "risk_level": "string",
       "timestamp": "number"
     },
     "signature": "0x...",
     "signer": "0x...",
     "domain": {
       "name": "x402guard",
       "version": "1",
       "chainId": 8453
     }
   }
   ```
2. The signature SHALL be a valid EIP-712 signature (65 bytes, 0x-prefixed)

### Requirement 3: Verification Endpoint

**User Story:** As a developer, I want an endpoint to verify attestations so that I don't need to implement verification myself.

#### Acceptance Criteria

1. `POST /api/verify` SHALL accept an attestation object
2. The endpoint SHALL return:
   - `valid: true/false`
   - `signer: address` (recovered from signature)
   - `matches: true/false` (whether signer matches x402guard's known address)
3. The endpoint SHALL be free (no x402 payment required)

### Requirement 4: Server-Side Signing Configuration

**User Story:** As an operator, I want to configure signing keys securely so that attestations are valid.

#### Acceptance Criteria

1. The server SHALL support signing via environment variable `ATTESTATION_PRIVATE_KEY`
2. IF `ATTESTATION_PRIVATE_KEY` is not set THEN deep scans SHALL return attestation with `signature: null` and a warning
3. The corresponding public address SHALL be derivable and logged on startup

### Requirement 5: Backward Compatibility

**User Story:** As an existing user, I want the API to remain compatible so that my integrations don't break.

#### Acceptance Criteria

1. The `attestation` field structure SHALL be extended, not replaced
2. Quick and standard scans SHALL continue to NOT include attestations
3. All existing response fields SHALL remain unchanged

## Non-Functional Requirements

### Code Architecture and Modularity
- Signing logic SHALL be in a dedicated utility file (`src/utils/attestation.ts`)
- Verification logic SHALL be reusable for both endpoint and internal use
- Existing `ownership-proof.ts` patterns SHALL be followed

### Performance
- Signing SHALL complete in under 10ms
- Verification SHALL complete in under 5ms

### Security
- Private key SHALL only be loaded from environment variable
- Private key SHALL never be logged or exposed in responses
- Signing SHALL use viem library (already used in ownership-proof.ts)

### Dependencies
- viem (already in web app, needs to be added to server package.json)

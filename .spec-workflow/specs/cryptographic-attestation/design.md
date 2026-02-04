# Design Document: Cryptographic Attestation

## Overview

Implement real EIP-712 typed data signing for x402guard attestations. When a deep scan completes, the server signs the audit result with a private key, producing a cryptographically verifiable attestation.

## Code Reuse Analysis

### Existing Components to Leverage
- **`src/utils/ownership-proof.ts`**: Already uses viem for message signing - follow same patterns
- **`src/config/index.ts`**: Add new `ATTESTATION_PRIVATE_KEY` config variable
- **`src/routes/audit.ts`**: Modify to call new signing utility

### Integration Points
- **viem library**: Already used in ownership-proof.ts, need to add to server package.json
- **Audit response**: Extend existing `attestation` field structure

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Deep Scan Request                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    audit.ts handler                          │
│  1. Run audit (existing)                                     │
│  2. Call signAttestation() for deep tier                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              src/utils/attestation.ts (NEW)                  │
│                                                              │
│  signAttestation(auditResult, skillUrl)                     │
│    - Load private key from config                            │
│    - Create EIP-712 typed data                               │
│    - Sign with viem                                          │
│    - Return { message, signature, signer, domain }           │
│                                                              │
│  verifyAttestation(attestation)                             │
│    - Recover signer from signature                           │
│    - Compare with expected signer address                    │
│    - Return { valid, signer, matches }                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Attestation Response                       │
│  {                                                           │
│    message: { audit_id, skill_url, risk_score, ... },       │
│    signature: "0x...",                                       │
│    signer: "0x...",                                          │
│    domain: { name, version, chainId }                        │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Component 1: Attestation Utility (`src/utils/attestation.ts`)

**Purpose:** Sign and verify EIP-712 attestations

**Interfaces:**
```typescript
// EIP-712 Domain
const ATTESTATION_DOMAIN = {
  name: 'x402guard',
  version: '1',
  chainId: 8453,  // Base mainnet
} as const;

// EIP-712 Types
const ATTESTATION_TYPES = {
  Attestation: [
    { name: 'audit_id', type: 'string' },
    { name: 'skill_url', type: 'string' },
    { name: 'risk_score', type: 'uint8' },
    { name: 'risk_level', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
} as const;

// Sign function
async function signAttestation(
  auditResult: AuditResponse,
  skillUrl: string,
  privateKey: string
): Promise<Attestation>

// Verify function
async function verifyAttestation(
  attestation: Attestation
): Promise<VerificationResult>
```

**Dependencies:** viem, config

### Component 2: Config Extension (`src/config/index.ts`)

**Purpose:** Add attestation private key configuration

**Changes:**
```typescript
// Add to config schema
ATTESTATION_PRIVATE_KEY: z.string().optional(),
```

### Component 3: Audit Route Modification (`src/routes/audit.ts`)

**Purpose:** Call signing utility for deep scans

**Changes:**
- Import `signAttestation` from utils
- Replace fake attestation with real signature
- Handle missing private key gracefully

### Component 4: Verify Endpoint (`src/routes/verify.ts`)

**Purpose:** Free endpoint to verify attestations

**Interface:**
```typescript
// POST /api/verify
// Request body: Attestation object
// Response: { valid: boolean, signer: string, matches: boolean }
```

## Data Models

### Attestation Message
```typescript
interface AttestationMessage {
  audit_id: string;
  skill_url: string;
  risk_score: number;
  risk_level: string;
  timestamp: number;
}
```

### Full Attestation
```typescript
interface Attestation {
  message: AttestationMessage;
  signature: string;
  signer: string;
  domain: {
    name: string;
    version: string;
    chainId: number;
  };
}
```

### Verification Result
```typescript
interface VerificationResult {
  valid: boolean;
  signer: string;
  matches: boolean;
  error?: string;
}
```

## Error Handling

### Error Scenarios

1. **Missing ATTESTATION_PRIVATE_KEY**
   - **Handling:** Return attestation with `signature: null`, add warning field
   - **User Impact:** Deep scan works but attestation is not signed
   - **Response:**
     ```json
     {
       "attestation": {
         "message": { ... },
         "signature": null,
         "signer": null,
         "warning": "Attestation signing not configured"
       }
     }
     ```

2. **Invalid private key format**
   - **Handling:** Log error on startup, disable signing
   - **User Impact:** Same as missing key

3. **Verification of forged attestation**
   - **Handling:** Return `valid: false`, `matches: false`
   - **User Impact:** User knows attestation is invalid

## Testing Strategy

### Unit Testing
- Test `signAttestation()` produces valid signature
- Test `verifyAttestation()` correctly validates/rejects
- Test with missing private key returns null signature

### Integration Testing
- Test deep scan endpoint returns signed attestation
- Test `/api/verify` endpoint validates real attestation
- Test `/api/verify` rejects forged attestation

### Manual Testing
```bash
# 1. Run deep scan
curl -X POST https://x402guard.xyz/api/audit/deep \
  -H "Content-Type: application/json" \
  -d '{"skill_url": "https://example.com/skill.md"}'

# 2. Verify attestation
curl -X POST https://x402guard.xyz/api/verify \
  -H "Content-Type: application/json" \
  -d '{"message": {...}, "signature": "0x...", ...}'
```

# EIP-712 Cryptographic Attestation

x402guard uses EIP-712 typed structured data signing to create tamper-proof, verifiable attestations for deep scan results.

## What is EIP-712?

EIP-712 is an Ethereum standard for signing human-readable, structured data instead of raw bytes. It provides:

1. **Human-readable signatures** - Wallets can display exactly what you're signing
2. **Replay protection** - Domain separator prevents cross-chain and cross-app attacks
3. **Type safety** - Structured schema prevents malformed data
4. **Verifiability** - Anyone can verify the signature matches the signer

## How x402guard Uses EIP-712

### Domain Separator

Every attestation is bound to x402guard's domain:

```typescript
const ATTESTATION_DOMAIN = {
  name: "x402guard",    // Application name
  version: "1",         // Version
  chainId: 8453,        // Base mainnet
};
```

The `chainId: 8453` ensures attestations are specific to Base mainnet and cannot be replayed on other chains.

### Typed Data Structure

The attestation message contains:

```typescript
const ATTESTATION_TYPES = {
  Attestation: [
    { name: "audit_id", type: "string" },      // Unique audit identifier
    { name: "skill_url", type: "string" },     // URL of audited skill
    { name: "risk_score", type: "uint8" },     // 0-100 risk score
    { name: "risk_level", type: "string" },    // LOW/MEDIUM/HIGH/CRITICAL
    { name: "timestamp", type: "uint256" },    // Unix timestamp
  ],
};
```

### Signing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Deep Scan Request                            │
│                    (User pays $0.10 USDC)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Audit Engine                                  │
│         Runs YARA scan, permission analysis, sandbox             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 signAttestation()                                │
│                                                                  │
│  1. Create structured message from audit result                  │
│  2. Load signing key from ATTESTATION_PRIVATE_KEY                │
│  3. Create EIP-712 typed data hash:                              │
│     hash = keccak256(domain || types || message)                 │
│  4. Sign with ECDSA (secp256k1 curve)                            │
│  5. Return 65-byte signature (r, s, v)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Attestation Response                             │
│                                                                  │
│  {                                                               │
│    message: {                                                    │
│      audit_id: "abc123",                                         │
│      skill_url: "https://example.com/skill.md",                  │
│      risk_score: 25,                                             │
│      risk_level: "LOW",                                          │
│      timestamp: 1707024000                                       │
│    },                                                            │
│    signature: "0xfdff0aba...1b",                                 │
│    signer: "0x12FCed65536f4F19757b56d276172c177Bf53C01",         │
│    domain: { name: "x402guard", version: "1", chainId: 8453 }    │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Verifying Attestations

### Via API

Anyone can verify an attestation using the free `/api/verify` endpoint:

```bash
curl -X POST https://x402guard.xyz/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "audit_id": "abc123",
      "skill_url": "https://example.com/skill.md",
      "risk_score": 25,
      "risk_level": "LOW",
      "timestamp": 1707024000
    },
    "signature": "0xfdff0aba...",
    "signer": "0x12FCed65536f4F19757b56d276172c177Bf53C01",
    "domain": {
      "name": "x402guard",
      "version": "1",
      "chainId": 8453
    }
  }'
```

Response:
```json
{
  "verification": {
    "valid": true,
    "signer": "0x12FCed65536f4F19757b56d276172c177Bf53C01",
    "expectedSigner": null,
    "matches": true
  }
}
```

### Via JavaScript (viem)

```typescript
import { verifyTypedData } from 'viem';

const isValid = await verifyTypedData({
  address: attestation.signer,
  domain: {
    name: "x402guard",
    version: "1",
    chainId: 8453,
  },
  types: {
    Attestation: [
      { name: "audit_id", type: "string" },
      { name: "skill_url", type: "string" },
      { name: "risk_score", type: "uint8" },
      { name: "risk_level", type: "string" },
      { name: "timestamp", type: "uint256" },
    ],
  },
  primaryType: "Attestation",
  message: {
    audit_id: attestation.message.audit_id,
    skill_url: attestation.message.skill_url,
    risk_score: attestation.message.risk_score,
    risk_level: attestation.message.risk_level,
    timestamp: BigInt(attestation.message.timestamp),
  },
  signature: attestation.signature,
});

console.log("Signature valid:", isValid);
```

### Via Smart Contract (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AttestationVerifier {
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId)"
    );

    bytes32 public constant ATTESTATION_TYPEHASH = keccak256(
        "Attestation(string audit_id,string skill_url,uint8 risk_score,string risk_level,uint256 timestamp)"
    );

    bytes32 public immutable DOMAIN_SEPARATOR;
    address public immutable x402guardSigner;

    constructor(address _signer) {
        x402guardSigner = _signer;
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256("x402guard"),
            keccak256("1"),
            8453 // Base mainnet
        ));
    }

    function verifyAttestation(
        string memory audit_id,
        string memory skill_url,
        uint8 risk_score,
        string memory risk_level,
        uint256 timestamp,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 structHash = keccak256(abi.encode(
            ATTESTATION_TYPEHASH,
            keccak256(bytes(audit_id)),
            keccak256(bytes(skill_url)),
            risk_score,
            keccak256(bytes(risk_level)),
            timestamp
        ));

        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            structHash
        ));

        address recovered = ecrecover(digest, signature);
        return recovered == x402guardSigner;
    }
}
```

## Security Properties

### What EIP-712 Guarantees

1. **Authenticity** - Only x402guard's signing key can create valid signatures
2. **Integrity** - Changing ANY field invalidates the signature
3. **Non-repudiation** - x402guard cannot deny creating an attestation it signed
4. **Chain-specificity** - Attestations are bound to Base mainnet (chainId 8453)

### What EIP-712 Does NOT Guarantee

1. **Correctness** - The attestation proves x402guard signed it, not that the audit was correct
2. **Freshness** - The timestamp is self-reported; verify it's recent
3. **Availability** - x402guard could stop signing new attestations

## Use Cases

### 1. Proof of Audit

AI agents can prove to users that a skill was scanned by x402guard before installation:

```
"This skill was audited by x402guard on 2026-02-04.
Risk Score: 25/100 (LOW)
Attestation: 0xfdff0aba... [Verify]"
```

### 2. On-Chain Verification

Smart contracts can verify attestations before allowing skill installations:

```solidity
require(verifier.verifyAttestation(...), "Invalid attestation");
require(risk_score <= 50, "Risk too high");
```

### 3. Trust Networks

Other security services can trust x402guard's risk assessments:

```
If x402guard says risk_score <= 25:
  → Auto-approve skill installation

If x402guard says risk_score > 75:
  → Block installation
```

### 4. Audit Trails

Organizations can require cryptographic proof of security scans:

```
Compliance Report:
- Skill: weather-api
- Scanned: 2026-02-04
- Risk: LOW (25/100)
- Attestation: 0xfdff... (verified)
```

## Configuration

### Server Setup

To enable attestation signing, set the environment variable:

```bash
ATTESTATION_PRIVATE_KEY=0x...  # Your signing private key
```

The derived public address will be used as the signer in all attestations.

### Verifying the Official Signer

x402guard's official attestation signer address is published at:

- **Website:** https://x402guard.xyz (shown in deep scan results)
- **BaseScan:** Link provided in attestation response

Always verify attestations against the official signer address to ensure authenticity.

## Related Documentation

- [API Reference](./API_REFERENCE.md) - Full API documentation
- [Risk Scoring](./RISK_SCORING.md) - How risk scores are calculated
- [Security Layers](./SECURITY_LAYERS.md) - Multi-layer security analysis

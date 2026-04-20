# API Reference

## Base URL

- **Production:** `https://x402guard.xyz/api`
- **Local:** `http://localhost:3007/api`

## Authentication

### x402 Payment (production)

Every scan requires payment via [x402 protocol](https://x402.org) (USDC on Base mainnet). The first request returns HTTP 402 with payment requirements. Use `@x402/fetch` to handle payment automatically:

```ts
import { wrapFetchWithPayment } from '@x402/fetch';

const paidFetch = wrapFetchWithPayment(fetch, x402Client);
const response = await paidFetch('https://x402guard.xyz/api/audit/quick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ skill_content: '...' }),
});
```

### ACP Secret (local testing / internal)

For local development, set `ACP_INTERNAL_SECRET` env var and pass it as a header:

```bash
curl -H "X-ACP-Secret: your-secret" ...
```

### Free Cache Hits

Repeat scans of identical content are free. The cache checks the SHA-256 hash of the skill content before payment. TTL: quick=24h, standard=12h, deep=1h.

---

## Endpoints

### GET /api/health

Health check. Always free.

```bash
curl https://x402guard.xyz/api/health
```

Response:
```json
{ "status": "ok", "version": "1.0.0", "uptime": 3600 }
```

---

### POST /api/audit/quick

Quick scan. $0.10 USDC.

YARA malware scan + install hook detection + secret access detection + exfiltration detection + prompt injection detection.

**Request:**
```json
{
  "skill_content": "# My Skill\n...",
  "skill_url": "https://example.com/skill.md"
}
```

Provide either `skill_content` (raw text) or `skill_url` (HTTPS URL to fetch). Not both.

**Response:**
```json
{
  "risk_score": 0,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "gate_decision": "allow",
  "findings": {
    "malware": [],
    "credentials": [],
    "network": [],
    "permissions": []
  },
  "audit_id": "abc123def456",
  "timestamp": "2026-04-20T12:00:00Z",
  "tier": "quick",
  "attestation": {
    "message": {
      "audit_id": "abc123def456",
      "skill_url": "inline-content",
      "risk_score": 0,
      "risk_level": "LOW",
      "timestamp": 1776600000
    },
    "signature": "0x...",
    "signer": "0x...",
    "domain": { "name": "x402guard", "version": "1", "chainId": 8453 }
  }
}
```

---

### POST /api/audit/standard

Standard scan. $0.50 USDC.

Everything in quick + permission analysis + network call detection.

Same request/response format as `/audit/quick`.

---

### POST /api/audit/deep

Deep scan. $1.00 USDC.

Everything in standard + detailed analysis.

Same request/response format as `/audit/quick`.

---

### POST /api/verify

Verify an attestation signature. Always free.

**Request:** Pass the full `attestation` object from a scan response.

```json
{
  "message": {
    "audit_id": "abc123def456",
    "skill_url": "inline-content",
    "risk_score": 0,
    "risk_level": "LOW",
    "timestamp": 1776600000
  },
  "signature": "0x...",
  "signer": "0x...",
  "domain": { "name": "x402guard", "version": "1", "chainId": 8453 }
}
```

**Response:**
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

Optional query parameter: `?expected_signer=0x...` to verify against a specific address.

---

### GET /api/pricing

Pricing info. Always free.

```json
{
  "quick": { "price": "$0.10", "description": "YARA scan only" },
  "standard": { "price": "$0.50", "description": "YARA + permissions + network analysis" },
  "deep": { "price": "$1.00", "description": "Full analysis + detailed report" }
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `risk_score` | number (0-100) | Overall risk score |
| `risk_level` | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` | Risk classification |
| `recommendation` | `SAFE` \| `CAUTION` \| `DANGEROUS` \| `BLOCKED` | Human-readable recommendation |
| `gate_decision` | `allow` \| `warn` \| `deny` | Machine-readable gate decision for install flow |
| `findings.malware` | array | YARA matches + scanner findings |
| `findings.credentials` | array | Credential access detections |
| `findings.network` | array | Suspicious network calls |
| `findings.permissions` | array | Permission analysis results |
| `audit_id` | string | Unique scan identifier |
| `attestation` | object | EIP-712 signed attestation (all tiers) |

## Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 400 | `MISSING_CONTENT` | Neither skill_url nor skill_content provided |
| 400 | `FETCH_ERROR` | Failed to fetch skill from URL |
| 402 | — | Payment required (x402) |
| 403 | `SSRF_BLOCKED` | URL resolves to private IP |
| 413 | `SKILL_TOO_LARGE` | Content exceeds 1MB limit |

## Network

- **Chain:** Base mainnet (eip155:8453)
- **Asset:** USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Protocol:** [x402](https://x402.org)

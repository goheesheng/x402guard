# API Reference

Complete API documentation for x402guard.

## Base URL

- **Production**: `https://x402guard.xyz`
- **Self-hosted**: Your deployment URL

## Authentication

x402guard uses [x402](https://x402.org) for payment authentication. Include the `X-Payment` header with a valid x402 payment token.

## Endpoints

### Skill Document (skill.md)

```
GET /api/skill.md
```

Free endpoint returning the SKILL.md teaching document for AI agents.

**Response:** `text/markdown`

```markdown
---
name: x402guard
description: Pre-install security scanning for AI agent skills
version: 1.0.0
metadata:
  openclaw:
    requires:
      env: [WALLET_PRIVATE_KEY]
---

# x402guard - Security Scanning for AI Skills
...
```

---

### Skill Metadata (skill.json)

```
GET /api/skill.json
```

Free endpoint returning structured skill metadata as JSON.

**Response:**
```json
{
  "name": "x402guard",
  "description": "Pre-install security scanning for AI agent skills...",
  "version": "1.0.0",
  "author": "x402guard",
  "homepage": "https://x402guard.xyz",
  "metadata": {
    "openclaw": {
      "requires": {
        "env": ["WALLET_PRIVATE_KEY"],
        "bins": []
      }
    }
  },
  "endpoints": {
    "audit_quick": {
      "method": "POST",
      "path": "/api/audit/quick",
      "description": "Quick YARA malware scan ($0.01 USDC)",
      "price_usdc": "0.01",
      "requires_payment": true
    }
  },
  "pricing": {
    "network": "Base Mainnet (eip155:8453)",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "asset_name": "USDC",
    "decimals": 6,
    "tiers": {
      "quick": "0.01",
      "standard": "0.05",
      "deep": "0.10"
    }
  }
}
```

---

### Health Check

```
GET /api/health
```

Free endpoint to check API status.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600
}
```

---

### Pricing Info

```
GET /api/pricing
```

Free endpoint returning current pricing.

**Response:**
```json
{
  "tiers": [
    {
      "name": "quick",
      "price": "10000",
      "priceUSD": 0.01,
      "features": ["YARA malware scanning", "Risk score", "Recommendation"]
    },
    {
      "name": "standard",
      "price": "50000",
      "priceUSD": 0.05,
      "features": ["All Quick features", "Permission analysis", "Network call detection"]
    },
    {
      "name": "deep",
      "price": "100000",
      "priceUSD": 0.10,
      "features": ["All Standard features", "Behavioral sandbox", "Signed attestation"]
    }
  ],
  "network": "eip155:8453",
  "asset": "USDC"
}
```

---

### Root Info

```
GET /
```

Returns API information and pricing.

**Response:**
```json
{
  "name": "x402guard API",
  "version": "1.0.0",
  "description": "x402-powered security auditing for AI agent skills",
  "endpoints": {
    "free": ["/api/health", "/api/pricing"],
    "paid": {
      "/api/audit/quick": { "price": "$0.01", "description": "YARA malware scan" },
      "/api/audit/standard": { "price": "$0.05", "description": "Full analysis + permissions + network" },
      "/api/audit/deep": { "price": "$0.10", "description": "Complete audit + behavioral sandbox" }
    }
  },
  "payment": {
    "network": "eip155:8453",
    "facilitator": "https://api.cdp.coinbase.com/platform/v2/x402",
    "payTo": "0x..."
  }
}
```

---

### Quick Audit

```
POST /api/audit/quick
```

**Price:** $0.01 USDC

Fast YARA-based malware scan.

**Request:**
```json
{
  "skill_url": "https://clawdhub.com/skills/weather",
  "skill_content": "optional raw content"
}
```

**Note:** Provide either `skill_url` OR `skill_content`, not both.

**Response:**
```json
{
  "risk_score": 12,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "permissions": [],
    "network": [],
    "credentials": []
  },
  "audit_id": "aud_abc123",
  "timestamp": "2026-01-31T10:30:00Z",
  "tier": "quick"
}
```

---

### Standard Audit

```
POST /api/audit/standard
```

**Price:** $0.05 USDC

Full analysis including permissions and network calls.

Same request/response format as Quick Audit, with more detailed findings.

---

### Deep Audit

```
POST /api/audit/deep
```

**Price:** $0.10 USDC

Complete audit with behavioral sandbox analysis and EIP-712 signed attestation.

**Response includes:**
```json
{
  "risk_score": 12,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": { ... },
  "audit_id": "aud_abc123",
  "timestamp": "2026-01-31T10:30:00Z",
  "tier": "deep",
  "attestation": {
    "message": {
      "audit_id": "aud_abc123",
      "skill_url": "https://example.com/skill.md",
      "risk_score": 12,
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
  }
}
```

---

### Verify Attestation

```
POST /api/verify
```

**Price:** Free

Verify an EIP-712 signed attestation from a deep scan.

**Request:**
```json
{
  "message": {
    "audit_id": "aud_abc123",
    "skill_url": "https://example.com/skill.md",
    "risk_score": 12,
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
  },
  "attestation": {
    "audit_id": "aud_abc123",
    "skill_url": "https://example.com/skill.md",
    "risk_score": 12,
    "risk_level": "LOW",
    "timestamp": 1707024000
  }
}
```

**Query Parameters:**
- `expected_signer` (optional): Address to verify the signature against
```

---

## Types

### Risk Levels

| Level | Score Range | Meaning |
|-------|-------------|---------|
| `LOW` | 0-25 | Minimal risk detected |
| `MEDIUM` | 26-50 | Some concerns, review recommended |
| `HIGH` | 51-75 | Significant risk, caution advised |
| `CRITICAL` | 76-100 | Severe risk, do not install |

### Recommendations

| Value | Action |
|-------|--------|
| `SAFE` | Safe to install |
| `CAUTION` | Review findings before installing |
| `DANGEROUS` | Do not install without review |
| `BLOCKED` | Malware detected, do not install |

### Finding Types

- **malware**: YARA rule matches (credential stealers, backdoors, etc.)
- **permissions**: File/network/system access patterns
- **network**: External network calls detected
- **credentials**: Access to sensitive files (.aws, .ssh, etc.)

## Error Responses

### 402 Payment Required

```json
{
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "maxAmountRequired": "50000",
      "payTo": "0x...",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    }
  ],
  "error": "Payment Required"
}
```

### 400 Bad Request

```json
{
  "error": "Invalid request",
  "details": "Must provide either skill_url or skill_content"
}
```

### 500 Server Error

```json
{
  "error": "Internal server error",
  "message": "Please try again later"
}
```

## Rate Limits

- 100 requests per minute per IP (free endpoints)
- No limits on paid endpoints (rate limited by payment)

## Next Steps

- [SDK Reference](./SDK_REFERENCE.md) - X402GuardClient documentation
- [Detection Rules](./DETECTION_RULES.md) - What patterns are detected
- [Risk Scoring](./RISK_SCORING.md) - How scores are calculated

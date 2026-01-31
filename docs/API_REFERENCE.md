# API Reference

Complete API documentation for SkillGuard.

## Base URL

- **Production**: `https://skillguard-api.vercel.app`
- **Self-hosted**: Your deployment URL

## Authentication

SkillGuard uses [x402](https://x402.org) for payment authentication. Include the `X-Payment` header with a valid x402 payment token.

## Endpoints

### Health Check

```
GET /health
```

Free endpoint to check API status.

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
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
  "name": "SkillGuard API",
  "version": "0.1.0",
  "description": "x402-powered security auditing for AI agent skills",
  "endpoints": {
    "free": ["/health"],
    "paid": {
      "/audit/quick": { "price": "$0.05", "description": "YARA malware scan" },
      "/audit/standard": { "price": "$0.15", "description": "Full analysis + permissions + network" },
      "/audit/deep": { "price": "$0.50", "description": "Complete audit + behavioral sandbox" }
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
POST /audit/quick
```

**Price:** $0.05 USDC

Fast YARA-based malware scan.

**Request:**
```json
{
  "skill_url": "https://clawdhub.com/skills/weather",
  "skill_content": "optional raw content"
}
```

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
POST /audit/standard
```

**Price:** $0.15 USDC

Full analysis including permissions and network calls.

Same request/response format as Quick Audit, with more detailed findings.

---

### Deep Audit

```
POST /audit/deep
```

**Price:** $0.50 USDC

Complete audit with behavioral sandbox analysis and signed attestation.

**Response includes:**
```json
{
  "...": "same as standard",
  "attestation": {
    "signature": "0x...",
    "signer": "0x...",
    "chain": "base"
  }
}
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

```json
{
  "error": "Payment required",
  "code": "PAYMENT_REQUIRED",
  "details": "Include X-Payment header with valid x402 token"
}
```

## Rate Limits

- 100 requests per minute per IP
- No limits on paid endpoints (rate limited by payment)

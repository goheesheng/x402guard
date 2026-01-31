# Technical Steering - SkillGuard API

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SkillGuard API                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │ x402 Layer  │───▶│   Router    │───▶│    Audit Engine         │ │
│  │ (payments)  │    │  (Express)  │    │  ┌───────────────────┐  │ │
│  └─────────────┘    └─────────────┘    │  │  Skill Parser     │  │ │
│         │                  │           │  │  YARA Scanner     │  │ │
│         ▼                  ▼           │  │  Permission Anal. │  │ │
│  ┌─────────────┐    ┌─────────────┐    │  │  Network Detector │  │ │
│  │ Facilitator │    │   Tier      │    │  │  Risk Calculator  │  │ │
│  │   (CDP)     │    │  Manager    │    │  └───────────────────┘  │ │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Runtime
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | Node.js 20+ | x402 SDK native |
| Framework | Express.js | x402 middleware |
| Language | TypeScript | Type safety |

### x402 Integration
| Package | Purpose |
|---------|---------|
| @x402/express | Payment middleware |
| @x402/core | Payment types |
| @x402/evm | Base network |

### Security Analysis
| Component | Technology |
|-----------|------------|
| YARA Engine | yara-js |
| Markdown Parsing | unified/remark |
| Code Analysis | esprima |

## API Design

### Endpoints
```
POST /audit     - Audit a skill (x402 gated)
GET /health     - Service status (free)
GET /pricing    - Tier information (free)
```

### Request Schema
```typescript
interface AuditRequest {
  skill_url?: string;
  skill_content?: string;
  tier?: "quick" | "standard" | "deep";
}
```

### Response Schema
```typescript
interface AuditResponse {
  risk_score: number;        // 0-100
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation: "SAFE" | "CAUTION" | "DANGEROUS" | "BLOCKED";
  findings: {
    malware: YaraMatch[];
    credentials: CredentialAccess[];
    network: NetworkCall[];
    permissions: Permission[];
  };
  audit_id: string;
  timestamp: string;
  tier: string;
}
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Quick latency | <500ms |
| Standard latency | <2s |
| Deep latency | <10s |
| Concurrent audits | 100 |

## Security Controls

- Input sanitization
- Content size limits (1MB)
- Rate limiting
- No code execution outside sandbox
- No content persistence

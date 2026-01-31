# Agent Integration Guide

Integrate x402guard with your AI agent framework.

## OpenClaw Integration

Add pre-install security checks to OpenClaw skill installation:

```typescript
import { X402GuardClient } from 'x402guard-client';

const x402guard = new X402GuardClient({
  privateKey: process.env.AGENT_WALLET_KEY!,
});

// Before installing any skill
async function safeInstallSkill(skillUrl: string) {
  // 1. Audit the skill first
  const audit = await x402guard.auditSkill({
    skillUrl,
    tier: 'standard',
  });

  // 2. Check recommendation
  if (audit.recommendation === 'BLOCKED') {
    throw new Error(`Skill blocked: ${audit.findings.malware[0]?.description}`);
  }

  if (audit.recommendation === 'DANGEROUS') {
    console.warn('⚠️ Dangerous skill detected:', audit.findings);
    // Require human approval
    return { requiresApproval: true, audit };
  }

  // 3. Safe to install
  console.log(`✅ Skill safe (score: ${audit.risk_score}/100)`);
  return { safe: true, audit };
}
```

## LangChain Integration

```typescript
import { X402GuardClient } from 'x402guard-client';
import { Tool } from 'langchain/tools';

const x402guard = new X402GuardClient({
  privateKey: process.env.AGENT_WALLET_KEY!,
});

// Create a tool for skill auditing
const auditTool = new Tool({
  name: 'audit_skill',
  description: 'Audit an AI skill for security issues before installation',
  func: async (skillUrl: string) => {
    const result = await x402guard.auditSkill({ skillUrl, tier: 'standard' });
    return JSON.stringify({
      safe: result.recommendation === 'SAFE',
      risk_score: result.risk_score,
      recommendation: result.recommendation,
      issues: result.findings.malware.length + result.findings.credentials.length,
    });
  },
});
```

## AutoGPT Plugin

```python
# Python wrapper (coming soon)
# pip install x402guard

from x402guard import X402GuardClient

client = X402GuardClient(
    api_url="https://x402guard.vercel.app",
    private_key=os.environ["AGENT_WALLET_KEY"],
)

result = client.audit_skill(
    skill_url="https://clawdhub.com/skills/weather",
    tier="standard",
)

if result.recommendation == "SAFE":
    print("✅ Safe to install")
```

## Webhook Integration

Set up a webhook to audit skills automatically:

```typescript
import { X402GuardClient } from 'x402guard-client';

const x402guard = new X402GuardClient({
  privateKey: process.env.SERVICE_WALLET_KEY!,
});

// In your skill marketplace backend
app.post('/skills/install', async (req, res) => {
  const { skillUrl, userId } = req.body;

  // Audit before allowing installation
  const audit = await x402guard.auditSkill({ skillUrl, tier: 'quick' });

  if (audit.risk_score > 50) {
    return res.status(403).json({
      error: 'Skill failed security audit',
      risk_score: audit.risk_score,
      findings: audit.findings,
    });
  }

  // Proceed with installation
  await installSkill(skillUrl, userId);
  res.json({ success: true, audit_id: audit.audit_id });
});
```

## ClawdHub Integration

Auto-scan skills on publish:

```typescript
import { X402GuardClient } from 'x402guard-client';

const x402guard = new X402GuardClient({
  privateKey: process.env.PLATFORM_WALLET_KEY!,
});

// Webhook handler for skill publications
app.post('/webhook/skill-published', async (req, res) => {
  const { skillUrl, authorId } = req.body;

  const audit = await x402guard.auditSkill({
    skillUrl,
    tier: 'standard',
  });

  if (audit.recommendation === 'BLOCKED') {
    // Unpublish and notify author
    await unpublishSkill(skillUrl);
    await notifyAuthor(authorId, {
      message: 'Skill blocked due to security concerns',
      findings: audit.findings,
      audit_id: audit.audit_id,
    });
  } else {
    // Add trust badge based on risk score
    await addTrustBadge(skillUrl, {
      score: audit.risk_score,
      level: audit.risk_level,
      audit_id: audit.audit_id,
    });
  }

  res.json({ processed: true });
});
```

## Trustline Integration (Future)

Feed x402guard attestations into Trustline VAN:

```typescript
// Future integration concept
const audit = await x402guard.deepAudit(skillUrl);

// Include attestation in payment context
const paymentContext = {
  amount: '50.00',
  merchant: 'api.example.com',
  skill_audit: {
    audit_id: audit.audit_id,
    risk_score: audit.risk_score,
    recommendation: audit.recommendation,
    attestation: audit.attestation, // Signed by x402guard
  },
};

// VAN considers skill audit when evaluating
const result = await trustline.evaluate(paymentContext);
```

## Best Practices

1. **Always audit before install** - Don't skip audits for "trusted" sources
2. **Use appropriate tier** - Quick for fast checks, Standard for production, Deep for critical skills
3. **Log audit results** - Keep audit IDs for compliance/debugging
4. **Handle failures gracefully** - Network issues shouldn't block your agent
5. **Cache results** - Same skill URL = same result (for a reasonable time)
6. **Set thresholds** - Define what risk scores are acceptable for your use case

## Handling Different Recommendations

```typescript
async function handleAuditResult(result: AuditResult) {
  switch (result.recommendation) {
    case 'SAFE':
      // Proceed with installation
      return { install: true };

    case 'CAUTION':
      // Log for review, but allow if score is low
      if (result.risk_score < 30) {
        console.log('Low risk, proceeding with caution');
        return { install: true, review: true };
      }
      return { install: false, needsReview: true };

    case 'DANGEROUS':
      // Require explicit approval
      await notifySecurityTeam(result);
      return { install: false, blocked: true, reason: 'HIGH_RISK' };

    case 'BLOCKED':
      // Never install
      console.error('Malware detected:', result.findings.malware);
      return { install: false, blocked: true, reason: 'MALWARE' };
  }
}
```

## Next Steps

- [SDK Reference](./SDK_REFERENCE.md) - Complete X402GuardClient API
- [Detection Rules](./DETECTION_RULES.md) - What patterns are detected
- [The Problem](./PROBLEM.md) - Why skill security matters

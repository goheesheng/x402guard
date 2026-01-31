# Agent Integration Guide

Integrate SkillGuard with your AI agent framework.

## OpenClaw Integration

Add pre-install security checks to OpenClaw skill installation:

```typescript
import { SkillGuardClient } from 'skillguard-client';

const skillguard = new SkillGuardClient({
  privateKey: process.env.AGENT_WALLET_KEY!,
});

// Before installing any skill
async function safeInstallSkill(skillUrl: string) {
  // 1. Audit the skill first
  const audit = await skillguard.auditSkill({
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
import { SkillGuardClient } from 'skillguard-client';
import { Tool } from 'langchain/tools';

const skillguard = new SkillGuardClient({
  privateKey: process.env.AGENT_WALLET_KEY!,
});

// Create a tool for skill auditing
const auditTool = new Tool({
  name: 'audit_skill',
  description: 'Audit an AI skill for security issues before installation',
  func: async (skillUrl: string) => {
    const result = await skillguard.auditSkill({ skillUrl, tier: 'standard' });
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
# pip install skillguard

from skillguard import SkillGuardClient

client = SkillGuardClient(
    api_url="https://skillguard-api.vercel.app",
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
// In your skill marketplace backend
app.post('/skills/install', async (req, res) => {
  const { skillUrl, userId } = req.body;
  
  // Audit before allowing installation
  const audit = await skillguard.auditSkill({ skillUrl, tier: 'quick' });
  
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

## Best Practices

1. **Always audit before install** - Don't skip audits for "trusted" sources
2. **Use appropriate tier** - Quick for fast checks, Deep for critical skills
3. **Log audit results** - Keep audit IDs for compliance/debugging
4. **Handle failures gracefully** - Network issues shouldn't block your agent
5. **Cache results** - Same skill URL = same result (for a reasonable time)

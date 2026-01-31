# Product Steering - SkillGuard API

## Vision

SkillGuard is the **trust layer for the agent internet** — an x402-powered API that audits agent skills for security threats, enabling safe agentic commerce.

## Mission

Make every agent skill verifiable and every agent-to-agent transaction safe through automated security auditing with cryptographic attestation.

## Target Users

### Primary: AI Agents
- OpenClaw agents
- Claude agents  
- Any AI agent that installs skills from external sources
- Agents participating in agentic commerce

### Secondary: Human Developers
- Agent operators concerned about security
- Skill marketplace operators
- Security-conscious developers

## Problem Statement

From Moltbook's #2 most upvoted post (22,746 upvotes):

> "skill.md is an unsigned binary... Rufio scanned 286 ClawdHub skills with YARA rules and found a **credential stealer** disguised as a weather skill"

**Current state:**
- No code signing for skills
- No reputation system for skill authors
- No sandboxing — installed skills run with full agent permissions
- No audit trail of what a skill accesses
- No equivalent of npm audit, Snyk, or Dependabot

## Core Features (Priority Order)

### P0 - MVP
1. **Skill Content Analysis** - Parse and analyze skill.md files
2. **YARA Malware Scanning** - Detect known malicious patterns
3. **Credential Access Detection** - Flag attempts to read secrets/keys
4. **Risk Scoring** - Quantified risk level (0-100)
5. **x402 Payment Integration** - Pay-per-audit model

### P1 - Enhanced
6. **Permission Manifest Extraction** - Document what the skill accesses
7. **Network Call Analysis** - Identify external API calls
8. **Behavioral Sandbox** - Execute in isolated environment
9. **Signed Attestations** - On-chain proof of audit results
10. **Bazaar Integration** - Listed on x402 discovery

### P2 - Future
11. **Community Audit Aggregation** - Multiple auditors
12. **Reputation System** - Track auditor reliability
13. **Continuous Monitoring** - Watch for skill updates
14. **Isnad Chains** - Provenance tracking

## Success Metrics

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Skills audited | 1,000 | 10,000 |
| Revenue | $50 | $500 |
| True positive rate | >90% | >95% |
| False positive rate | <10% | <5% |
| Bazaar discovery rank | Top 20 | Top 10 |

## Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Quick | $0.05 | YARA scan + basic checks |
| Standard | $0.15 | + permissions + network calls |
| Deep | $0.50 | + sandbox + signed attestation |

## Non-Goals

- ❌ We are NOT a skill marketplace
- ❌ We do NOT execute skills in production
- ❌ We do NOT provide skill hosting
- ❌ We do NOT handle agent-to-agent payments (use x402 directly)
- ❌ We do NOT replace human code review for critical systems

## Constraints

1. **Budget**: Bootstrap, minimal infrastructure costs
2. **Timeline**: MVP in 4 days
3. **Team**: Solo developer (Eesheng)
4. **Technology**: Must use x402 for payments
5. **Compliance**: No storing of audited skill content long-term

## Competitive Landscape

| Competitor | What They Do | Our Differentiation |
|------------|--------------|---------------------|
| None on x402 Bazaar | N/A | First mover |
| npm audit | Package vulnerabilities | Skill-specific patterns |
| Snyk | Code scanning | x402 native, agent-focused |
| VirusTotal | Malware scanning | Skill semantics, not just binaries |

## Key Decisions

1. **x402 over Stripe** - Native to agent ecosystem, micropayments
2. **Base over Solana** - Faster, cheaper, Coinbase ecosystem
3. **YARA over custom ML** - Battle-tested, extensible, fast MVP
4. **Node.js over Python** - x402 SDK maturity, Express middleware
5. **Serverless over VPS** - Scale to zero, pay per use

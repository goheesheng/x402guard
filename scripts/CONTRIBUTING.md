# Contributing to x402guard

Thank you for your interest in contributing! This guide will help you get started.

## Ways to Contribute

### 1. Add Detection Rules (Most Impactful!)

The most valuable contribution is adding new detection patterns to catch malicious skills.

**File:** `server/src/rules/basic/index.ts`

**Rule format:**
```typescript
{
  name: "rule_name_snake_case",
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  description: "What this rule catches",
  patterns: [
    /your_regex_pattern/gi,
  ],
}
```

**Severity Guidelines:**
- `CRITICAL` — Credential theft, reverse shells, destructive commands
- `HIGH` — Data exfiltration, privilege escalation, code execution
- `MEDIUM` — Suspicious network calls, excessive permissions
- `LOW` — Minor concerns, informational

**Before submitting:**
- Test against real skills in `examples/test-skills/`
- Check for false positives
- Add test cases if possible

### 2. Report False Positives / Negatives

Found something incorrectly flagged or missed?

Open an issue with:
- The skill content (or sanitized version)
- Expected vs actual result
- Your reasoning

### 3. Improve Documentation

- Fix typos
- Add examples
- Translate to other languages
- Improve API docs

### 4. Build Integrations

Create integrations for:
- CI/CD (GitHub Actions, GitLab CI)
- Agent frameworks (LangChain, CrewAI, AutoGPT)
- Package managers (npm/pip pre-install hooks)

## Development Setup

```bash
# Clone
git clone https://github.com/goheesheng/x402guard.git
cd x402guard

# Install
pnpm install

# Configure
cp .env.example .env
# Add your WALLET_PRIVATE_KEY

# Run
pnpm dev
```

## Testing

```bash
# All tests
pnpm test

# Watch mode
pnpm test -- --watch

# Specific file
pnpm test server/src/services/auditEngine
```

## Pull Request Process

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/new-rule`)
3. Make changes with clear commits
4. Add/update tests
5. Open PR with description

## Code Style

- TypeScript strict mode
- Prettier for formatting
- Meaningful names
- Comments for complex logic

## Security Vulnerabilities

If you find a security issue, **do not** open a public issue.

Instead:
- DM [@goheesheng](https://x.com/goheesheng) on X
- Email: goheesheng11@gmail.com

## License

Contributions are licensed under MIT. By submitting a PR, you agree to this.

---

Questions? Open a discussion or reach out on X [@goheesheng](https://x.com/goheesheng).

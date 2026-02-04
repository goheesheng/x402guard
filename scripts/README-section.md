## Open Source

x402guard is **open core** — the core scanner and SDK are MIT licensed, while premium features are available through the hosted API.

### What's Open Source (MIT)

| Component | Description |
|-----------|-------------|
| `x402guard-client` | TypeScript SDK for integration |
| Core Scanner | Audit engine, permission analyzer, network detector |
| Basic Rules | 5 community-maintained detection patterns |
| Web UI | Next.js frontend |
| Documentation | All guides and examples |

### What's Premium (Hosted API)

| Feature | Description |
|---------|-------------|
| Premium Rules | 50+ advanced detection patterns |
| Signed Attestations | Cryptographic proof of audit results |
| Behavioral Sandbox | Deep tier runtime analysis |
| Enterprise SLA | Guaranteed uptime, support |

### Self-Hosting

Run your own x402guard instance with basic rules:

```bash
git clone https://github.com/goheesheng/x402guard.git
cd x402guard
pnpm install
cp .env.example .env
# Add your WALLET_PRIVATE_KEY
pnpm dev
```

Self-hosted includes:
- ✅ Core audit engine
- ✅ 5 basic YARA rules
- ✅ Permission analysis
- ✅ Network detection
- ✅ Risk scoring
- ❌ Premium rules (50+)
- ❌ Signed attestations
- ❌ Behavioral sandbox

### Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md).

**Popular contributions:**
- Add detection rules to `server/src/rules/basic/`
- Report false positives/negatives
- Build integrations

### Enterprise

Need volume pricing, SLA, or custom integration?

- DM [@goheesheng](https://x.com/goheesheng) on X
- Email: goheesheng11@gmail.com

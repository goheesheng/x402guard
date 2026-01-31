# SkillGuard 🛡️

x402-powered security auditing for AI agent skills.

## Structure

```
skillguard/
├── apps/
│   ├── web/          # Next.js frontend (skillscan-web)
│   └── api/          # Express API (skillguard-api)
├── packages/
│   └── shared/       # Shared types and utilities
├── package.json      # Workspace root
└── turbo.json        # Turborepo config
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Or run individually
pnpm dev:web   # http://localhost:3001
pnpm dev:api   # http://localhost:3000

# Build all
pnpm build
```

## Apps

### @skillguard/web
Landing page and scan interface at [skillscan-web.vercel.app](https://skillscan-web.vercel.app)

### @skillguard/api  
x402 API at [skillguard-api.vercel.app](https://skillguard-api.vercel.app)

**Endpoints:**
- `GET /health` - Free health check
- `POST /audit/quick` - $0.05 USDC - YARA scan
- `POST /audit/standard` - $0.15 USDC - Full analysis
- `POST /audit/deep` - $0.50 USDC - Complete audit

## x402 Payment

Payments accepted in USDC on Base mainnet via x402 protocol.

```bash
curl -X POST https://skillguard-api.vercel.app/audit/quick \
  -H "Content-Type: application/json" \
  -H "X-Payment: <x402-payment-token>" \
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'
```

## Environment Variables

### API (.env)
```
X402_PAY_TO_ADDRESS=0x...     # Your wallet address
X402_NETWORK=eip155:8453       # Base mainnet
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
```

## License

MIT

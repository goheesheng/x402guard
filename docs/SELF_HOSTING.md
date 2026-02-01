# Self-Hosting Guide

Run your own x402guard server.

## Prerequisites

- Node.js 20+
- pnpm 9+
- A wallet for receiving x402 payments
- Coinbase CDP API credentials

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/goheesheng/x402guard.git
cd x402guard

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp server/.env.example server/.env

# 4. Edit server/.env
X402_PAY_TO_ADDRESS=0xYourWalletAddress
X402_NETWORK=eip155:8453
CDP_API_KEY_ID=your-key-id
CDP_API_KEY_SECRET=your-key-secret

# 5. Build and start the server
pnpm build:server
pnpm start:server
```

Server runs at `http://localhost:3000`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `X402_PAY_TO_ADDRESS` | Yes | - | Your wallet address for receiving payments |
| `CDP_API_KEY_ID` | Yes | - | Coinbase CDP API key ID |
| `CDP_API_KEY_SECRET` | Yes | - | Coinbase CDP API key secret |
| `X402_NETWORK` | No | `eip155:8453` | Base mainnet. Use `eip155:84532` for testnet |
| `X402_FACILITATOR_URL` | No | CDP URL | x402 facilitator endpoint |
| `PRICE_QUICK` | No | `50000` | Price in USDC atomic units ($0.05) |
| `PRICE_STANDARD` | No | `150000` | Price in USDC atomic units ($0.15) |
| `PRICE_DEEP` | No | `500000` | Price in USDC atomic units ($0.50) |
| `PORT` | No | `3000` | Server port |

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd server
vercel --prod

# Set environment variables in Vercel dashboard
```

## Deploy with Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY server/ .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t x402guard .
docker run -p 3000:3000 \
  -e X402_PAY_TO_ADDRESS=0x... \
  -e CDP_API_KEY_ID=your-key-id \
  -e CDP_API_KEY_SECRET=your-key-secret \
  x402guard
```

## Custom YARA Rules

Add custom rules to detect specific threats:

```typescript
// server/src/services/auditEngine/yaraScanner.ts

const CUSTOM_RULES: Rule[] = [
  {
    name: "my_company_domains",
    severity: "MEDIUM",
    description: "Unexpected access to internal domains",
    patterns: [
      /internal\.mycompany\.com/gi,
      /\.corp\.mycompany\.com/gi,
    ],
  },
];
```

## Monitoring

The server exposes:
- `GET /api/health` - Health check endpoint
- Logs to stdout in JSON format

## Security Considerations

1. **Keep your CDP credentials secure** - Never commit API keys
2. **Use HTTPS** - Always run behind a TLS terminator
3. **Rate limit** - The server has built-in rate limiting
4. **Monitor payments** - Check your wallet for incoming payments

## Next Steps

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment options
- [API Reference](./API_REFERENCE.md) - HTTP API documentation
- [Detection Rules](./DETECTION_RULES.md) - Custom detection patterns

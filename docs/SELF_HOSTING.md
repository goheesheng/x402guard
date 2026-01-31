# Self-Hosting Guide

Run your own SkillGuard server.

## Prerequisites

- Node.js 20+
- pnpm 9+
- A wallet for receiving x402 payments

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/goheesheng/skillguard.git
cd skillguard

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp server/.env.example server/.env

# 4. Edit server/.env
X402_PAY_TO_ADDRESS=0xYourWalletAddress
X402_NETWORK=eip155:8453
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402

# 5. Start the server
pnpm dev:server
```

Server runs at `http://localhost:3000`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `X402_PAY_TO_ADDRESS` | ✅ | - | Your wallet address for receiving payments |
| `X402_NETWORK` | ❌ | `eip155:8453` | Base mainnet. Use `eip155:84532` for testnet |
| `X402_FACILITATOR_URL` | ❌ | CDP URL | x402 facilitator endpoint |
| `PRICE_QUICK` | ❌ | `50000` | Price in USDC atomic units ($0.05) |
| `PRICE_STANDARD` | ❌ | `150000` | Price in USDC atomic units ($0.15) |
| `PRICE_DEEP` | ❌ | `500000` | Price in USDC atomic units ($0.50) |
| `PORT` | ❌ | `3000` | Server port |

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd server
vercel

# Set environment variables in Vercel dashboard
```

## Deploy with Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY server/ .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t skillguard .
docker run -p 3000:3000 \
  -e X402_PAY_TO_ADDRESS=0x... \
  skillguard
```

## Custom YARA Rules

Add custom YARA rules to detect specific threats:

```bash
# Create rules directory
mkdir -p server/rules

# Add your .yar files
echo 'rule MyCustomRule { strings: $a = "malicious" condition: $a }' > server/rules/custom.yar
```

## Monitoring

The server exposes:
- `GET /health` - Health check endpoint
- Logs to stdout in JSON format

## Security Considerations

1. **Keep your wallet key secure** - Never commit private keys
2. **Use HTTPS** - Always run behind a TLS terminator
3. **Rate limit** - The server has built-in rate limiting
4. **Monitor payments** - Check your wallet for incoming payments

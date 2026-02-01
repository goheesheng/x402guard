# Deployment Guide

Deploy x402guard to production using Vercel, Docker, or a VPS.

## Quick Start (Vercel)

The fastest way to deploy x402guard:

```bash
# 1. Clone the repo
git clone https://github.com/goheesheng/x402guard.git
cd x402guard

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
cd server
vercel --prod

# 4. Set environment variables in Vercel Dashboard
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `X402_PAY_TO_ADDRESS` | Your wallet address for receiving USDC payments | `0xdc7f6ebefe62a...` |
| `CDP_API_KEY_ID` | Coinbase CDP API key ID | `your-key-id` |
| `CDP_API_KEY_SECRET` | Coinbase CDP API key secret | `your-key-secret` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `X402_NETWORK` | `eip155:8453` | Base mainnet. Use `eip155:84532` for testnet |
| `X402_FACILITATOR_URL` | CDP URL | x402 facilitator endpoint |
| `PRICE_QUICK` | `50000` | Quick tier price in USDC atomic units ($0.05) |
| `PRICE_STANDARD` | `150000` | Standard tier price ($0.15) |
| `PRICE_DEEP` | `500000` | Deep tier price ($0.50) |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Set to `production` for prod |

## Getting CDP Credentials

x402guard uses Coinbase CDP (Cloud Developer Platform) for x402 payment verification.

### Step 1: Create CDP Account

1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Sign up or log in
3. Create a new project

### Step 2: Create API Key

1. Navigate to **API Keys** in your project
2. Click **Create API Key**
3. Select permissions: `x402:read`, `x402:write`
4. Save your **Key ID** and **Key Secret** securely

### Step 3: Configure Environment

```bash
# .env
CDP_API_KEY_ID=your-key-id-here
CDP_API_KEY_SECRET=your-key-secret-here
X402_PAY_TO_ADDRESS=0xYourWalletAddress
```

**Warning:** Never commit CDP credentials to version control.

---

## Deployment Options

### Option 1: Vercel (Recommended)

Best for: Quick deployment, automatic scaling, global CDN

```bash
# From the server directory
cd server

# Deploy to Vercel
vercel --prod
```

Then configure environment variables in the Vercel Dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all required variables
4. Redeploy

**vercel.json** (already configured):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

---

### Option 2: Docker

Best for: Kubernetes, Docker Compose, container orchestration

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

**Build and run:**

```bash
# Build image
docker build -t x402guard .

# Run container
docker run -d \
  -p 3000:3000 \
  -e X402_PAY_TO_ADDRESS=0xYourWallet \
  -e CDP_API_KEY_ID=your-key-id \
  -e CDP_API_KEY_SECRET=your-key-secret \
  -e NODE_ENV=production \
  --name x402guard \
  x402guard
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  x402guard:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - X402_PAY_TO_ADDRESS=${X402_PAY_TO_ADDRESS}
      - CDP_API_KEY_ID=${CDP_API_KEY_ID}
      - CDP_API_KEY_SECRET=${CDP_API_KEY_SECRET}
      - X402_NETWORK=eip155:8453
      - NODE_ENV=production
    restart: unless-stopped
```

---

### Option 3: VPS (Manual)

Best for: Full control, custom configurations

**1. Setup server:**

```bash
# SSH into your VPS
ssh user@your-server.com

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone and build
git clone https://github.com/goheesheng/x402guard.git
cd x402guard/server
pnpm install
pnpm build
```

**2. Configure environment:**

```bash
# Create .env file
cat > .env << EOF
X402_PAY_TO_ADDRESS=0xYourWalletAddress
CDP_API_KEY_ID=your-key-id
CDP_API_KEY_SECRET=your-key-secret
X402_NETWORK=eip155:8453
NODE_ENV=production
PORT=3000
EOF
```

**3. Run with PM2:**

```bash
# Install PM2
npm install -g pm2

# Start the server
pm2 start dist/index.js --name x402guard

# Auto-start on reboot
pm2 startup
pm2 save
```

**4. Configure Nginx (reverse proxy):**

```nginx
# /etc/nginx/sites-available/x402guard
server {
    listen 80;
    server_name x402guard.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/x402guard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**5. Add SSL with Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d x402guard.yourdomain.com
```

---

## Local Development

For local testing and development:

```bash
# Clone repo
git clone https://github.com/goheesheng/x402guard.git
cd x402guard

# Install dependencies
pnpm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your values

# Start development server
pnpm dev:server
```

Server runs at `http://localhost:3000`

### Testing Locally

```bash
# Health check
curl http://localhost:3000/api/health

# Pricing info
curl http://localhost:3000/api/pricing

# Test audit (requires x402 payment)
# Use the test script:
cd examples/tests
PRIVATE_KEY=your-wallet-key npx tsx test-x402-payment.ts
```

---

## Monitoring

### Health Check

```bash
curl https://your-api.com/health
```

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Logs

The server logs to stdout in JSON format:

```
[INFO] x402guard API running on port 3000
[INFO] Environment: production
[INFO] x402 Network: eip155:8453
[INFO] POST /audit/quick
[INFO] POST /audit/standard
```

### Payment Monitoring

Monitor your receiving wallet on Basescan:

```
https://basescan.org/address/YOUR_WALLET_ADDRESS
```

---

## Security Checklist

- [ ] Never commit `.env` or credentials to git
- [ ] Use HTTPS in production (TLS termination)
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting (built-in)
- [ ] Monitor wallet for suspicious activity
- [ ] Keep Node.js and dependencies updated
- [ ] Use secrets manager for CDP credentials in production

---

## Troubleshooting

### 401 Unauthorized from CDP

```
Error: Request failed with status 401
```

**Solution:** Check your CDP credentials are correct and have x402 permissions.

### 402 Payment Required

```
Error: Payment Required
```

**Solution:** This is expected when calling paid endpoints without x402 payment. Use the SDK or include proper payment headers.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** Change `PORT` environment variable or kill the process using port 3000.

### Build Errors

```
Error: Cannot find module 'dist/index.js'
```

**Solution:** Run `pnpm build` before starting in production mode.

---

## Next Steps

- [SDK Reference](./SDK_REFERENCE.md) — Integrate with your application
- [API Reference](./API_REFERENCE.md) — HTTP API documentation
- [Self-Hosting](./SELF_HOSTING.md) — Detailed self-hosting guide

# Design Document: Domain Deployment for x402guard.xyz

## Overview

Deploy the x402guard API to a production server accessible via `x402guard.xyz`. This design covers three deployment options with Vercel being the recommended approach for simplicity.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   x402guard API  │         │   Facilitator   │
│ skillscan-web   │         │  x402guard.xyz   │         │  CDP (Coinbase) │
│                 │         │                  │         │                 │
│ Vercel/Other    │ ──────> │ Vercel/AWS/Other │ ──────> │ Base Mainnet    │
│                 │  HTTP   │                  │  x402   │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                    │
                                    │ DNS
                                    ▼
                            ┌──────────────────┐
                            │  x402guard.xyz   │
                            │  DNS Provider    │
                            │  (Namecheap/etc) │
                            └──────────────────┘
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros:** Zero infrastructure, automatic SSL, global CDN, free tier
**Cons:** Cold starts on free tier

```
x402guard.xyz ──> Vercel Edge ──> Serverless Function (api/index.ts)
```

### Option 2: AWS EC2

**Pros:** Full control, no cold starts
**Cons:** More setup, costs money

```
x402guard.xyz ──> EC2 + Nginx ──> Docker Container ──> Node.js
```

### Option 3: Railway/Render

**Pros:** Simple like Vercel, always-on
**Cons:** Costs money after free tier

## Detailed Design: Vercel Deployment

### Step 1: Vercel Project Setup

The server already has `api/index.ts` which Vercel auto-detects as a serverless function.

```
server/
├── api/
│   └── index.ts    ← Vercel serverless entry point
├── src/            ← Source code
├── vercel.json     ← Vercel configuration (to create)
└── package.json
```

### Step 2: Vercel Configuration

Create `vercel.json` to configure routing:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

### Step 3: Environment Variables

Required on Vercel dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `X402_PAY_TO_ADDRESS` | `0x...` | Your wallet for USDC |
| `CDP_API_KEY_ID` | `...` | Coinbase CDP Key ID |
| `CDP_API_KEY_SECRET` | `...` | Coinbase CDP Secret |

### Step 4: Domain Configuration

1. In Vercel dashboard: Settings → Domains → Add `x402guard.xyz`
2. Vercel provides DNS records to add:
   - `A` record → Vercel IP
   - OR `CNAME` record → `cname.vercel-dns.com`

3. In your DNS provider (Namecheap, Cloudflare, etc.):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Step 5: SSL Certificate

Vercel automatically provisions SSL via Let's Encrypt. No action needed.

## Detailed Design: AWS EC2 Deployment

### Step 1: EC2 Instance

- AMI: Amazon Linux 2023
- Instance type: t3.small (minimum)
- Security group: Allow 22, 80, 443

### Step 2: Server Setup

```bash
# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker

# Clone and run
git clone https://github.com/goheesheng/x402guard.git
cd x402guard/server
docker-compose up -d
```

### Step 3: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name x402guard.xyz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 4: SSL with Certbot

```bash
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d x402guard.xyz
```

### Step 5: DNS Configuration

Point domain to EC2 public IP:
```
Type: A
Name: @
Value: <EC2-PUBLIC-IP>
```

## API Endpoints

After deployment, these endpoints will be available:

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/health` | GET | Free | Health check |
| `/pricing` | GET | Free | Pricing info |
| `/audit/quick` | POST | $0.05 | YARA scan |
| `/audit/standard` | POST | $0.15 | Full analysis |
| `/audit/deep` | POST | $0.50 | Complete audit |

## Verification

After deployment, verify with:

```bash
# Health check
curl https://x402guard.xyz/health

# Should return: {"status":"ok","version":"0.1.0"}

# Test 402 response
curl -X POST https://x402guard.xyz/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_content": "test"}'

# Should return 402 with PAYMENT-REQUIRED header
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| DNS not resolving | DNS not propagated | Wait 24-48 hours |
| 502 Bad Gateway | Server not running | Check docker logs |
| SSL error | Certificate not issued | Check Vercel/Certbot logs |
| 402 without header | x402 middleware error | Check env variables |

## Testing

1. Health check: `curl https://x402guard.xyz/health`
2. 402 response: `curl -X POST https://x402guard.xyz/audit/quick -d '{}'`
3. Decode header: Base64 decode the `PAYMENT-REQUIRED` header
4. Full flow: Use x402guard-client SDK with real payment

## Local Development

For local testing with the frontend, run the API on port 3001 to avoid conflicts with Next.js (port 3000).

### Server Configuration

Set `PORT=3001` in the server's `.env` file or environment:

```bash
# server/.env
PORT=3001
X402_PAY_TO_ADDRESS=0xYourWallet
```

### Running Locally

```bash
# Terminal 1: Start API server on port 3001
cd server
PORT=3001 pnpm dev

# Terminal 2: Start frontend on port 3000
cd ../skillscan-web  # or wherever frontend is
NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm dev
```

### Frontend Configuration

The frontend reads `NEXT_PUBLIC_API_URL` from environment:

```typescript
// lib/constants.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://x402guard.xyz";
```

For local development, create `.env.local` in the frontend:

```bash
# skillscan-web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Local Testing Commands

```bash
# Test API health (port 3001)
curl http://localhost:3001/health

# Test 402 response
curl -X POST http://localhost:3001/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_content": "test"}'
```

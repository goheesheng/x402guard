# AWS EC2 Deployment Guide

Deploy x402guard to AWS EC2 with Ubuntu.

## Prerequisites

- AWS Account with EC2 access
- Domain name pointing to your EC2 instance (optional, for HTTPS)
- Your wallet address for receiving USDC payments
- Coinbase CDP API credentials

## Quick Start: EC2 with Docker

### 1. Launch EC2 Instance (AWS Console)

Use these settings:

| Setting | Value |
|---------|-------|
| **Name** | `x402guard` |
| **AMI** | Ubuntu Server 24.04 LTS (ami-08d59269edddde222) |
| **Instance Type** | t3.micro (free tier eligible) |
| **Key Pair** | Create or select existing |
| **Network** | Default VPC |
| **Auto-assign Public IP** | Enable |

**Security Group Rules:**
- SSH (22) - Your IP or 0.0.0.0/0
- HTTP (80) - 0.0.0.0/0
- HTTPS (443) - 0.0.0.0/0
- Custom TCP (3000) - 0.0.0.0/0 (for direct API access)

### 2. SSH into Instance

```bash
ssh -i x402guard_aws.pem ubuntu@<your-instance-public-ip>
```

### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Node.js 20 (for local development/testing)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm
```

### 4. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/goheesheng/x402guard.git
cd x402guard

# Create environment file
cat > .env << 'EOF'
# Required: Your wallet address for USDC payments
X402_PAY_TO_ADDRESS=0xYourWalletAddress

# Required: Coinbase CDP credentials for x402 payment verification
CDP_API_KEY_ID=your-cdp-key-id
CDP_API_KEY_SECRET=your-cdp-key-secret

# Network configuration (Base mainnet)
X402_NETWORK=eip155:8453

# Production settings
NODE_ENV=production

# Frontend API URL (for production)
NEXT_PUBLIC_API_URL=https://x402guard.xyz
EOF
```

### 5. Deploy with Docker

```bash
# Build and start containers
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 6. Verify Deployment

```bash
# Health check (should return {"status":"ok","version":"1.0.0",...})
curl http://localhost:3000/api/health

# Test 402 response
curl -X POST http://localhost:3000/api/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_url": "https://example.com/test.md"}'
```

---

## Production Setup with Nginx and SSL

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/x402guard << 'EOF'
server {
    listen 80;
    server_name x402guard.xyz www.x402guard.xyz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # x402 payment headers
        proxy_set_header PAYMENT-SIGNATURE $http_payment_signature;
        proxy_set_header X-PAYMENT $http_x_payment;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/x402guard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Add SSL with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d x402guard.xyz -d www.x402guard.xyz

# Auto-renewal is configured automatically
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `X402_PAY_TO_ADDRESS` | Yes | - | Your wallet address for USDC payments |
| `CDP_API_KEY_ID` | Yes | - | Coinbase CDP API Key ID |
| `CDP_API_KEY_SECRET` | Yes | - | Coinbase CDP API Key Secret |
| `X402_NETWORK` | No | `eip155:8453` | Base mainnet (use `eip155:84532` for testnet) |
| `NODE_ENV` | No | `development` | Set to `production` for production |
| `PORT` | No | `3000` | API server port |
| `NEXT_PUBLIC_API_URL` | No | `https://x402guard.xyz` | Frontend API URL |

---

## Getting CDP Credentials

1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Navigate to **API Keys**
4. Create API Key with `x402:read`, `x402:write` permissions
5. Save **Key ID** and **Key Secret** securely

**Warning:** Never commit credentials to git or share publicly.

---

## Useful Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Update and redeploy
git pull
docker compose up -d --build

# Check resource usage
docker stats

# Stop services
docker compose down
```

---

## Development vs Production

| Environment | API URL | Configuration |
|-------------|---------|---------------|
| **Development** | `http://localhost:3001` | Set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env` |
| **Production** | `https://x402guard.xyz` | Default (no env needed) or set explicitly |

### Local Development

```bash
# In your local machine
cd x402guard

# Create local .env
cat > apps/web/.env << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Start development server
pnpm dev
```

### Testing Production Build Locally

```bash
# Build production
pnpm build

# Start with production settings
NODE_ENV=production pnpm start
```

---

## Monitoring

### Health Check Endpoint

```bash
curl https://x402guard.xyz/api/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Monitor Payments

Check your receiving wallet on Basescan:
```
https://basescan.org/address/YOUR_WALLET_ADDRESS
```

---

## Troubleshooting

### Docker container won't start

```bash
# Check logs
docker compose logs x402guard

# Verify .env file exists
cat .env
```

### 502 Bad Gateway

```bash
# Check if container is running
docker compose ps

# Check Nginx config
sudo nginx -t

# Restart services
docker compose restart
sudo systemctl restart nginx
```

### CORS errors in browser

Ensure the API server is running and accessible. The server includes proper CORS headers for x402 payment flow.

### Payment not working

1. Verify CDP credentials are correct
2. Check wallet has USDC on Base
3. Verify `X402_PAY_TO_ADDRESS` is correct
4. Check server logs: `docker compose logs -f`

---

## Security Checklist

- [ ] Never commit `.env` or credentials to git
- [ ] Use HTTPS in production (SSL certificate installed)
- [ ] Set `NODE_ENV=production`
- [ ] Restrict SSH access to your IP only
- [ ] Keep Ubuntu and Docker updated
- [ ] Use AWS Secrets Manager for production credentials
- [ ] Monitor wallet for suspicious activity

---

## Next Steps

- [API Reference](./API_REFERENCE.md) - HTTP API documentation
- [SDK Reference](./SDK_REFERENCE.md) - TypeScript SDK
- [Self-Hosting](./SELF_HOSTING.md) - Alternative hosting options

# Deployment Guide

Deploy x402guard to AWS EC2 with Ubuntu.

## Prerequisites

- AWS Account with EC2 access
- Domain name (optional, for HTTPS)
- Your wallet address for receiving USDC payments
- Coinbase CDP API credentials

## Quick Start

### 1. Launch EC2 Instance

**AWS Console Settings:**

| Setting | Value |
|---------|-------|
| AMI | Ubuntu Server 24.04 LTS |
| Instance Type | t3.micro (free tier) or t3.small |
| Key Pair | Create or select existing |
| Security Group | See below |

**Security Group Inbound Rules:**

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | Your IP |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |

### 2. SSH into Instance

```bash
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install PM2
sudo npm install -g pm2

# Install nginx and certbot
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 4. Clone Repository

```bash
cd ~
git clone https://github.com/goheesheng/x402guard.git
cd x402guard
pnpm install
```

### 5. Configure Environment

**Server `.env`:**

```bash
nano ~/x402guard/server/.env
```

```env
PORT=3001
NODE_ENV=production

X402_PAY_TO_ADDRESS=0xYourWalletAddress
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
X402_NETWORK=eip155:8453

CDP_API_KEY_ID=your-cdp-key-id
CDP_API_KEY_SECRET=your-cdp-key-secret

# Pricing (USDC atomic units, 6 decimals)
# $0.01 = 10000, $0.05 = 50000, $0.10 = 100000
PRICE_QUICK=10000
PRICE_STANDARD=50000
PRICE_DEEP=100000

MAX_SKILL_SIZE=1048576
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

**Web `.env`:**

```bash
nano ~/x402guard/apps/web/.env
```

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 6. Build

```bash
cd ~/x402guard
pnpm build
```

### 7. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/x402guard
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend (Next.js on port 3000)
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
    }

    # API (Express on port 3001)
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # x402 payment headers
        proxy_set_header X-PAYMENT $http_x_payment;
        proxy_set_header Payment $http_payment;
        proxy_pass_header X-PAYMENT;
        proxy_pass_header Payment;
        proxy_pass_request_headers on;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
```

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/x402guard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 8. Setup SSL (after DNS is configured)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9. Start with PM2

```bash
cd ~/x402guard
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 10. Verify Deployment

```bash
# Check processes
pm2 status

# Test API
curl https://yourdomain.com/api/health

# Check logs
pm2 logs
```

---

## DNS Configuration (GoDaddy Example)

Add these A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your-ec2-ip | 600 |
| A | www | your-ec2-ip | 600 |

**Important:** Delete any conflicting records (like WebsiteBuilder).

Wait 5-30 minutes for DNS propagation. Verify:

```bash
nslookup yourdomain.com 8.8.8.8
```

---

## Updating the Application

```bash
cd ~/x402guard
git pull
pnpm build
pm2 restart all
```

If you get git conflicts:

```bash
git stash
git pull
git stash pop
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check running processes |
| `pm2 logs` | View all logs |
| `pm2 logs x402guard-api` | View API logs |
| `pm2 logs x402guard-web` | View web logs |
| `pm2 restart all` | Restart all processes |
| `pm2 stop all` | Stop all processes |
| `sudo nginx -t` | Test nginx config |
| `sudo systemctl reload nginx` | Reload nginx |
| `sudo certbot renew --dry-run` | Test SSL renewal |

---

## Troubleshooting

### CSS not loading (raw @tailwind showing)

```bash
cd ~/x402guard/apps/web
rm -rf .next
rm postcss.config.mjs  # Remove old config if exists
pnpm build
pm2 restart x402guard-web
```

### API returning 502 Bad Gateway

```bash
pm2 status  # Check if API is running
pm2 logs x402guard-api  # Check for errors
pm2 restart x402guard-api
```

### Domain not resolving

1. Check DNS records in your registrar
2. Delete conflicting A records
3. Flush local DNS: `sudo dscacheutil -flushcache` (Mac)
4. Test with Google DNS: `nslookup yourdomain.com 8.8.8.8`

### Payment client not ready

1. Ensure `NEXT_PUBLIC_API_URL` is set correctly in web `.env`
2. Rebuild web app: `pnpm build`
3. Hard refresh browser: `Ctrl+Shift+R`

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default: 3001) |
| `NODE_ENV` | No | Environment (production) |
| `X402_PAY_TO_ADDRESS` | Yes | Your wallet for USDC payments |
| `CDP_API_KEY_ID` | Yes | Coinbase CDP API Key ID |
| `CDP_API_KEY_SECRET` | Yes | Coinbase CDP API Secret |
| `X402_NETWORK` | No | Network (default: eip155:8453) |
| `PRICE_QUICK` | No | Quick tier price in atomic units |
| `PRICE_STANDARD` | No | Standard tier price |
| `PRICE_DEEP` | No | Deep tier price |

### Web (`apps/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Full API URL (https://yourdomain.com) |

---

## Getting CDP Credentials

1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Navigate to **API Keys**
4. Create API Key with `x402:read`, `x402:write` permissions
5. Save **Key ID** and **Key Secret** securely

**Warning:** Never commit credentials to git.

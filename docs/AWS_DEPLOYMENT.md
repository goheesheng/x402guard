# AWS Deployment Guide

Deploy x402guard API to AWS EC2 or ECS.

## Prerequisites

- AWS Account with EC2/ECS access
- Domain name (optional, for HTTPS)
- Your wallet address for receiving USDC payments
- Coinbase CDP API credentials (optional, for authenticated facilitator)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `X402_PAY_TO_ADDRESS` | Yes | Your wallet address for USDC payments |
| `CDP_API_KEY_ID` | No | Coinbase CDP API Key ID |
| `CDP_API_KEY_SECRET` | No | Coinbase CDP API Key Secret |
| `NODE_ENV` | No | `production` (default) |
| `PORT` | No | `3000` (default) |

---

## Option 1: EC2 with Docker

### 1. Launch EC2 Instance

```bash
# Recommended: t3.small or larger
# AMI: Amazon Linux 2023 or Ubuntu 22.04
# Security Group: Allow ports 22 (SSH), 80, 443, 3000
```

### 2. SSH into Instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### 3. Install Docker

```bash
# Amazon Linux 2023
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Clone and Deploy

```bash
# Clone repo
git clone https://github.com/goheesheng/x402guard.git
cd x402guard/server

# Create .env file
cat > .env << EOF
X402_PAY_TO_ADDRESS=0xYourWalletAddress
CDP_API_KEY_ID=your-cdp-key-id
CDP_API_KEY_SECRET=your-cdp-key-secret
EOF

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 5. Set Up Nginx Reverse Proxy (for HTTPS)

```bash
sudo yum install nginx -y

# Configure nginx
sudo tee /etc/nginx/conf.d/x402guard.conf << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Add SSL with Certbot

```bash
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Option 2: AWS ECS (Fargate)

### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name x402guard-api
```

### 2. Build and Push Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
cd server
docker build -t x402guard-api .
docker tag x402guard-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/x402guard-api:latest

# Push
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/x402guard-api:latest
```

### 3. Create ECS Task Definition

```json
{
  "family": "x402guard-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "x402guard-api",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/x402guard-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {
          "name": "X402_PAY_TO_ADDRESS",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:x402guard/pay-to-address"
        },
        {
          "name": "CDP_API_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:x402guard/cdp-key-id"
        },
        {
          "name": "CDP_API_KEY_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:x402guard/cdp-key-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/x402guard-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 4. Create ECS Service

```bash
aws ecs create-service \
  --cluster your-cluster \
  --service-name x402guard-api \
  --task-definition x402guard-api \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 5. Add Application Load Balancer

1. Create ALB in AWS Console
2. Create target group pointing to ECS service (port 3000)
3. Configure HTTPS listener with ACM certificate
4. Update security groups

---

## Option 3: AWS Lambda (Serverless)

For lower traffic, you can deploy as a Lambda function:

### 1. Install Serverless Framework

```bash
npm install -g serverless
```

### 2. Create serverless.yml

```yaml
service: x402guard-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    X402_PAY_TO_ADDRESS: ${env:X402_PAY_TO_ADDRESS}
    CDP_API_KEY_ID: ${env:CDP_API_KEY_ID}
    CDP_API_KEY_SECRET: ${env:CDP_API_KEY_SECRET}

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: any
          cors: true
    timeout: 30
```

### 3. Create Lambda Handler

```typescript
// src/lambda.ts
import serverless from 'serverless-http';
import app from './server';

export const handler = serverless(app);
```

### 4. Deploy

```bash
serverless deploy
```

---

## Verify Deployment

```bash
# Health check
curl https://your-domain.com/health

# Test 402 response
curl -X POST https://your-domain.com/audit/quick \
  -H "Content-Type: application/json" \
  -d '{"skill_content": "test"}'
```

Expected 402 response with `PAYMENT-REQUIRED` header.

---

## Update Frontend

After deploying the API, update your frontend:

```bash
cd /path/to/skillscan-web
vercel env add NEXT_PUBLIC_API_URL  # Enter your AWS URL
vercel --prod
```

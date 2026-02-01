#!/bin/bash
# x402guard EC2 Deployment Script
# Usage: ./deploy.sh

set -e

echo "🛡️ x402guard Deployment Script"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed. Please log out and back in, then run this script again."
    exit 0
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed."
fi

# Check for required environment variables
if [ -z "$X402_PAY_TO_ADDRESS" ]; then
    echo "❌ X402_PAY_TO_ADDRESS is not set"
    echo "   Export it: export X402_PAY_TO_ADDRESS=0xYourAddress"
    exit 1
fi

if [ -z "$CDP_API_KEY_ID" ] || [ -z "$CDP_API_KEY_SECRET" ]; then
    echo "⚠️  CDP API credentials not set. x402 payments may not work."
    echo "   Set them: export CDP_API_KEY_ID=... CDP_API_KEY_SECRET=..."
fi

# Create log directory
sudo mkdir -p /var/log/x402guard
sudo chown -R $USER:$USER /var/log/x402guard

# Build and start
echo ""
echo "🔨 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting x402guard..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo ""
echo "🏥 Running health check..."
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "✅ x402guard is running!"
    echo ""
    echo "📍 Endpoints:"
    echo "   Web UI:      http://localhost:3000"
    echo "   Health:      http://localhost:3000/api/health"
    echo "   Pricing:     http://localhost:3000/api/pricing"
    echo "   SKILL.md:    http://localhost:3000/api/skill.md"
    echo "   Audit:       http://localhost:3000/api/audit/quick (POST, requires x402)"
    echo ""
    echo "📊 View logs:"
    echo "   docker-compose logs -f"
else
    echo "❌ Health check failed. Check logs:"
    echo "   docker-compose logs"
fi

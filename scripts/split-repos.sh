#!/bin/bash
# split-repos.sh
# Splits skillguard-monorepo into public (x402guard) and private (x402guard-infra) repos

set -e

MONOREPO_DIR="$HOME/Desktop/skillguard-monorepo"
PUBLIC_DIR="$HOME/Desktop/x402guard"
PRIVATE_DIR="$HOME/Desktop/x402guard-infra"

echo "🔧 Splitting x402guard into public + private repos..."
echo ""
echo "Source:  $MONOREPO_DIR"
echo "Public:  $PUBLIC_DIR"
echo "Private: $PRIVATE_DIR"
echo ""

# Check if target dirs exist
if [ -d "$PUBLIC_DIR" ]; then
  echo "⚠️  $PUBLIC_DIR already exists. Remove it first or choose a different location."
  exit 1
fi

if [ -d "$PRIVATE_DIR" ]; then
  echo "⚠️  $PRIVATE_DIR already exists. Remove it first or choose a different location."
  exit 1
fi

# ============================================
# CREATE PUBLIC REPO
# ============================================
echo "📦 Creating public repo: x402guard..."

mkdir -p "$PUBLIC_DIR"
cd "$PUBLIC_DIR"

# Copy public components
cp -r "$MONOREPO_DIR/packages" .
cp -r "$MONOREPO_DIR/server" .
cp -r "$MONOREPO_DIR/docs" .
cp -r "$MONOREPO_DIR/examples" .
cp -r "$MONOREPO_DIR/apps" .

# Copy root files
cp "$MONOREPO_DIR/package.json" .
cp "$MONOREPO_DIR/pnpm-workspace.yaml" .
cp "$MONOREPO_DIR/pnpm-lock.yaml" .
cp "$MONOREPO_DIR/turbo.json" .
cp "$MONOREPO_DIR/README.md" .
cp "$MONOREPO_DIR/Dockerfile" .
cp "$MONOREPO_DIR/docker-compose.yml" .
cp "$MONOREPO_DIR/deploy.sh" .
cp "$MONOREPO_DIR/ecosystem.config.js" .
cp "$MONOREPO_DIR/.gitignore" .
cp "$MONOREPO_DIR/.dockerignore" .

# Remove secrets and private files
rm -f .env server/.env apps/web/.env.local 2>/dev/null || true
rm -rf .git

# Create MIT LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 goheesheng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create .env.example
cat > .env.example << 'EOF'
# x402guard Environment Configuration
# Copy to .env and fill in your values

# Wallet private key (for receiving x402 payments)
WALLET_PRIVATE_KEY=

# Facilitator URL (x402 payment processor)
FACILITATOR_URL=https://x402.org/facilitator

# Server port
PORT=3001
EOF

cp .env.example server/.env.example

# Update .gitignore
cat >> .gitignore << 'EOF'

# Secrets - NEVER commit
.env
.env.local
.env.production
*.pem
*.key
server/.env
apps/web/.env.local

# Premium rules (loaded from private repo in production)
server/src/rules/premium/
EOF

# Update package.json license
sed -i '' 's/"license": "PROPRIETARY"/"license": "MIT"/g' server/package.json 2>/dev/null || true
sed -i '' 's/"license": "PROPRIETARY"/"license": "MIT"/g' packages/x402guard-client/package.json 2>/dev/null || true

# Create rules directory structure for basic rules
mkdir -p server/src/rules/basic

# Initialize git
git init
git add -A
git commit -m "Initial commit: x402guard open source release"

echo "✅ Public repo created at $PUBLIC_DIR"

# ============================================
# CREATE PRIVATE REPO
# ============================================
echo ""
echo "🔒 Creating private repo: x402guard-infra..."

mkdir -p "$PRIVATE_DIR"
cd "$PRIVATE_DIR"

# Create directory structure
mkdir -p rules/premium
mkdir -p infrastructure
mkdir -p attestation
mkdir -p enterprise

# Create proprietary LICENSE
cat > LICENSE << 'EOF'
Copyright (c) 2026 Eesheng. All rights reserved.

PROPRIETARY AND CONFIDENTIAL

This software and associated documentation files (the "Software") are proprietary
and confidential. Unauthorized copying, modification, distribution, or use of
this software, via any medium, is strictly prohibited without express written
permission from the copyright holder.

The Software is provided for use exclusively by authorized personnel of the
copyright holder and licensed partners.

For licensing inquiries: DM @goheesheng on X or email goheesheng11@gmail.com
EOF

# Create README
cat > README.md << 'EOF'
# x402guard-infra

Private infrastructure and premium components for x402guard.

## Contents

```
x402guard-infra/
├── rules/premium/       # Advanced detection patterns
├── infrastructure/      # Terraform, k8s, deployment configs
├── attestation/         # Signing keys and attestation logic
├── enterprise/          # Enterprise-only features
└── .env.production      # Production secrets (gitignored)
```

## Usage

This repo is used alongside the public [x402guard](https://github.com/goheesheng/x402guard) repo.

### Local Development

```bash
# Clone both repos side by side
git clone https://github.com/goheesheng/x402guard.git
git clone git@github.com:goheesheng/x402guard-infra.git

# Link premium rules
ln -s ../x402guard-infra/rules/premium x402guard/server/src/rules/premium
```

### Production Deployment

Premium rules are injected via:
- Docker volume mount
- Private npm package
- CI/CD secrets

## Security

⚠️ This repo contains sensitive material:
- Detection patterns (competitive advantage)
- Signing keys (attestation integrity)
- Infrastructure configs (security)

Never commit `.env.production` or any key files.
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Environment and secrets
.env
.env.production
.env.*
*.pem
*.key
*.p12

# Terraform
*.tfstate
*.tfstate.*
.terraform/

# Node
node_modules/

# OS
.DS_Store
Thumbs.db
EOF

# Create premium rules placeholder
cat > rules/premium/index.ts << 'EOF'
// Premium detection rules - PROPRIETARY
// Copyright (c) 2026 Eesheng. All rights reserved.
//
// These advanced patterns are available only through:
// - Hosted API at x402guard.xyz
// - Enterprise licenses
//
// DO NOT DISTRIBUTE

import type { Rule } from "./types.js";

export const PREMIUM_RULES: Rule[] = [
  // ============================================
  // ADVANCED CREDENTIAL THEFT
  // ============================================
  {
    name: "credential_theft_advanced",
    severity: "CRITICAL",
    description: "Advanced credential enumeration and theft patterns",
    patterns: [
      /\$\{?\w*(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\}?/gi,
      /\.filter\s*\([^)]*(?:KEY|SECRET|TOKEN)/gi,
      /\.ssh\/id_ed25519/gi,
      /\.env\.local/gi,
      /credentials\.json/gi,
      /\.aws\/config/gi,
      /\.npmrc/gi,
      /\.netrc/gi,
      /\.docker\/config\.json/gi,
      /\.kube\/config/gi,
      /\.gnupg/gi,
      /keychain/gi,
      /\.gcloud/gi,
      /service[_-]?account.*\.json/gi,
      /firebase.*\.json/gi,
    ],
  },

  // ============================================
  // EXTENDED EXFILTRATION DOMAINS
  // ============================================
  {
    name: "known_exfil_domains_extended",
    severity: "HIGH",
    description: "Extended list of known data exfiltration service domains",
    patterns: [
      /webhook\.site/gi,
      /requestbin/gi,
      /pipedream\.net/gi,
      /hookbin/gi,
      /burpcollaborator/gi,
      /ngrok\.io/gi,
      /localhost\.run/gi,
      /serveo\.net/gi,
      /oast\.fun/gi,
      /interactsh/gi,
      /canarytokens/gi,
      /requestcatcher/gi,
      /beeceptor/gi,
    ],
  },

  // ============================================
  // OBFUSCATION DETECTION
  // ============================================
  {
    name: "obfuscation_advanced",
    severity: "HIGH",
    description: "Advanced code obfuscation patterns",
    patterns: [
      /atob\s*\(/gi,
      /Buffer\.from\s*\([^)]+,\s*['"]base64['"]\)/gi,
      /\\x[0-9a-f]{2}/gi,
      /String\.fromCharCode/gi,
      /\['\\x/gi,
      /\]\s*\.\s*join\s*\(\s*['"]['"]?\s*\)/gi,
      /eval\s*\(\s*atob/gi,
      /Function\s*\(\s*atob/gi,
    ],
  },

  // ============================================
  // BROWSER DATA THEFT
  // ============================================
  {
    name: "browser_data_theft",
    severity: "HIGH",
    description: "Attempts to access browser stored data",
    patterns: [
      /document\.cookie/gi,
      /localStorage\.getItem/gi,
      /sessionStorage/gi,
      /IndexedDB/gi,
      /Chrome.*Login Data/gi,
      /Firefox.*logins\.json/gi,
      /moz_cookies/gi,
    ],
  },

  // ============================================
  // PRIVILEGE ESCALATION
  // ============================================
  {
    name: "privilege_escalation_advanced",
    severity: "HIGH",
    description: "Attempts to escalate privileges",
    patterns: [
      /sudo\s+-S/gi,
      /chmod\s+[0-7]*777/gi,
      /chmod\s+\+s/gi,
      /setuid/gi,
      /setgid/gi,
      /runas\s+\/user:/gi,
      /pkexec/gi,
      /doas\s+/gi,
    ],
  },

  // ============================================
  // CRYPTO WALLET THEFT
  // ============================================
  {
    name: "crypto_wallet_theft",
    severity: "CRITICAL",
    description: "Attempts to access cryptocurrency wallets",
    patterns: [
      /\.ethereum/gi,
      /wallet\.dat/gi,
      /\.bitcoin/gi,
      /metamask/gi,
      /seed\s*phrase/gi,
      /mnemonic/gi,
      /keystore.*json/gi,
      /\.solana/gi,
    ],
  },

  // ============================================
  // SUPPLY CHAIN ATTACKS
  // ============================================
  {
    name: "supply_chain_patterns",
    severity: "CRITICAL",
    description: "Patterns associated with supply chain attacks",
    patterns: [
      /postinstall.*curl/gi,
      /preinstall.*wget/gi,
      /npm\s+publish.*--access\s+public/gi,
      /\.npmrc.*_authToken/gi,
    ],
  },
];
EOF

# Create types file
cat > rules/premium/types.ts << 'EOF'
export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Rule {
  name: string;
  severity: RiskLevel;
  description: string;
  patterns: RegExp[];
}
EOF

# Create .env.production template (gitignored)
cat > .env.production.example << 'EOF'
# Production Environment - KEEP SECRET
# Copy to .env.production (gitignored)

# x402 Payment
WALLET_PRIVATE_KEY=
FACILITATOR_URL=https://x402.org/facilitator

# Attestation Signing
ATTESTATION_PRIVATE_KEY=

# Database (if applicable)
DATABASE_URL=

# Monitoring
SENTRY_DSN=
EOF

# Initialize git
git init
git add -A
git commit -m "Initial commit: x402guard private infrastructure"

echo "✅ Private repo created at $PRIVATE_DIR"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "============================================"
echo "✅ SPLIT COMPLETE!"
echo "============================================"
echo ""
echo "PUBLIC REPO (MIT License):"
echo "  $PUBLIC_DIR"
echo "  → Push to: github.com/goheesheng/x402guard"
echo ""
echo "PRIVATE REPO (Proprietary):"
echo "  $PRIVATE_DIR"
echo "  → Push to: github.com/goheesheng/x402guard-infra (private)"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Review the public repo:"
echo "   cd $PUBLIC_DIR && ls -la"
echo ""
echo "2. Create basic rules in public repo:"
echo "   See: $PUBLIC_DIR/server/src/rules/basic/"
echo ""
echo "3. Push public repo to GitHub:"
echo "   cd $PUBLIC_DIR"
echo "   git remote add origin https://github.com/goheesheng/x402guard.git"
echo "   git push -u origin main"
echo ""
echo "4. Push private repo to GitHub (as private):"
echo "   cd $PRIVATE_DIR"
echo "   git remote add origin git@github.com:goheesheng/x402guard-infra.git"
echo "   git push -u origin main"
echo ""
echo "5. For local dev, link premium rules:"
echo "   cd $PUBLIC_DIR/server/src/rules"
echo "   ln -s ../../../../x402guard-infra/rules/premium premium"
echo ""

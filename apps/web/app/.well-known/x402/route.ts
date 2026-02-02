import { NextResponse } from "next/server";

// x402 Discovery endpoint
// See: https://github.com/Merit-Systems/x402scan/blob/main/docs/DISCOVERY.md

export const dynamic = "force-dynamic";

const DISCOVERY_DOCUMENT = {
  version: 1,
  resources: [
    "https://x402guard.xyz/api/audit/quick",
    "https://x402guard.xyz/api/audit/standard",
    "https://x402guard.xyz/api/audit/deep",
  ],
  instructions: `# x402guard - Security Scanning for AI Agent Skills

Pre-install security auditing for AI agent skills powered by x402.

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| \`/api/audit/quick\` | $0.01 USDC | YARA malware scan |
| \`/api/audit/standard\` | $0.05 USDC | + Permission & network analysis |
| \`/api/audit/deep\` | $0.10 USDC | + Behavioral sandbox & attestation |

## Documentation

- **Skill Document**: https://x402guard.xyz/api/skill.md
- **Skill Metadata**: https://x402guard.xyz/api/skill.json
- **Health Check**: https://x402guard.xyz/api/health

## Payment

- **Network**: Base Mainnet (eip155:8453)
- **Asset**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **PayTo**: 0xdc7f6ebefe62a402e7c75dd0b6d20ed7c4cb326a

## Usage

\`\`\`bash
curl -X POST https://x402guard.xyz/api/audit/quick \\
  -H "Content-Type: application/json" \\
  -d '{"skill_url": "https://example.com/skill.md"}'
\`\`\`

For more information, visit https://x402guard.xyz
`,
};

export async function GET() {
  return NextResponse.json(DISCOVERY_DOCUMENT, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

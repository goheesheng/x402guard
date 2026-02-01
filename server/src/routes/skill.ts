import { Router } from "express";
import type { Router as RouterType, Request, Response } from "express";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "../config/index.js";
import type { SkillMetadata } from "../types/api.js";

const router: RouterType = Router();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to SKILL.md content
const SKILL_MD_PATH = join(__dirname, "../content/skill.md");

// Cache the skill content
let skillContent: string | null = null;

function getSkillContent(): string {
  if (!skillContent) {
    try {
      skillContent = readFileSync(SKILL_MD_PATH, "utf-8");
    } catch (error) {
      // Fallback content if file not found
      skillContent = `---
name: x402guard
description: Pre-install security scanning for AI agent skills
version: 0.1.0
---

# x402guard

Security scanning for AI agent skills. Visit https://x402guard.xyz for documentation.
`;
    }
  }
  return skillContent;
}

// Build skill metadata JSON
function getSkillMetadata(): SkillMetadata {
  return {
    name: "x402guard",
    description: "Pre-install security scanning for AI agent skills. Detects malware, credential theft, and data exfiltration. Pay per scan with USDC via x402 protocol.",
    version: "0.1.0",
    author: "x402guard",
    metadata: {
      openclaw: {
        requires: {
          env: ["WALLET_PRIVATE_KEY"],
          bins: [],
        },
      },
    },
    endpoints: {
      audit_quick: {
        method: "POST",
        path: "/audit/quick",
        description: "Quick YARA malware scan",
        price_usdc: "$0.05",
      },
      audit_standard: {
        method: "POST",
        path: "/audit/standard",
        description: "Full analysis with permission and network detection",
        price_usdc: "$0.15",
      },
      audit_deep: {
        method: "POST",
        path: "/audit/deep",
        description: "Complete audit with behavioral sandbox and signed attestation",
        price_usdc: "$0.50",
      },
      health: {
        method: "GET",
        path: "/health",
        description: "Health check endpoint",
        price_usdc: "free",
      },
    },
    pricing: {
      network: config.X402_NETWORK,
      asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      asset_name: "USDC",
      decimals: 6,
      tiers: {
        quick: String(config.PRICE_QUICK),
        standard: String(config.PRICE_STANDARD),
        deep: String(config.PRICE_DEEP),
      },
    },
    documentation: {
      homepage: "https://github.com/goheesheng/x402guard",
      api_reference: "https://x402guard.xyz/audit",
      skill_md: "https://x402guard.xyz/skill.md",
    },
  };
}

// GET /skill.md - Return SKILL.md as markdown
router.get("/skill.md", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.send(getSkillContent());
});

// GET /skill.json - Return structured metadata as JSON
router.get("/skill.json", (_req: Request, res: Response) => {
  res.json(getSkillMetadata());
});

// GET /skills/x402guard.md - Alternative path (ClawHub style)
router.get("/skills/x402guard.md", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.send(getSkillContent());
});

// GET /skills/x402guard.json - Alternative path for JSON
router.get("/skills/x402guard.json", (_req: Request, res: Response) => {
  res.json(getSkillMetadata());
});

export default router;

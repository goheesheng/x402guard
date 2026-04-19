// SKILL.md structured metadata for AI agents
// This file provides typed metadata for the skill.json endpoint

export interface EndpointInfo {
  method: string;
  path: string;
  description: string;
  price_usdc?: string;
  requires_payment: boolean;
}

export interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  homepage: string;
  "user-invocable": boolean;
  metadata: {
    openclaw: {
      emoji: string;
      category: string;
      primaryEnv: string;
      requires: {
        env: string[];
        bins: string[];
      };
    };
  };
  endpoints: Record<string, EndpointInfo>;
  pricing: {
    network: string;
    asset: string;
    asset_name: string;
    decimals: number;
    tiers: {
      quick: string;
      standard: string;
      deep: string;
    };
  };
  documentation: {
    homepage: string;
    api_reference: string;
    skill_md: string;
  };
}

export const SKILL_METADATA: SkillMetadata = {
  name: "x402guard",
  description:
    "Pre-install security scanning for AI agent skills. YARA malware detection, permission analysis, and trust attestation.",
  version: "1.1.0",
  author: "x402guard",
  homepage: "https://x402guard.xyz",
  "user-invocable": true,
  metadata: {
    openclaw: {
      emoji: "🛡️",
      category: "security",
      primaryEnv: "WALLET_PRIVATE_KEY",
      requires: {
        env: ["WALLET_PRIVATE_KEY"],
        bins: [],
      },
    },
  },
  endpoints: {
    audit_quick: {
      method: "POST",
      path: "/api/audit/quick",
      description: "Quick YARA malware scan ($0.10 USDC)",
      price_usdc: "0.10",
      requires_payment: true,
    },
    audit_standard: {
      method: "POST",
      path: "/api/audit/standard",
      description: "Standard scan with permissions + network analysis ($0.50 USDC)",
      price_usdc: "0.50",
      requires_payment: true,
    },
    audit_deep: {
      method: "POST",
      path: "/api/audit/deep",
      description: "Deep scan with behavioral sandbox + attestation ($1.00 USDC)",
      price_usdc: "1.00",
      requires_payment: true,
    },
    health: {
      method: "GET",
      path: "/api/health",
      description: "Health check endpoint",
      requires_payment: false,
    },
    skill_md: {
      method: "GET",
      path: "/api/skill.md",
      description: "This skill document (markdown)",
      requires_payment: false,
    },
    skill_json: {
      method: "GET",
      path: "/api/skill.json",
      description: "Skill metadata (JSON)",
      requires_payment: false,
    },
  },
  pricing: {
    network: "Base Mainnet (eip155:8453)",
    asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    asset_name: "USDC",
    decimals: 6,
    tiers: {
      quick: "0.10",
      standard: "0.50",
      deep: "1.00",
    },
  },
  documentation: {
    homepage: "https://x402guard.xyz",
    api_reference: "https://github.com/goheesheng/skillguard-monorepo",
    skill_md: "https://x402guard.xyz/api/skill.md",
  },
};

import type { AuditTier } from "@x402guard/shared-types";

export interface TierConfig {
  id: AuditTier;
  name: string;
  price: string;
  priceNum: number;
  description: string;
  features: string[];
  popular?: boolean;
}

// Update this to your deployed API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://x402guard.xyz";

export const TIERS: TierConfig[] = [
  {
    id: "quick",
    name: "Quick",
    price: "$0.01",
    priceNum: 0.01,
    description: "Fast YARA scan",
    features: [
      "YARA malware detection",
      "Risk score (0-100)",
      "Risk level classification",
      "Basic recommendation",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "$0.05",
    priceNum: 0.05,
    description: "Full analysis",
    features: [
      "All Quick features",
      "Permission analysis",
      "Network call detection",
      "Detailed findings report",
    ],
    popular: true,
  },
  {
    id: "deep",
    name: "Deep",
    price: "$0.10",
    priceNum: 0.10,
    description: "Complete audit",
    features: [
      "All Standard features",
      "Behavioral sandbox",
      "Signed attestation",
      "Full audit trail",
    ],
  },
];

export const NAV_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#scanner", label: "Scanner" },
  { href: "/docs", label: "Docs" },
];

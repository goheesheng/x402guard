import { TierConfig, FAQItem } from "@/types";

/**
 * API URL Configuration
 *
 * - Development: Set NEXT_PUBLIC_API_URL=http://localhost:3001 in .env
 * - Production: Defaults to https://x402guard.xyz
 *
 * The NEXT_PUBLIC_ prefix is required for client-side access in Next.js
 */
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

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is x402guard?",
    answer:
      "x402guard is a pre-install security auditing service for AI agent skills. It uses YARA-based malware detection, permission analysis, and network call inspection to identify security risks before you install a skill.",
  },
  {
    question: "How does the x402 payment work?",
    answer:
      "x402guard uses the x402 protocol for pay-per-use pricing. You pay in USDC on Base blockchain. Simply include the X-Payment header with your API request, and payment is processed automatically.",
  },
  {
    question: "What's the difference between scan tiers?",
    answer:
      "Quick ($0.01) runs YARA malware detection. Standard ($0.05) adds permission and network analysis. Deep ($0.10) includes behavioral sandboxing and signed attestation for full audit trails.",
  },
  {
    question: "Is my skill data stored?",
    answer:
      "No. Skill content is analyzed in memory and discarded after the audit completes. Only the audit ID and result metadata are retained for verification purposes.",
  },
  {
    question: "Do you offer enterprise solutions?",
    answer:
      "Yes! We offer custom integration, volume pricing, and dedicated support for enterprise customers. DM @goheesheng on X, founder of x402guard, for more information.",
  },
  {
    question: "What risks does x402guard detect?",
    answer:
      "x402guard detects credential stealers, data exfiltration attempts, suspicious network calls, excessive permissions, and known malware patterns. It provides a risk score (0-100) and actionable recommendations.",
  },
];

export const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#ai-agents", label: "AI Agents" },
  { href: "#scanner", label: "Scanner" },
  { href: "#integration", label: "API Docs" },
  { href: "#faq", label: "FAQ" },
  { href: "https://x402guard.gitbook.io/x402guard-whitepaper", label: "Whitepaper", external: true },
];

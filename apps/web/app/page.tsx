"use client";

import dynamic from "next/dynamic";
import { Shield } from "lucide-react";

// Dynamic imports to avoid SSR issues with wagmi hooks
const HeroToggle = dynamic(
  () => import("@/components/sections/HeroToggle").then((mod) => mod.HeroToggle),
  { ssr: false }
);
const Scanner = dynamic(
  () => import("@/components/sections/Scanner").then((mod) => mod.Scanner),
  { ssr: false }
);
const WalletConnect = dynamic(
  () => import("@/components/ui/WalletConnect").then((mod) => mod.WalletConnect),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-500" />
              <span className="font-bold text-white text-lg">x402guard</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#overview"
                className="text-sm text-dark-300 hover:text-white transition-colors"
              >
                Overview
              </a>
              <a
                href="#scanner"
                className="text-sm text-dark-300 hover:text-white transition-colors"
              >
                Scanner
              </a>
              <a
                href="/docs"
                className="text-sm text-dark-300 hover:text-white transition-colors"
              >
                Docs
              </a>
            </nav>
            <WalletConnect size="sm" />
          </div>
        </div>
      </header>

      {/* Hero Section with Human/Agent Toggle */}
      <HeroToggle />

      {/* Scanner Section */}
      <Scanner />

      {/* Integration Section */}
      <section id="integration" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary-400 font-medium mb-4 block text-sm uppercase tracking-wider">
              For Developers
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              API <span className="text-primary-400">Integration</span>
            </h2>
            <p className="text-dark-300 max-w-2xl mx-auto text-lg">
              Integrate x402guard into your AI agent workflow with our simple API.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* SDK Example */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                TypeScript SDK
              </h3>
              <pre className="bg-dark-900/50 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-dark-200">{`import { X402GuardClient } from 'x402guard-client';

const client = new X402GuardClient({
  privateKey: process.env.WALLET_PRIVATE_KEY,
});

const result = await client.auditSkill({
  skillUrl: 'https://clawhub.com/skills/weather',
  tier: 'standard',
});

if (result.recommendation === 'SAFE') {
  console.log('Safe to install!');
}`}</code>
              </pre>
            </div>

            {/* cURL Example */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                REST API
              </h3>
              <pre className="bg-dark-900/50 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-dark-200">{`curl -X POST https://x402guard.xyz/api/audit/quick \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <x402_payment_header>" \\
  -d '{
    "skill_url": "https://clawhub.com/skills/weather"
  }'

# Response:
{
  "risk_score": 15,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": { ... }
}`}</code>
              </pre>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/docs"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              View Full Documentation
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-500" />
              <span className="font-semibold text-white">x402guard</span>
            </div>
            <p className="text-sm text-gray-400">
              Built with x402 Protocol on Base
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

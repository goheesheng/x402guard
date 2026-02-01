"use client";

import { Shield, Book, Code, FileText, Terminal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";

const DOCS = [
  {
    title: "Quick Start",
    description: "Get started with x402guard in minutes",
    href: "/docs/quickstart",
    icon: Terminal,
  },
  {
    title: "API Reference",
    description: "Complete REST API documentation",
    href: "/docs/api",
    icon: Code,
  },
  {
    title: "SDK Reference",
    description: "TypeScript SDK documentation",
    href: "/docs/sdk",
    icon: Book,
  },
  {
    title: "Detection Rules",
    description: "YARA rules and threat detection",
    href: "/docs/detection",
    icon: FileText,
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Documentation
            </h1>
          </div>
          <p className="text-dark-300 text-lg">
            Everything you need to integrate x402guard into your AI agents and applications.
          </p>
        </div>

        {/* Doc Links */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {DOCS.map((doc) => (
            <Link key={doc.href} href={doc.href}>
              <Card hover className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <doc.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {doc.title}
                    </h2>
                    <p className="text-dark-400">{doc.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Example */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Example
          </h2>
          <pre className="bg-dark-900/50 rounded-xl p-4 overflow-x-auto text-sm mb-4">
            <code className="text-dark-200">{`import { X402GuardClient } from 'x402guard-client';

const client = new X402GuardClient({
  privateKey: process.env.WALLET_PRIVATE_KEY,
});

// Audit a skill before installation
const result = await client.auditSkill({
  skillUrl: 'https://clawhub.com/skills/weather',
  tier: 'standard', // $0.05 USDC
});

if (result.recommendation === 'SAFE') {
  console.log('Safe to install!');
} else {
  console.log('Risk detected:', result.findings);
}`}</code>
          </pre>
          <p className="text-dark-400 text-sm">
            Payment is handled automatically via x402 protocol using USDC on Base.
          </p>
        </Card>
      </div>
    </main>
  );
}

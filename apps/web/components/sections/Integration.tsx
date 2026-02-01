"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CodeBlock, Card, Button } from "@/components/ui";
import { fadeInUp, stagger } from "@/lib/animations";
import { ExternalLink } from "lucide-react";

const codeExamples = {
  curl: `# Quick scan ($0.05)
curl -X POST http://x402guard.xyz/audit/quick \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <x402-payment-token>" \\
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'

# Standard scan ($0.15)
curl -X POST http://x402guard.xyz/audit/standard \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <x402-payment-token>" \\
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'

# Deep scan ($0.50)
curl -X POST http://x402guard.xyz/audit/deep \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <x402-payment-token>" \\
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'`,
  python: `import requests
from x402_client import X402Client

# Initialize x402 client with your wallet
client = X402Client(private_key="YOUR_PRIVATE_KEY")

# Make authenticated request
response = client.post(
    "http://x402guard.xyz/audit/standard",
    json={"skill_url": "https://clawdhub.com/skills/weather"}
)

# Access the result
result = response.json()
print(f"Risk Score: {result['risk_score']}")
print(f"Risk Level: {result['risk_level']}")
print(f"Recommendation: {result['recommendation']}")`,
  javascript: `import { X402Client } from '@x402/client';

// Initialize x402 client with your wallet
const client = new X402Client({
  privateKey: process.env.PRIVATE_KEY
});

// Make authenticated request
const response = await client.fetch(
  'http://x402guard.xyz/audit/standard',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      skill_url: 'https://clawdhub.com/skills/weather'
    })
  }
);

const result = await response.json();
console.log('Risk Score:', result.risk_score);
console.log('Risk Level:', result.risk_level);
console.log('Recommendation:', result.recommendation);`,
};

const responseExample = `{
  "risk_score": 12,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "permissions": ["network:read"],
    "network": ["api.weather.com"]
  },
  "audit_id": "aud_abc123",
  "timestamp": "2026-01-31T10:30:00Z",
  "tier": "standard",
  "attestation": "0x..."
}`;

type Language = "curl" | "python" | "javascript";

export function Integration() {
  const [activeTab, setActiveTab] = useState<Language>("curl");

  return (
    <section id="integration" className="py-24 relative bg-dark-900/50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeInUp}
            className="text-primary-400 font-medium mb-4 block text-sm uppercase tracking-wider"
          >
            For Developers
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Simple <span className="text-primary-400">Integration</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-dark-300 max-w-2xl mx-auto text-lg"
          >
            One API call with x402 payment. Works with any agent framework, any
            language, any platform.
          </motion.p>
        </motion.div>

        {/* Language Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <div className="flex gap-2 p-1 bg-dark-800 rounded-xl w-fit mx-auto">
            {(["curl", "python", "javascript"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === lang
                    ? "bg-primary-500 text-white"
                    : "text-dark-400 hover:text-white"
                }`}
              >
                {lang === "curl" ? "cURL" : lang === "python" ? "Python" : "JavaScript"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <CodeBlock
            code={codeExamples[activeTab]}
            language={activeTab}
            title={`${activeTab === "curl" ? "Terminal" : activeTab === "python" ? "Python" : "JavaScript"}`}
          />
        </motion.div>

        {/* Response Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-lg font-semibold mb-4 text-center text-dark-300">
            Response
          </h3>
          <CodeBlock
            code={responseExample}
            language="json"
            title="JSON Response"
          />
        </motion.div>

        {/* Integration Cards */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "x402 Integration",
              description:
                "Learn how to integrate x402 payments into your agent for seamless audits.",
              link: "https://x402.org",
              linkText: "x402 Protocol",
            },
            {
              title: "Enterprise Solutions",
              description:
                "Need custom integration or volume pricing? Contact us for enterprise options.",
              link: "mailto:enterprise@x402guard.dev",
              linkText: "Contact Sales",
            },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card hover className="h-full flex flex-col">
                <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-dark-400 text-sm mb-4 flex-grow">
                  {item.description}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-400 text-sm hover:text-primary-300 transition-colors"
                >
                  {item.linkText}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

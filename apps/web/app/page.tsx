"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  Zap,
  Lock,
  Code,
  FileSearch,
  Bug,
  Network,
  ChevronRight,
  Github,
  ExternalLink,
  Terminal,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useState } from "react";

const API_URL = "https://skillguard-api.vercel.app";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Hero Section
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary-400 text-sm font-medium">
            <Zap className="w-4 h-4" />
            Powered by x402 Protocol
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="text-white">Secure Every</span>
          <br />
          <span className="text-glow text-primary-400">Agent Skill</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-dark-300 max-w-2xl mx-auto mb-10"
        >
          Pre-install security auditing for AI agent skills. YARA malware
          detection, permission analysis, and trust attestation — before you
          install.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#pricing"
            className="group px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
          >
            Start Scanning
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://github.com/goheesheng/skillguard-api"
            target="_blank"
            className="px-8 py-4 glass hover:bg-white/10 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
        </motion.div>

        {/* Floating shield animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <Shield className="w-8 h-8 text-primary-500/50" />
        </motion.div>
      </div>
    </section>
  );
}

// Problem Section
function Problem() {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            The Problem with{" "}
            <span className="text-red-400">Unsigned Skills</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-dark-300 max-w-2xl mx-auto">
            &quot;skill.md is an unsigned binary&quot; — Rufio scanned 286 ClawdHub
            skills and found credential stealers disguised as legitimate tools.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Bug,
              title: "Malware Hidden in Skills",
              description:
                "Credential stealers disguised as weather skills, reading .aws/credentials and .ssh keys",
              color: "text-red-400",
            },
            {
              icon: Network,
              title: "Silent Data Exfiltration",
              description:
                "Skills that POST your secrets to webhook.site or requestbin without you knowing",
              color: "text-orange-400",
            },
            {
              icon: AlertTriangle,
              title: "No Pre-Install Verification",
              description:
                "x402-secure checks payments, but nobody checks the skill code BEFORE installation",
              color: "text-yellow-400",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <item.icon className={`w-12 h-12 ${item.color} mb-4`} />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-dark-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Solution Section
function Solution() {
  return (
    <section className="py-24 relative bg-dark-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          <div>
            <motion.span
              variants={fadeInUp}
              className="text-primary-400 font-medium mb-4 block"
            >
              THE SOLUTION
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              SkillScan fills the{" "}
              <span className="text-primary-400">security gap</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-dark-300 mb-8">
              The missing Layer 2 of the agentic trust stack. While x402-secure
              handles payment security (Layer 3-4), SkillScan verifies code
              security BEFORE installation.
            </motion.p>

            <motion.div variants={stagger} className="space-y-4">
              {[
                "YARA-based malware detection",
                "Permission manifest extraction",
                "Network call analysis",
                "Credential access detection",
                "Risk scoring (0-100)",
                "Install recommendations",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-dark-200">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Trust Stack Diagram */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-lg font-semibold mb-6 text-center text-dark-300">
              AGENTIC TRUST STACK
            </h3>
            <div className="space-y-4">
              {[
                {
                  layer: "Layer 4",
                  name: "Payment Security",
                  status: "x402-secure ✓",
                  color: "bg-green-500/20 border-green-500/50",
                },
                {
                  layer: "Layer 3",
                  name: "Runtime Behavior",
                  status: "Trustline ✓",
                  color: "bg-green-500/20 border-green-500/50",
                },
                {
                  layer: "Layer 2",
                  name: "Code Security",
                  status: "SkillScan ★",
                  color: "bg-primary-500/30 border-primary-500 animate-pulse",
                  highlight: true,
                },
                {
                  layer: "Layer 1",
                  name: "Identity",
                  status: "ERC-8004 ◐",
                  color: "bg-yellow-500/20 border-yellow-500/50",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl border ${item.color} ${
                    item.highlight ? "ring-2 ring-primary-500/50" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-dark-400">{item.layer}</span>
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <span
                      className={`text-sm ${
                        item.highlight ? "text-primary-400 font-bold" : "text-dark-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Interactive Scanner Section
function Scanner() {
  const [skillUrl, setSkillUrl] = useState("https://clawdhub.com/skills/weather");
  const [skillContent, setSkillContent] = useState("");
  const [selectedTier, setSelectedTier] = useState<"quick" | "standard" | "deep">("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState<any>(null);

  const tiers = [
    {
      id: "quick" as const,
      name: "Quick",
      price: "$0.05",
      priceNum: 0.05,
      description: "Fast YARA scan",
      features: [
        "YARA malware detection",
        "Risk score (0-100)",
        "Risk level classification",
        "Basic recommendation",
      ],
    },
    {
      id: "standard" as const,
      name: "Standard",
      price: "$0.15",
      priceNum: 0.15,
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
      id: "deep" as const,
      name: "Deep",
      price: "$0.50",
      priceNum: 0.50,
      description: "Complete audit",
      features: [
        "All Standard features",
        "Behavioral sandbox",
        "Signed attestation",
        "Full audit trail",
      ],
    },
  ];

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setPaymentRequired(null);

    try {
      const response = await fetch(`${API_URL}/audit/${selectedTier}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill_url: skillUrl || undefined,
          skill_content: skillContent || undefined,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment required - show x402 payment info
        setPaymentRequired(data);
      } else if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  const selectedTierData = tiers.find(t => t.id === selectedTier)!;

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Scan a <span className="text-primary-400">Skill</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-dark-300 max-w-2xl mx-auto">
            Pay per audit with USDC on Base via x402. No subscriptions, no accounts — 
            just send payment with your request.
          </motion.p>
        </motion.div>

        {/* Tier Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => (
            <motion.button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`glass rounded-2xl p-6 text-left transition-all border-2 ${
                selectedTier === tier.id
                  ? "border-primary-500 ring-2 ring-primary-500/30"
                  : "border-transparent hover:border-dark-600"
              } ${tier.popular ? "relative" : ""}`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className="text-dark-400 text-sm">{tier.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedTier === tier.id ? "border-primary-500 bg-primary-500" : "border-dark-500"
                }`}>
                  {selectedTier === tier.id && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-primary-400">{tier.price}</span>
                <span className="text-dark-400 text-sm">USDC</span>
              </div>
              <ul className="space-y-2">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-dark-300">
                    <CheckCircle className="w-3 h-3 text-primary-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium mb-2">Skill URL</label>
              <input
                type="url"
                value={skillUrl}
                onChange={(e) => setSkillUrl(e.target.value)}
                placeholder="https://clawdhub.com/skills/weather"
                className="w-full p-4 bg-dark-800 rounded-xl border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <p className="text-dark-500 text-xs mt-2">Or paste content below</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Skill Content (optional)</label>
              <textarea
                value={skillContent}
                onChange={(e) => setSkillContent(e.target.value)}
                placeholder="Paste skill.md content here..."
                rows={3}
                className="w-full p-4 bg-dark-800 rounded-xl border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <button
            onClick={runAudit}
            disabled={loading || (!skillUrl && !skillContent)}
            className="mt-6 w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Run {selectedTierData.name} Audit ({selectedTierData.price} USDC)
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        {(result || paymentRequired || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            )}

            {paymentRequired && (
              <div className="space-y-6">
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-bold text-yellow-400">Payment Required (402)</h3>
                  </div>
                  <p className="text-dark-300 mb-4">{paymentRequired.description || "x402 payment required to access this endpoint"}</p>
                  
                  <div className="code-block p-4 rounded-lg text-sm">
                    <p className="text-dark-400 mb-2">Payment Details:</p>
                    <pre className="text-primary-400 overflow-x-auto">
                      {JSON.stringify(paymentRequired.accepts || paymentRequired, null, 2)}
                    </pre>
                  </div>
                  
                  <p className="text-dark-400 text-sm mt-4">
                    Use an x402-compatible wallet to make the payment and include the X-Payment header in your request.
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Audit Result</h3>
                  <span className="text-dark-400 text-sm">ID: {result.audit_id}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl ${
                    result.risk_score < 25 ? "bg-green-500/20 border border-green-500/50" :
                    result.risk_score < 50 ? "bg-yellow-500/20 border border-yellow-500/50" :
                    result.risk_score < 75 ? "bg-orange-500/20 border border-orange-500/50" :
                    "bg-red-500/20 border border-red-500/50"
                  }`}>
                    <p className="text-dark-400 text-sm">Risk Score</p>
                    <p className="text-3xl font-bold">{result.risk_score}/100</p>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    result.risk_level === "LOW" ? "bg-green-500/10" :
                    result.risk_level === "MEDIUM" ? "bg-yellow-500/10" :
                    result.risk_level === "HIGH" ? "bg-orange-500/10" :
                    "bg-red-500/10"
                  }`}>
                    <p className="text-dark-400 text-sm">Risk Level</p>
                    <p className={`text-2xl font-bold ${
                      result.risk_level === "LOW" ? "text-green-400" :
                      result.risk_level === "MEDIUM" ? "text-yellow-400" :
                      result.risk_level === "HIGH" ? "text-orange-400" :
                      "text-red-400"
                    }`}>{result.risk_level}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800">
                    <p className="text-dark-400 text-sm">Recommendation</p>
                    <p className={`text-2xl font-bold ${
                      result.recommendation === "SAFE" ? "text-green-400" :
                      result.recommendation === "CAUTION" ? "text-yellow-400" :
                      "text-red-400"
                    }`}>{result.recommendation}</p>
                  </div>
                </div>

                {result.findings && (
                  <div className="code-block p-4 rounded-xl">
                    <p className="text-dark-400 text-sm mb-2">Findings:</p>
                    <pre className="text-sm text-dark-200 overflow-x-auto">
                      {JSON.stringify(result.findings, null, 2)}
                    </pre>
                  </div>
                )}

                {result.attestation && (
                  <div className="p-4 bg-primary-500/10 border border-primary-500/50 rounded-xl">
                    <p className="text-dark-400 text-sm mb-1">Attestation</p>
                    <p className="font-mono text-sm text-primary-400 break-all">{result.attestation}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Integration Section
function Integration() {
  return (
    <section className="py-24 relative bg-dark-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Simple <span className="text-primary-400">Integration</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-dark-300 max-w-2xl mx-auto">
            One API call with x402 payment. Works with any agent framework.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="code-block p-6 overflow-x-auto"
        >
          <div className="flex items-center gap-2 mb-4 text-dark-400">
            <Terminal className="w-4 h-4" />
            <span className="text-sm">curl</span>
          </div>
          <pre className="text-sm text-dark-200">
            <code>{`# Quick scan ($0.05)
curl -X POST ${API_URL}/audit/quick \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <x402-payment-token>" \\
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'

# Standard scan ($0.15)
curl -X POST ${API_URL}/audit/standard \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <x402-payment-token>" \\
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'

# Deep scan ($0.50)
curl -X POST ${API_URL}/audit/deep \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <x402-payment-token>" \\
  -d '{"skill_url": "https://clawdhub.com/skills/weather"}'

# Response
{
  "risk_score": 12,
  "risk_level": "LOW",
  "recommendation": "SAFE",
  "findings": {
    "malware": [],
    "permissions": ["network:read"],
    "network": ["api.weather.com"]
  },
  "audit_id": "aud_abc123",
  "timestamp": "2025-01-31T10:30:00Z",
  "tier": "standard",
  "attestation": "0x..."
}`}</code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-dark-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-400" />
            <span className="font-bold text-xl">SkillScan</span>
          </div>
          <div className="flex items-center gap-6 text-dark-400">
            <a
              href="https://github.com/goheesheng/skillguard-api"
              className="hover:text-white transition-colors flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <a
              href="https://x402.org"
              className="hover:text-white transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              x402 Protocol
            </a>
          </div>
          <p className="text-dark-500 text-sm">
            Built for the agentic economy
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Solution />
      <Scanner />
      <Integration />
      <Footer />
    </main>
  );
}

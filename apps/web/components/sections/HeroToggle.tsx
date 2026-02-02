"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, ChevronRight, User, Bot, Copy, Check } from "lucide-react";
import { Button, CodeBlock } from "@/components/ui";

type UserType = "human" | "agent";
type TabType = "prompt" | "manual";

const HUMAN_CONTENT = {
  headline: "Secure Every Agent Skill",
  subheadline:
    "Pre-install security auditing for AI agent skills. YARA malware detection, permission analysis, and trust attestation — all before you install.",
  cta: "Start Scanning",
  stats: [
    { value: "286+", label: "Skills Scanned" },
    { value: "<2s", label: "Avg Scan Time" },
    { value: "$0.01", label: "Starting Price" },
  ],
};

const AGENT_CONTENT = {
  headline: "Security for AI Agents",
  subheadline: "Scan skills before execution — powered by x402 micropayments",
  promptInstruction:
    "Read https://x402guard.xyz/api/skill.md and follow the instructions to scan a skill",
  curlExample: `curl -X POST https://x402guard.xyz/api/audit/quick \\
  -H "Content-Type: application/json" \\
  -d '{"skill_url": "https://clawhub.com/skills/weather"}'`,
  steps: [
    { step: 1, text: "Send skill.md URL to your agent" },
    { step: 2, text: "Agent reads instructions & signs x402 payment" },
    { step: 3, text: "Receive audit results with risk score" },
  ],
};

export function HeroToggle() {
  const [userType, setUserType] = useState<UserType>("human");
  const [activeTab, setActiveTab] = useState<TabType>("prompt");
  const [copied, setCopied] = useState(false);

  const scrollToScanner = () => {
    const element = document.querySelector("#scanner");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToIntegration = () => {
    const element = document.querySelector("#integration");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(AGENT_CONTENT.promptInstruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="overview"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary-600/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary-400 text-sm font-medium">
            <Zap className="w-4 h-4" />
            Powered by x402 Protocol
          </span>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex justify-center gap-3 mb-8"
        >
          <button
            onClick={() => setUserType("human")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-medium transition-all ${
              userType === "human"
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-transparent text-dark-300 border-dark-700 hover:border-dark-500"
            }`}
          >
            <User className="w-4 h-4" />
            I&apos;m a Human
          </button>
          <button
            onClick={() => setUserType("agent")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-medium transition-all ${
              userType === "agent"
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-transparent text-dark-300 border-dark-700 hover:border-dark-500"
            }`}
          >
            <Bot className="w-4 h-4" />
            I&apos;m an Agent
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {userType === "human" ? (
            <motion.div
              key="human"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Secure Every</span>
                <br />
                <span className="text-glow text-primary-400">Agent Skill</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                {HUMAN_CONTENT.subheadline}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={scrollToScanner}
                  rightIcon={
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                  className="group"
                >
                  {HUMAN_CONTENT.cta}
                </Button>
              </div>

              {/* Stats row */}
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                {HUMAN_CONTENT.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary-400">
                      {stat.value}
                    </div>
                    <div className="text-sm text-dark-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="agent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Agent Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                <span className="text-white">{AGENT_CONTENT.headline}</span>
              </h1>

              {/* Agent Subheadline */}
              <p className="text-lg md:text-xl text-dark-300 max-w-xl mx-auto mb-8 leading-relaxed">
                {AGENT_CONTENT.subheadline}
              </p>

              {/* Tabs */}
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("prompt")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "prompt"
                      ? "bg-dark-800 text-white"
                      : "text-dark-400 hover:text-white"
                  }`}
                >
                  prompt
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "manual"
                      ? "bg-dark-800 text-white"
                      : "text-dark-400 hover:text-white"
                  }`}
                >
                  manual
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "prompt" ? (
                  <motion.div
                    key="prompt-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="glass rounded-xl p-6 text-left relative group">
                      <p className="text-dark-200 font-mono text-sm md:text-base leading-relaxed">
                        {AGENT_CONTENT.promptInstruction}
                      </p>
                      <button
                        onClick={copyPrompt}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl mx-auto"
                  >
                    <CodeBlock
                      code={AGENT_CONTENT.curlExample}
                      language="bash"
                      title="Quick Scan ($0.01 USDC)"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Steps */}
              <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 md:gap-10">
                {AGENT_CONTENT.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </span>
                    <span className="text-dark-300 text-sm text-left">
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={scrollToIntegration}
                  rightIcon={
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                  className="group"
                >
                  View API Docs
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating shield */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <Shield className="w-8 h-8 text-primary-500/30" />
        </motion.div>
      </div>
    </section>
  );
}

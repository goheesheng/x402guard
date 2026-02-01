"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Terminal,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Key,
  Database,
  Code,
  Settings,
  ExternalLink,
  Quote,
} from "lucide-react";
import { Card, Badge, CodeBlock, Button } from "@/components/ui";
import { fadeInUp, stagger } from "@/lib/animations";

const SKILL_CAPABILITIES = [
  {
    icon: FileText,
    title: "File Access",
    description: "Read and write files on your system",
    examples: ["Create documents", "Modify configs", "Access data files"],
  },
  {
    icon: Terminal,
    title: "Shell Commands",
    description: "Execute terminal commands directly",
    examples: ["Run scripts", "Install packages", "Manage processes"],
  },
  {
    icon: Globe,
    title: "Browser Automation",
    description: "Control web browsers programmatically",
    examples: ["Open URLs", "Fill forms", "Capture screenshots"],
  },
];

const COMPARISON_RISKS = [
  {
    icon: Key,
    title: "Credential Theft",
    description: "Malicious skills can steal API keys and passwords",
  },
  {
    icon: Database,
    title: "Data Exfiltration",
    description: "Sensitive data can be sent to external servers",
  },
  {
    icon: Terminal,
    title: "Malicious Commands",
    description: "Hidden commands can damage your system",
  },
  {
    icon: Settings,
    title: "Excessive Permissions",
    description: "Skills may request more access than needed",
  },
];

const COMPARISON_PROTECTIONS = [
  {
    icon: ShieldCheck,
    title: "Permission Verification",
    description: "Every permission request is analyzed and flagged",
  },
  {
    icon: Globe,
    title: "Network Inspection",
    description: "All external calls are detected and reviewed",
  },
  {
    icon: Code,
    title: "Malware Detection",
    description: "YARA rules catch known malicious patterns",
  },
  {
    icon: ShieldCheck,
    title: "Safe Recommendations",
    description: "Clear risk scores help you decide safely",
  },
];

const SKILL_EXAMPLE = `---
name: nano-banana-pro
description: Generate images via Gemini
metadata:
  openclaw:
    requires:
      bins: ["uv"]
      env: ["GEMINI_API_KEY"]
---

# Instructions

This skill enables image generation using
Google's Gemini API. The agent can create
images based on text descriptions.

## Usage
Describe the image you want to generate...`;

const METADATA_FIELDS: Array<{
  field: string;
  description: string;
  securityLevel: "high" | "medium" | "low";
}> = [
  {
    field: "name",
    description: "Unique identifier for the skill",
    securityLevel: "low",
  },
  {
    field: "description",
    description: "What the skill does",
    securityLevel: "low",
  },
  {
    field: "bins",
    description: "Required system binaries (executables)",
    securityLevel: "high",
  },
  {
    field: "env",
    description: "Required environment variables (API keys)",
    securityLevel: "high",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I wanted to automate tasks from Todoist and claw was able to create a skill for it on its own, all within a Telegram chat",
    author: "@iamsubhrajyoti",
    context: "Skill self-creation",
  },
  {
    quote:
      "My OpenClaw realised it needed an API key... it opened my browser... opened Google Cloud Console... Configured OAuth and provisioned a new token",
    author: "@Infoxicador",
    context: "Autonomous API setup",
  },
];

export function AgentSkills() {
  return (
    <section id="ai-agents" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
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
            AI Agent Skills
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            What Powers <span className="text-primary-400">Modern AI Agents</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-dark-300 max-w-2xl mx-auto text-lg"
          >
            SKILL.md files teach AI agents how to use tools. They can execute commands,
            access files, and control browsers — that&apos;s why security auditing is essential.
          </motion.p>
        </motion.div>

        {/* Capability Cards */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          {SKILL_CAPABILITIES.map((capability, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card hover className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <capability.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {capability.title}
                    </h3>
                    <p className="text-dark-400 text-sm mb-3">
                      {capability.description}
                    </p>
                    <ul className="space-y-1">
                      {capability.examples.map((example, j) => (
                        <li
                          key={j}
                          className="text-xs text-dark-500 flex items-center gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-primary-500" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Section */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-20"
        >
          <motion.h3
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-4"
          >
            Why Skills Need <span className="text-primary-400">Auditing</span>
          </motion.h3>
          <motion.p
            variants={fadeInUp}
            className="text-dark-400 text-center mb-10 max-w-xl mx-auto"
          >
            Without security auditing, you&apos;re trusting unknown code with system access
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Without Auditing */}
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-red-400">Without Auditing</h4>
              </div>
              <div className="space-y-3">
                {COMPARISON_RISKS.map((risk, i) => (
                  <Card
                    key={i}
                    className="bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                  >
                    <div className="flex items-start gap-3">
                      <risk.icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-white text-sm">{risk.title}</p>
                        <p className="text-dark-400 text-xs">{risk.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* With x402guard */}
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-green-400">With x402guard</h4>
              </div>
              <div className="space-y-3">
                {COMPARISON_PROTECTIONS.map((protection, i) => (
                  <Card
                    key={i}
                    className="bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                  >
                    <div className="flex items-start gap-3">
                      <protection.icon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-white text-sm">
                          {protection.title}
                        </p>
                        <p className="text-dark-400 text-xs">
                          {protection.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* SKILL.md Format Showcase */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-20"
        >
          <motion.h3
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-4"
          >
            The <span className="text-primary-400">SKILL.md</span> Format
          </motion.h3>
          <motion.p
            variants={fadeInUp}
            className="text-dark-400 text-center mb-10 max-w-xl mx-auto"
          >
            A teaching document that tells AI how to use a specific tool
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Code Example */}
            <motion.div variants={fadeInUp}>
              <CodeBlock code={SKILL_EXAMPLE} language="yaml" title="skill.md" />
            </motion.div>

            {/* Field Explanations */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <h4 className="font-semibold text-white mb-4">
                Security-Relevant Fields
              </h4>
              {METADATA_FIELDS.map((field, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <code className="text-primary-400 text-sm font-mono">
                        {field.field}
                      </code>
                      <p className="text-dark-400 text-sm mt-1">
                        {field.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        field.securityLevel === "high"
                          ? "danger"
                          : field.securityLevel === "medium"
                          ? "warning"
                          : "default"
                      }
                      size="sm"
                    >
                      {field.securityLevel === "high"
                        ? "High Risk"
                        : field.securityLevel === "medium"
                        ? "Medium"
                        : "Low"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h3
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-4"
          >
            Real <span className="text-primary-400">AI Agent</span> Capabilities
          </motion.h3>
          <motion.p
            variants={fadeInUp}
            className="text-dark-400 text-center mb-10 max-w-xl mx-auto"
          >
            These powerful capabilities are why security auditing matters
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="glass h-full">
                  <div className="flex flex-col h-full">
                    <Quote className="w-8 h-8 text-primary-500/30 mb-4" />
                    <p className="text-dark-200 italic flex-grow mb-4">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-400 font-medium">
                        {testimonial.author}
                      </span>
                      <Badge variant="default" size="sm">
                        {testimonial.context}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="text-center">
            <Button
              variant="ghost"
              size="lg"
              rightIcon={<ExternalLink className="w-4 h-4" />}
              onClick={() => window.open("https://openclaw.ai/", "_blank")}
            >
              Learn More at OpenClaw.ai
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

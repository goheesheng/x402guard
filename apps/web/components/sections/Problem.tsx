"use client";

import { motion } from "framer-motion";
import { Bug, Network, AlertTriangle, FileWarning, Key, Webhook } from "lucide-react";
import { Card } from "@/components/ui";
import { fadeInUp, stagger } from "@/lib/animations";

const risks = [
  {
    icon: Bug,
    title: "Hidden Malware",
    description:
      "Credential stealers disguised as legitimate skills, silently reading your .aws/credentials and .ssh keys.",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Webhook,
    title: "Data Exfiltration",
    description:
      "Skills that POST your secrets to webhook.site or external servers without any visible indication.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: AlertTriangle,
    title: "No Pre-Install Checks",
    description:
      "x402-secure handles payments, but nobody verifies the skill code BEFORE you install it.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Key,
    title: "Excessive Permissions",
    description:
      "Skills requesting full system access when they only need to fetch weather data.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Network,
    title: "Suspicious Network Calls",
    description:
      "Outbound connections to unknown IPs or domains that have nothing to do with the skill's purpose.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: FileWarning,
    title: "Obfuscated Code",
    description:
      "Base64-encoded payloads and eval() calls hiding malicious intent in plain sight.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
];

export function Problem() {
  return (
    <section id="how-it-works" className="py-24 relative">
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
            className="text-red-400 font-medium mb-4 block text-sm uppercase tracking-wider"
          >
            The Problem
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            The Risk of{" "}
            <span className="text-red-400">Unsigned Skills</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-dark-300 max-w-2xl mx-auto text-lg"
          >
            &quot;skill.md is an unsigned binary&quot; — scanning 286 ClawdHub
            skills revealed credential stealers disguised as legitimate tools.
          </motion.p>
        </motion.div>

        {/* Risk Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {risks.map((risk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full group">
                <div
                  className={`w-12 h-12 rounded-xl ${risk.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <risk.icon className={`w-6 h-6 ${risk.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {risk.title}
                </h3>
                <p className="text-dark-400 leading-relaxed">
                  {risk.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

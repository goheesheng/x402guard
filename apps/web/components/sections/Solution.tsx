"use client";

import { motion } from "framer-motion";
import { CheckCircle, Shield, Scan, FileCheck, Lock } from "lucide-react";
import { Card } from "@/components/ui";
import { fadeInUp, stagger } from "@/lib/animations";

const features = [
  "YARA-based malware detection",
  "Permission manifest extraction",
  "Network call analysis",
  "Credential access detection",
  "Risk scoring (0-100)",
  "Actionable recommendations",
];

const trustStack = [
  {
    layer: "Layer 4",
    name: "Payment Security",
    status: "x402-secure",
    color: "bg-green-500/20 border-green-500/50",
    statusColor: "text-green-400",
  },
  {
    layer: "Layer 3",
    name: "Runtime Behavior",
    status: "Trustline",
    color: "bg-green-500/20 border-green-500/50",
    statusColor: "text-green-400",
  },
  {
    layer: "Layer 2",
    name: "Code Security",
    status: "x402guard",
    color: "bg-primary-500/30 border-primary-500",
    statusColor: "text-primary-400",
    highlight: true,
  },
  {
    layer: "Layer 1",
    name: "Identity",
    status: "ERC-8004",
    color: "bg-yellow-500/20 border-yellow-500/50",
    statusColor: "text-yellow-400",
  },
];

export function Solution() {
  return (
    <section className="py-24 relative bg-dark-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left: Content */}
          <div>
            <motion.span
              variants={fadeInUp}
              className="text-primary-400 font-medium mb-4 block text-sm uppercase tracking-wider"
            >
              The Solution
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              x402guard fills the{" "}
              <span className="text-primary-400">security gap</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-dark-300 mb-8 text-lg leading-relaxed"
            >
              The missing Layer 2 of the agentic trust stack. While x402-secure
              handles payment security, x402guard verifies code security{" "}
              <span className="text-white font-medium">BEFORE</span> installation.
            </motion.p>

            {/* Features list */}
            <motion.div variants={stagger} className="space-y-3">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-dark-200">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Trust Stack Diagram */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8">
              <h3 className="text-sm font-semibold mb-6 text-center text-dark-400 uppercase tracking-wider">
                Agentic Trust Stack
              </h3>
              <div className="space-y-3">
                {trustStack.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border ${item.color} ${
                      item.highlight ? "ring-2 ring-primary-500/50 animate-pulse-slow" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-dark-500 uppercase tracking-wider">
                          {item.layer}
                        </span>
                        <p className="font-medium text-white">{item.name}</p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${item.statusColor}`}
                      >
                        {item.status}
                        {item.highlight && " ★"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-24"
        >
          <motion.h3
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-12 text-center"
          >
            How It Works
          </motion.h3>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Scan,
                step: "1",
                title: "Submit Skill",
                description: "Provide a skill URL or paste the content directly",
              },
              {
                icon: FileCheck,
                step: "2",
                title: "Deep Analysis",
                description: "YARA scans, permission extraction, network analysis",
              },
              {
                icon: Shield,
                step: "3",
                title: "Risk Assessment",
                description: "Get a risk score (0-100) with detailed findings",
              },
              {
                icon: Lock,
                step: "4",
                title: "Attestation",
                description: "Receive a signed attestation for verified skills",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-dark-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

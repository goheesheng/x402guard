"use client";

import { motion } from "framer-motion";
import { Accordion } from "@/components/ui";
import { FAQ_ITEMS } from "@/lib/constants";
import { fadeInUp, stagger } from "@/lib/animations";
import { MessageCircle } from "lucide-react";

export function FAQ() {
  const accordionItems = FAQ_ITEMS.map((item, i) => ({
    id: `faq-${i}`,
    title: item.question,
    content: item.answer,
  }));

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
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
            Questions?
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Frequently Asked <span className="text-primary-400">Questions</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-dark-300 text-lg"
          >
            Everything you need to know about x402guard
          </motion.p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion items={accordionItems} />
        </motion.div>

        {/* Support Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 glass rounded-2xl text-center"
        >
          <p className="text-dark-300 mb-4">
            Still have questions? We&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@x402guard.dev"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

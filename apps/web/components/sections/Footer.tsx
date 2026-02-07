"use client";

import { Shield, ExternalLink } from "lucide-react";

// X (formerly Twitter) icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 border-t border-dark-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary-400" />
              <span className="font-bold text-2xl">
                x402<span className="text-primary-400">guard</span>
              </span>
            </a>
            <p className="text-dark-400 mb-6 max-w-md">
              Pre-install security auditing for AI agent skills. Powered by the
              x402 protocol for seamless pay-per-use pricing.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/x402guard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-white transition-colors"
                title="X (Twitter)"
              >
                <XIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#how-it-works"
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#scanner"
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  Scanner
                </a>
              </li>
              <li>
                <a
                  href="#integration"
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  Integration
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://x402.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  x402 Protocol
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://x402guard.gitbook.io/x402guard-whitepaper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Whitepaper
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dark-500 text-sm">
            &copy; {currentYear} x402guard. Built for the agentic economy.
          </p>
          <div className="flex items-center gap-6 text-dark-500 text-sm">
            <span>Powered by x402 Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { Button } from "./Button";

interface NetworkSwitchModalProps {
  isOpen: boolean;
}

export function NetworkSwitchModal({ isOpen }: NetworkSwitchModalProps) {
  const { chain } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();
  const [switchError, setSwitchError] = useState<string | null>(null);

  const chainId = chain?.id ?? 0;

  // Clear error when modal closes or chain changes
  useEffect(() => {
    if (!isOpen || chainId === base.id) {
      setSwitchError(null);
    }
  }, [isOpen, chainId]);

  // Handle switch error
  useEffect(() => {
    if (error) {
      setSwitchError(error.message || "Failed to switch network");
    }
  }, [error]);

  const handleSwitch = () => {
    setSwitchError(null);
    switchChain({ chainId: base.id });
  };

  const getChainName = (id: number) => {
    const chains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      42161: "Arbitrum",
      10: "Optimism",
      56: "BNB Chain",
      43114: "Avalanche",
      8453: "Base",
    };
    return chains[id] || `Chain ${id}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md"
          >
            <div className="glass rounded-2xl p-8 border border-yellow-500/30 bg-dark-900/95">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Switch to Base Network
              </h2>

              {/* Description */}
              <p className="text-dark-400 text-center mb-6">
                x402guard requires Base network for USDC payments. Please switch
                your wallet to continue.
              </p>

              {/* Current Network Info */}
              <div className="bg-dark-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">Current Network</span>
                  <span className="text-white font-medium">
                    {getChainName(chainId)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-dark-400 text-sm">Required Network</span>
                  <div className="flex items-center gap-2">
                    {/* Base Logo */}
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                    <span className="text-primary-400 font-medium">Base</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {switchError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                  <p className="text-red-400 text-sm text-center">
                    {switchError}
                  </p>
                </div>
              )}

              {/* Switch Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSwitch}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Switching...
                  </>
                ) : (
                  "Switch to Base"
                )}
              </Button>

              {/* Help Link */}
              <a
                href="https://docs.base.org/docs/using-base/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 mt-4 text-dark-500 hover:text-dark-300 text-sm transition-colors"
              >
                Learn more about Base
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

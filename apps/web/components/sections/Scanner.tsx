"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle,
  Loader2,
  AlertCircle,
  Wallet,
  PenLine,
  CreditCard,
} from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { Card, Button, Input, Textarea, Badge, VulnerabilityDisplay } from "@/components/ui";
import { WalletConnect } from "@/components/ui/WalletConnect";
import { TIERS } from "@/lib/constants";
import { runAudit, getRiskColor, getRiskLevelColor, getRecommendationColor } from "@/lib/api";
import { useX402Payment } from "@/lib/hooks/useX402Payment";
import { fadeInUp, stagger } from "@/lib/animations";
import type { AuditTier, AuditResult } from "@/types";

interface PaymentInfo {
  transactionHash: string;
  paidAmount: string;
}

type ScanState =
  | "idle"
  | "awaiting_signature"
  | "processing"
  | "success"
  | "error";

export function Scanner() {
  const [skillUrl, setSkillUrl] = useState("https://clawdhub.com/skills/weather");
  const [skillContent, setSkillContent] = useState("");
  const [selectedTier, setSelectedTier] = useState<AuditTier>("standard");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { fetchWithPayment, isReady } = useX402Payment();

  const isWrongNetwork = isConnected && chainId !== base.id;

  const handleScan = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    // Check if on wrong network and switch
    if (isWrongNetwork) {
      try {
        await switchChain({ chainId: base.id });
        // Wait a bit for the switch to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err: any) {
        setError("Please switch to Base network in your wallet");
        return;
      }
    }

    if (!fetchWithPayment) {
      setError("Payment client not ready. Please try again.");
      return;
    }

    setScanState("awaiting_signature");
    setError(null);
    setResult(null);

    try {
      // Use x402 wrapped fetch for payment
      setScanState("processing");

      const response = await runAudit(
        selectedTier,
        {
          skill_url: skillUrl || undefined,
          skill_content: skillContent || undefined,
        },
        fetchWithPayment
      );

      if (response.success && response.data) {
        setResult(response.data);
        setScanState("success");

        // Store payment info if available
        if (response.paymentDetails?.transactionHash) {
          setPaymentInfo({
            transactionHash: response.paymentDetails.transactionHash,
            paidAmount: selectedTierData.price,
          });
        }
      } else if (response.error) {
        setError(response.error);
        setScanState("error");
      } else if (response.paymentRequired) {
        // This shouldn't happen with x402 fetch, but handle it
        setError("Payment failed. Please ensure you have sufficient USDC on Base.");
        setScanState("error");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setScanState("error");
    }
  };

  const selectedTierData = TIERS.find((t) => t.id === selectedTier)!;
  const isLoading = scanState === "awaiting_signature" || scanState === "processing";

  const getButtonContent = () => {
    if (!isConnected) {
      return (
        <>
          <Wallet className="w-5 h-5" />
          Connect Wallet to Scan
        </>
      );
    }

    switch (scanState) {
      case "awaiting_signature":
        return (
          <>
            <PenLine className="w-5 h-5 animate-pulse" />
            Sign Payment in Wallet...
          </>
        );
      case "processing":
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment & Scanning...
          </>
        );
      default:
        return (
          <>
            <CreditCard className="w-5 h-5" />
            Pay {selectedTierData.price} USDC & Scan
          </>
        );
    }
  };

  return (
    <section id="scanner" className="py-24 relative">
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
            Try It Now
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Scan a <span className="text-primary-400">Skill</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-dark-300 max-w-2xl mx-auto text-lg"
          >
            Pay per audit with USDC on Base via x402. Connect your wallet,
            sign the payment, and get instant security results.
          </motion.p>
        </motion.div>

        {/* Wrong Network Warning */}
        {isWrongNetwork && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 border-yellow-500/30 bg-yellow-500/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Wrong Network</h3>
                    <p className="text-dark-400 text-sm">
                      Please switch to Base network to make payments
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => switchChain({ chainId: base.id })}
                >
                  Switch to Base
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Wallet Connection Banner */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 border-primary-500/30 bg-primary-500/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Connect Your Wallet</h3>
                    <p className="text-dark-400 text-sm">
                      Connect a wallet with USDC on Base to pay for audits
                    </p>
                  </div>
                </div>
                <WalletConnect showBalance />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tier Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card
                hover
                selected={selectedTier === tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`cursor-pointer relative ${
                  tier.popular ? "border-primary-500/50" : ""
                }`}
              >
                {tier.popular && (
                  <Badge
                    variant="info"
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    Most Popular
                  </Badge>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <p className="text-dark-400 text-sm">{tier.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedTier === tier.id
                        ? "border-primary-500 bg-primary-500"
                        : "border-dark-500"
                    }`}
                  >
                    {selectedTier === tier.id && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-primary-400">
                    {tier.price}
                  </span>
                  <span className="text-dark-400 text-sm">USDC</span>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-dark-300"
                    >
                      <CheckCircle className="w-3 h-3 text-primary-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Input
                label="Skill URL"
                type="url"
                value={skillUrl}
                onChange={(e) => setSkillUrl(e.target.value)}
                placeholder="https://clawdhub.com/skills/weather"
                hint="Enter the URL of the skill to scan"
              />
              <Textarea
                label="Skill Content (optional)"
                value={skillContent}
                onChange={(e) => setSkillContent(e.target.value)}
                placeholder="Paste skill.md content here..."
                rows={3}
                hint="Or paste the skill content directly"
              />
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={handleScan}
              disabled={(!skillUrl && !skillContent) || isLoading}
              isLoading={isLoading}
            >
              {getButtonContent()}
            </Button>

            {/* Payment Flow Info */}
            {isConnected && scanState === "idle" && (
              <p className="text-center text-dark-500 text-sm mt-4">
                Clicking will prompt your wallet to sign a USDC payment on Base
              </p>
            )}
          </Card>
        </motion.div>

        {/* Results */}
        {(result || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8">
              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">
                      {error.includes("rejected") ? "Payment Rejected" : "Scan Failed"}
                    </p>
                    <p className="text-dark-400 text-sm mt-1">{error}</p>
                    {error.includes("rejected") && (
                      <p className="text-dark-500 text-xs mt-2">
                        You can try again by clicking the scan button
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Success Result */}
              {result && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Audit Complete</h3>
                        <p className="text-dark-500 text-sm">
                          Payment successful - {selectedTierData.price} USDC
                        </p>
                      </div>
                    </div>
                    <span className="text-dark-500 text-sm font-mono">
                      ID: {result.audit_id}
                    </span>
                  </div>

                  {/* Result Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`p-4 rounded-xl border ${
                        getRiskColor(result.risk_score) === "green"
                          ? "bg-green-500/10 border-green-500/30"
                          : getRiskColor(result.risk_score) === "yellow"
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : getRiskColor(result.risk_score) === "orange"
                          ? "bg-orange-500/10 border-orange-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <p className="text-dark-400 text-sm">Risk Score</p>
                      <p className="text-3xl font-bold text-white">
                        {result.risk_score}
                        <span className="text-lg text-dark-400">/100</span>
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
                      <p className="text-dark-400 text-sm">Risk Level</p>
                      <p
                        className={`text-2xl font-bold ${getRiskLevelColor(
                          result.risk_level
                        )}`}
                      >
                        {result.risk_level}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
                      <p className="text-dark-400 text-sm">Recommendation</p>
                      <p
                        className={`text-2xl font-bold ${getRecommendationColor(
                          result.recommendation
                        )}`}
                      >
                        {result.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Vulnerability Display */}
                  {result.findings && (
                    <VulnerabilityDisplay
                      findings={result.findings}
                      riskLevel={result.risk_level}
                      transactionHash={paymentInfo?.transactionHash}
                      paidAmount={paymentInfo?.paidAmount}
                    />
                  )}

                  {/* Attestation */}
                  {result.attestation && (
                    <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                      <p className="text-dark-400 text-sm mb-1">Attestation</p>
                      <p className="font-mono text-sm text-primary-400 break-all">
                        {typeof result.attestation === "string"
                          ? result.attestation
                          : JSON.stringify(result.attestation)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}

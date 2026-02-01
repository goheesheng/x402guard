"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { base } from "wagmi/chains";
import { Wallet, ChevronDown, LogOut, Copy, Check, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface WalletConnectProps {
  className?: string;
  showBalance?: boolean;
  size?: "sm" | "md" | "lg";
}

export function WalletConnect({
  className,
  showBalance = false,
  size = "md",
}: WalletConnectProps) {
  // All hooks must be called unconditionally at the top
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get ETH balance on Base
  const { data: usdcBalance } = useBalance({
    address,
    chainId: base.id,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track client-side mount for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0.00";
    const value = Number(balance) / Math.pow(10, decimals);
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Show loading placeholder during SSR/hydration
  if (!mounted) {
    return (
      <div className={cn("relative", className)}>
        <Button variant="primary" size={size} disabled>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <Button
          variant="primary"
          size={size}
          onClick={() => setShowDropdown(!showDropdown)}
          isLoading={isConnecting || isPending}
          leftIcon={!isConnecting && !isPending && <Wallet className="w-4 h-4" />}
        >
          {isConnecting || isPending ? "Connecting..." : "Connect Wallet"}
        </Button>

        {/* Connector Selection Dropdown */}
        {showDropdown && !isConnecting && !isPending && (
          <div className="absolute top-full right-0 mt-2 w-64 glass rounded-xl overflow-hidden z-50 shadow-xl border border-dark-700">
            <div className="p-3 border-b border-dark-700">
              <p className="text-sm font-medium text-white">Connect Wallet</p>
              <p className="text-xs text-dark-400">Select your wallet provider</p>
            </div>
            <div className="p-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-sm text-white">{connector.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Connected - show address and dropdown
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
          <Wallet className="w-3.5 h-3.5 text-primary-400" />
        </div>
        <span className="text-sm font-medium text-white">
          {truncateAddress(address!)}
        </span>
        {showBalance && usdcBalance && (
          <span className="text-xs text-dark-400">
            {formatBalance(usdcBalance.value, usdcBalance.decimals)} ETH
          </span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-dark-400 transition-transform",
            showDropdown && "rotate-180"
          )}
        />
      </button>

      {/* Connected Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-72 glass rounded-xl overflow-hidden z-50 shadow-xl border border-dark-700">
          {/* Balance Section */}
          <div className="p-4 border-b border-dark-700">
            <p className="text-xs text-dark-400 mb-1">Balance (Base)</p>
            <p className="text-2xl font-bold text-white">
              {formatBalance(usdcBalance?.value, usdcBalance?.decimals || 18)} ETH
            </p>
          </div>

          {/* Address Section */}
          <div className="p-3 border-b border-dark-700">
            <p className="text-xs text-dark-400 mb-2">Connected Address</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-dark-200 bg-dark-800 px-2 py-1 rounded flex-1 truncate">
                {address}
              </code>
              <button
                onClick={copyAddress}
                className="p-1.5 rounded hover:bg-dark-700 transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-dark-400" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <a
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-dark-400" />
              <span className="text-sm text-dark-200">View on BaseScan</span>
            </a>
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

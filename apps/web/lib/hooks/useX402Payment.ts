"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useAccount, useWalletClient } from "wagmi";

export type PaymentState =
  | "idle"
  | "connecting"
  | "awaiting_signature"
  | "processing"
  | "success"
  | "error";

interface UseX402PaymentReturn {
  fetchWithPayment: typeof fetch | null;
  paymentState: PaymentState;
  error: string | null;
  isReady: boolean;
  resetState: () => void;
}

export function useX402Payment(): UseX402PaymentReturn {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fetchWithPayment, setFetchWithPayment] = useState<typeof fetch | null>(null);
  const initializingRef = useRef(false);

  const resetState = useCallback(() => {
    setPaymentState("idle");
    setError(null);
  }, []);

  // Initialize x402 client when wallet is connected
  useEffect(() => {
    async function initX402() {
      if (!isConnected || !walletClient || !address || initializingRef.current) {
        return;
      }

      initializingRef.current = true;

      try {
        // Dynamically import x402 modules to avoid SSR issues
        const [{ wrapFetchWithPayment }, { x402Client }, { registerExactEvmScheme }] =
          await Promise.all([
            import("@x402/fetch"),
            import("@x402/core/client"),
            import("@x402/evm/exact/client"),
          ]);

        // Create a signer adapter from wagmi wallet client
        const signer = {
          address: address as `0x${string}`,
          signTypedData: async (typedData: any) => {
            return walletClient.signTypedData(typedData);
          },
        };

        // Initialize x402 client and register EVM scheme
        const client = new x402Client();
        registerExactEvmScheme(client, { signer });

        // Create wrapped fetch that handles 402 responses
        const wrappedFetch = wrapFetchWithPayment(fetch, client);
        setFetchWithPayment(() => wrappedFetch);
      } catch (err) {
        console.error("[x402] Failed to initialize x402 client:", err);
        setError("Failed to initialize payment client");
      } finally {
        initializingRef.current = false;
      }
    }

    initX402();
  }, [isConnected, walletClient, address]);

  // Reset fetch when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setFetchWithPayment(null);
      initializingRef.current = false;
      resetState();
    }
  }, [isConnected, resetState]);

  const isReady = isConnected && fetchWithPayment !== null;

  return {
    fetchWithPayment,
    paymentState,
    error,
    isReady,
    resetState,
  };
}

// Helper hook for making x402 paid requests
export function useX402Request() {
  const { fetchWithPayment, isReady, resetState } = useX402Payment();
  const [state, setState] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(
    async (url: string, options?: RequestInit) => {
      if (!fetchWithPayment) {
        throw new Error("Wallet not connected or payment client not initialized");
      }

      setError(null);
      setState("awaiting_signature");

      try {
        const response = await fetchWithPayment(url, options);

        if (response.ok) {
          setState("success");
          return response;
        }

        // Handle non-success responses
        const data = await response.json().catch(() => ({}));

        if (response.status === 402) {
          setState("error");
          setError("Payment failed or was rejected");
          throw new Error("Payment failed");
        }

        setState("error");
        setError(data.error || `Request failed with status ${response.status}`);
        throw new Error(data.error || "Request failed");
      } catch (err: any) {
        if (err.message?.includes("User rejected") || err.message?.includes("rejected")) {
          setState("error");
          setError("Payment signature rejected");
        } else if (state !== "error") {
          setState("error");
          setError(err.message || "Unknown error occurred");
        }
        throw err;
      }
    },
    [fetchWithPayment, state]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    resetState();
  }, [resetState]);

  return {
    makeRequest,
    state,
    error,
    isReady,
    reset,
  };
}

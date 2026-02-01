import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base } from "wagmi/chains";

// x402guard uses Base Mainnet for USDC payments
export const config = createConfig({
  chains: [base],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [base.id]: http(),
  },
});

// USDC contract on Base
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const USDC_DECIMALS = 6;

// x402 network identifier
export const X402_NETWORK = "eip155:8453" as const;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

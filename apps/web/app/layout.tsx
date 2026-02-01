"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { WalletProvider } from "@/components/providers/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>x402guard - AI Skill Security Scanner</title>
        <meta
          name="description"
          content="Pre-install security scanning for AI agent skills. Protect your AI agents from malicious code."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <WalletProvider>
          <div className="min-h-screen bg-grid">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}

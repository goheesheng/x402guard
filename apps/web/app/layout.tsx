import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://x402guard.xyz"),
  title: "x402guard | Secure Agent Skills with x402 Protocol",
  description:
    "Pre-install security auditing for AI agent skills. YARA malware detection, permission analysis, and trust attestation powered by x402.",
  keywords: [
    "x402",
    "x402guard",
    "agent security",
    "skill audit",
    "AI safety",
    "malware detection",
    "YARA",
    "pre-install security",
  ],
  authors: [{ name: "x402guard" }],
  openGraph: {
    title: "x402guard | Secure Agent Skills",
    description:
      "Pre-install security auditing for AI agent skills. YARA malware detection, permission analysis, and trust attestation.",
    type: "website",
    url: "https://x402guard.xyz",
    siteName: "x402guard",
  },
  twitter: {
    card: "summary_large_image",
    title: "x402guard | Secure Agent Skills",
    description:
      "Pre-install security auditing for AI agent skills powered by x402.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} antialiased bg-dark-950 text-white`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}

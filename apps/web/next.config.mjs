/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@x402/fetch', '@x402/core', '@x402/evm'],
};

export default nextConfig;

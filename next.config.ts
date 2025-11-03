import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['@xenova/transformers'],
  turbopack: {},
};

export default nextConfig;

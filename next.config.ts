import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['@huggingface/transformers'],
  // Transformers.js runs only in the browser (dynamic import in a client hook),
  // so keep its ~340MB of onnxruntime binaries out of the serverless function
  // bundle — otherwise the file-tracer copies them in and blows the Vercel
  // 250MB function limit.
  outputFileTracingExcludes: {
    '*': ['node_modules/@huggingface/transformers/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fixes for @huggingface/transformers (kept for the webpack production build)
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;

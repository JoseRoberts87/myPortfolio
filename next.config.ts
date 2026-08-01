import type { NextConfig } from "next";

// Build-time guard (issue #212): a deploy build that ships without a real API
// base URL silently falls back to http://localhost:8000 in every visitor's
// browser — the exact cause of a production chat outage. Fail fast on real
// deploy targets (Vercel, or anywhere REQUIRE_API_URL=1 is set); merely warn
// elsewhere so local prod builds and CI test builds (which intentionally use
// localhost) keep working.
{
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const looksDead = !apiUrl || /localhost|127\.0\.0\.1/.test(apiUrl);
  const isDeployTarget = process.env.VERCEL === "1" || process.env.REQUIRE_API_URL === "1";
  if (looksDead && process.env.NODE_ENV === "production") {
    const msg =
      `NEXT_PUBLIC_API_URL is ${apiUrl ? `"${apiUrl}"` : "unset"} — a production ` +
      "build with this value cannot reach the backend from visitors' browsers. " +
      "Set it to the live backend URL (see issue #212).";
    if (isDeployTarget) throw new Error(msg);
    console.warn(`\n⚠️  ${msg}\n`);
  }
}

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

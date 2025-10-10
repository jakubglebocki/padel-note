import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignore ESLint errors during build for dev
    ignoreDuringBuilds: true,
  },
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignore ESLint errors during build for dev
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

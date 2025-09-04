import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  serverExternalPackages: ["mongoose"],


  // and the following to enable top-level await support for Webpack
  webpack: (config) => {
    config.experiments = {
      topLevelAwait: true
    };
    return config;
  },
};

export default nextConfig;

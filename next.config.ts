import type { NextConfig } from "next";

const INTERNAL_API = process.env.API_URL_INTERNAL ?? 'http://127.0.0.1:5001';

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  async rewrites() {
    return [
      {
        // Browser calls /api/* → Next.js server forwards to internal API
        source: '/api/:path*',
        destination: `${INTERNAL_API}/api/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;

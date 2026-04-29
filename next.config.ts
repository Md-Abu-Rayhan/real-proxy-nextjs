import type { NextConfig } from "next";

const INTERNAL_API = process.env.API_URL_INTERNAL ?? 'http://localhost:5157';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        // Browser calls /api/* → Next.js server forwards to internal API
        source: '/api/:path*',
        destination: `${INTERNAL_API}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

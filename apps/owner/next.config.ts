import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  transpilePackages: ["@chaltteok/shared-api", "@chaltteok/shared-store", "@chaltteok/shared-ui"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
      {
        source: "/images/:path*",
        destination: `${API_ORIGIN}/images/:path*`,
      },
    ];
  },
};

export default nextConfig;

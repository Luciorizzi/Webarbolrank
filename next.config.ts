import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "52mb" } },
  ...(process.env.NODE_ENV === "development"
    ? { allowedDevOrigins: ["*.trycloudflare.com"] }
    : {}),
};

export default nextConfig;

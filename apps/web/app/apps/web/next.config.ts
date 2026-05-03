import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  transpilePackages: ["@cuckoobook/ui"],
  images: {
    remotePatterns: [
      // Local Supabase
      { protocol: "http", hostname: "127.0.0.1", port: "54521" },
      // Hosted Supabase
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;

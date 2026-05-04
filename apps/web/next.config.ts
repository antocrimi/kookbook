import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  transpilePackages: ["@cuckoobook/ui"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

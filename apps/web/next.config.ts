import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Each route emits <route>/index.html instead of <route>.html. DO Static Sites
  // can't resolve the bare-file form when Next also emits a sibling RSC-payload
  // directory at the same path (e.g. /prototype/recipes/__next.*.txt) — DO matches
  // the directory first, finds no index.html, and 404s.
  trailingSlash: true,
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  transpilePackages: ["@cuckoobook/ui"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

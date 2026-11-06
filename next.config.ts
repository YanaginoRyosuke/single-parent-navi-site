import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Docker 用（.next/standalone に自己完結の成果物を出す）
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

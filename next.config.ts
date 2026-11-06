import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Docker 用（.next/standalone に自己完結の成果物を出す）
  cacheComponents: true,
  experimental: {
    // Docker などメモリが限られる環境では静的生成のワーカー数を抑える（Dockerfile で NEXT_BUILD_CPUS=2）
    ...(process.env.NEXT_BUILD_CPUS ? { cpus: Number(process.env.NEXT_BUILD_CPUS) } : {}),
  },
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

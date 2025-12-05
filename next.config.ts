import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Required for GitHub Pages
  output: "export",

  // 2. Disable Image Optimization (Required for static export)
  images: {
    unoptimized: true,
  },

  // 3. CRITICAL for subdirectory hosting
  // Since your URL is muhammedbeig.github.io/flash-sport/
  // The basePath must be exactly "/flash-sport"
  basePath: "/flash-sport",

  // 4. Helps prevent 404s on refresh
  trailingSlash: true,
};

export default nextConfig;
import type { NextConfig } from "next";

/**
 * DEPLOY_TARGET:
 *  - (default) hostinger / node: SSR with `output: "standalone"`
 *  - gh-pages: static export with basePath + assetPrefix
 */
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || "hostinger";
const isGhPages = DEPLOY_TARGET === "gh-pages";

const repoName = isGhPages ? process.env.NEXT_PUBLIC_REPO_NAME || "" : "";
const basePath = isGhPages && repoName ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  // ✅ Hostinger/Node SSR
  // ✅ GH-Pages static export (only when DEPLOY_TARGET=gh-pages)
  output: isGhPages ? "export" : "standalone",

  // For GH Pages we usually disable image optimization.
  // For Hostinger SSR, keep it normal (optimized) unless you want unoptimized everywhere.
  images: {
    unoptimized: isGhPages,
  },

  // ✅ Only needed for GH Pages
  basePath,
  assetPrefix: isGhPages ? basePath : undefined,

  // ✅ Only needed for GH Pages static routing behavior
  trailingSlash: isGhPages,
};

export default nextConfig;

import type { NextConfig } from "next";

// Read the variable from the command line, or default to empty
const repoName = process.env.REPO_NAME || ""; 

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // If a repo name is provided, add the slash. Otherwise, use root.
  basePath: repoName ? `/${repoName}` : "",
};

export default nextConfig;
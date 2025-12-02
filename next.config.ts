import type { NextConfig } from "next";

// Read the variable from the command line or .env file
// If you are deploying to a custom domain (e.g. livesocer.com), keep this empty.
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || ""; 

const nextConfig: NextConfig = {
  // Enables the static export output for hosting on platforms like GitHub Pages
  output: "export",
  
  // Disables the Image Optimization API since static exports don't have a server
  images: {
    unoptimized: true,
  },

  // Ensures paths resolve to directories (e.g. /about/index.html) 
  // preventing 404s on reload in many static hosts
  trailingSlash: true,

  // Sets the base path if a repo name is present (for non-custom domain GitHub Pages)
  basePath: repoName ? `/${repoName}` : "",
};

export default nextConfig;
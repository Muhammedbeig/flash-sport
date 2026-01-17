import type { NextConfig } from "next";

// 1. Get the Repo Name from the environment variable (defined in your package.json scripts)
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "";

// 2. Set the Base Path
// If deployed, it becomes "/livesocer.com". In dev (npm run dev), it stays "" (empty).
const basePath = repoName ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  // Required for GitHub Pages (Static Export)
  // output: "export",

  // Required: Next.js Image Optimization doesn't work with static export
  images: {
    unoptimized: true,
  },

  // 3. Apply the dynamic configuration
  // This tells Next.js to expect the app to run under a subdirectory
  basePath: basePath,
  
  // This ensures CSS and JS files are loaded from the correct path
  assetPrefix: basePath,

  // Helps prevent 404s on page refresh by generating index.html for every route
  trailingSlash: true,

  // âœ… FIX: Route admin and admin APIs into the admin app folder (keep public APIs on main app)
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/src/app",
      },
      {
        source: "/admin/:path*",
        destination: "/admin/src/app/:path*",
      },
      {
        source: "/api/public/:path*",
        destination: "/api/public/:path*",
      },
      {
        source: "/api/feed/:path*",
        destination: "/api/feed/:path*",
      },
      {
        // The URL your frontend code is trying to fetch (e.g. /api/auth/me)
        source: "/api/:path*",
        
        // The ACTUAL location of the files inside your app folder
        // Based on your error logs, your structure seems to be: app/admin/src/app/api/...
        // If your "api" folder is somewhere else, adjust this path.
        destination: "/admin/src/app/api/:path*",
      },
    ];
  },
};

export default nextConfig;




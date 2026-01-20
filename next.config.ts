import type { NextConfig } from "next";

// 1. Get the Repo Name from the environment variable (defined in your package.json scripts)
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "";

// 2. Set the Base Path
// If deployed, it becomes "/livesocer.com". In dev (npm run dev), it stays "" (empty).
const basePath = repoName ? `/${repoName}` : "";

// 3. Choose output mode (standalone for Node hosts, export for GH Pages)
const nextOutput = process.env.NEXT_OUTPUT;
const isStaticExport = nextOutput === "export";

const nextConfig: NextConfig = {
  /**
   * Prisma on Vercel/Serverless + Next 16 can fail if the Prisma query engine
   * isn't included in the traced output. Force include Prisma engine files.
   */
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
    "/*": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
  },

  /**
   * Keep these packages external on the server build when needed.
   * (Useful for Node-specific deps / bundling edge cases)
   */
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],

  // Standalone for Node hosting; set NEXT_OUTPUT=export for static builds (GH Pages)
  output: isStaticExport ? "export" : "standalone",

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

  // FIX: Route admin and admin APIs into the admin app folder (keep public APIs on main app)
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




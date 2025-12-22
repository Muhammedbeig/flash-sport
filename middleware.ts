import { NextRequest, NextResponse } from "next/server";

// --- EXISTING SITE REDIRECTS (Keep this) ---
function handleRedirects(req: NextRequest) {
  // Your existing site redirects go here
  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // 1. BLOCK ADMIN SUBDOMAIN
  // If the hostname starts with "admin." (e.g. admin.localhost:3000 or admin.livesoccerr.com),
  // we strictly return a 404 by rewriting to a non-existent page.
  // This prevents the main site content from loading on the admin subdomain.
  if (hostname.startsWith("admin.")) {
    return NextResponse.rewrite(new URL("/404-not-found-force", req.url));
  }

  // 2. REDIRECT /admin PATH
  // If someone tries to go to livesoccerr.com/admin, send them away
  // (Optional: You can redirect to your new admin app URL or just 404)
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
     // Option A: Redirect to the new separate app (once you build it)
     // return NextResponse.redirect(new URL("https://admin.livesoccerr.com", req.url));
     
     // Option B: Just show 404 for now (Safest)
     return NextResponse.rewrite(new URL("/404-not-found-force", req.url));
  }

  // 3. RUN SITE REDIRECTS
  const redirect = handleRedirects(req);
  if (redirect) return redirect;

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
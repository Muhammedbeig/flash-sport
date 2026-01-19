import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REDIRECT_TIMEOUT_MS = Number(process.env.REDIRECT_CHECK_TIMEOUT_MS ?? "350");

function isRedirectStatus(code: number) {
  return [301, 302, 303, 307, 308].includes(code);
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip static files and API routes to save performance
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/static") || 
    pathname.includes(".") // Skipping files like image.png
  ) {
    return NextResponse.next();
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.next();
  }

  try {
    // 2. Fetch redirect rule from your internal API (or use direct DB if not on Edge)
    // Note: Fetching full URL is required in Middleware
    const fetchUrl = `${req.nextUrl.origin}/api/redirect-check?path=${encodeURIComponent(pathname)}`;
    const res = await fetchWithTimeout(fetchUrl, REDIRECT_TIMEOUT_MS);
    
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return NextResponse.next();

      const data = await res.json();
      
      if (data.redirect) {
        const status = Number(data.redirect.type);
        const destination = String(data.redirect.destination || "");

        // Handle 410 Gone (Content Deleted)
        if (status === 410) {
          return new NextResponse(null, { status: 410 });
        }
        if (status === 451) {
          return new NextResponse(null, { status: 451 });
        }
        if (!isRedirectStatus(status) || !destination) return NextResponse.next();

        // Handle Standard Redirects (301, 302, 307, 308)
        return NextResponse.redirect(
          new URL(destination, req.url),
          status
        );
      }
    }
  } catch (e) {
    // Fail silently and let the site load if check fails
    console.error("Redirect check failed", e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextRequest, NextResponse } from "next/server";

const ADMIN_SUBDOMAIN = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN || "admin";

function splitHost(host: string) {
  const [hostname, port] = host.split(":");
  return { hostname: (hostname || "").toLowerCase(), port: port || "" };
}

function stripWww(hostname: string) {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

function isAdminHost(hostname: string) {
  return hostname.startsWith(`${ADMIN_SUBDOMAIN}.`);
}

/**
 * Base hostname for admin.{base}
 * - localhost => localhost
 * - www.livesoccerr.com => livesoccerr.com
 * - flash-sport.vercel.app => flash-sport.vercel.app (keep 3 labels)
 */
function getBaseHostname(hostnameRaw: string) {
  const hostname = stripWww(hostnameRaw);

  if (hostname === "localhost" || hostname === "127.0.0.1") return hostname;

  if (hostname.endsWith(".vercel.app")) {
    const parts = hostname.split(".").filter(Boolean);
    return parts.slice(-3).join(".");
  }

  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
}

function buildHost(hostname: string, port: string) {
  return port ? `${hostname}:${port}` : hostname;
}

function shouldSkip(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".");
}

/** ✅ Your existing redirects (UNCHANGED) */
function handleRedirects(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // /match?id=XXX&sport=football/lineups -> /match/football/XXX/lineups
  if (pathname === "/match") {
    const id = url.searchParams.get("id");
    const rawSport = url.searchParams.get("sport") || "football";
    const [sport, tab] = rawSport.split("/");

    if (id) {
      const dest = new URL(req.url);
      dest.pathname = `/match/${sport}/${id}${tab ? `/${tab}` : ""}`;
      dest.search = "";
      return NextResponse.redirect(dest, 301);
    }
  }

  // /player?id=123 -> /player/123
  if (pathname === "/player") {
    const id = url.searchParams.get("id");
    if (id) {
      const dest = new URL(req.url);
      dest.pathname = `/player/${id}`;
      dest.search = "";
      return NextResponse.redirect(dest, 301);
    }
  }

  // /countries?sport=hockey -> /countries/hockey
  if (pathname === "/countries") {
    const sport = url.searchParams.get("sport");
    if (sport) {
      const dest = new URL(req.url);
      dest.pathname = `/countries/${sport}`;
      dest.search = "";
      return NextResponse.redirect(dest, 301);
    }
  }

  // /?sport=basketball/live&league=12 -> /sports/basketball/live/league/12
  if (pathname === "/") {
    const rawSport = url.searchParams.get("sport");
    const league = url.searchParams.get("league");

    const keep = new URLSearchParams(url.searchParams.toString());
    keep.delete("sport");
    keep.delete("league");

    if (rawSport) {
      const [sport, tab] = rawSport.split("/");
      const dest = new URL(req.url);

      dest.pathname = league
        ? `/sports/${sport}/${tab || "all"}/league/${league}`
        : `/sports/${sport}/${tab || "all"}`;

      dest.search = keep.toString() ? `?${keep.toString()}` : "";
      return NextResponse.redirect(dest, 301);
    }
  }

  return NextResponse.next();
}

/** ✅ Admin subdomain routing */
function handleAdminSubdomain(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  if (shouldSkip(pathname)) return null;

  const host = req.headers.get("host") || "";
  const { hostname, port } = splitHost(host);

  // --- admin.* host ---
  if (isAdminHost(hostname)) {
    // If someone hits admin host with /admin/*, canonicalize to clean paths (/login, /)
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const stripped = pathname.replace(/^\/admin/, "") || "/";
      const dest = url.clone();
      dest.pathname = stripped;
      return NextResponse.redirect(dest, 307);
    }

    // Rewrite clean paths to internal /admin routes:
    // "/" -> "/admin"
    // "/login" -> "/admin/login"
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // --- main host ---
  // If user tries /admin on main host, redirect to admin subdomain with clean path
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const base = getBaseHostname(hostname);
    const adminHost = buildHost(`${ADMIN_SUBDOMAIN}.${base}`, port);

    const stripped = pathname.replace(/^\/admin/, "") || "/";
    const target = `${url.protocol}//${adminHost}${stripped}${url.search}`;
    return NextResponse.redirect(target, 307);
  }

  return null;
}

export function middleware(req: NextRequest) {
  const admin = handleAdminSubdomain(req);
  if (admin) return admin;

  return handleRedirects(req);
}

// Keep this if your repo uses it (your logs show proxy.ts timings)
export function proxy(req: NextRequest) {
  const admin = handleAdminSubdomain(req);
  if (admin) return admin;

  return handleRedirects(req);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};

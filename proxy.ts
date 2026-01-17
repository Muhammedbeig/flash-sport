// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

type RedirectRule = { destination: string; type: number };

const CACHE_TTL_MS = Number(process.env.REDIRECTS_CACHE_MS ?? "30000");

let cache:
  | {
      expiresAt: number;
      map: Map<string, RedirectRule>;
    }
  | null = null;

function hostname(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  return host.split(":")[0] || "";
}

function isAdminHost(req: NextRequest) {
  const h = hostname(req);
  // works for admin.localhost and admin.yourdomain.com
  return h === "admin" || h.startsWith("admin.");
}

function normalizePath(p: string) {
  if (!p) return "/";
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function candidates(pathname: string) {
  const p = normalizePath(pathname);
  if (p === "/") return ["/"];
  const noSlash = p.endsWith("/") ? p.slice(0, -1) : p;
  const withSlash = `${noSlash}/`;
  return Array.from(new Set([p, noSlash, withSlash]));
}

function shouldSkip(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.includes(".")) return true; // static assets
  return false;
}

async function getRedirectMap(): Promise<Map<string, RedirectRule>> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.map;

  const rows = await prisma.redirect.findMany({
    where: { isActive: true },
    select: { source: true, destination: true, type: true },
  });

  const map = new Map<string, RedirectRule>();
  for (const r of rows) {
    const src = normalizePath(String(r.source || ""));
    if (!src) continue;
    map.set(src, {
      destination: String(r.destination || "/"),
      type: Number(r.type || 301),
    });
  }

  cache = { map, expiresAt: now + CACHE_TTL_MS };
  return map;
}

function toAbsolute(req: NextRequest, dest: string) {
  if (!dest) return new URL("/", req.url);
  if (/^https?:\/\//i.test(dest)) return new URL(dest);
  return new URL(dest.startsWith("/") ? dest : `/${dest}`, req.url);
}

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Admin subdomain routing
  if (isAdminHost(req) || isAdminPath(pathname)) {
    // allow admin _next assets + files
    if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();

    // prevent double rewrite
    if (pathname.startsWith("/admin/src/app")) return NextResponse.next();

    // rewrite into admin folder (strip /admin prefix when using path-based admin)
    const adminPath = isAdminPath(pathname) ? pathname.slice("/admin".length) || "/" : pathname;
    return NextResponse.rewrite(new URL(`/admin/src/app${adminPath}`, req.url));
  }

  // Main website redirects
  if (req.method !== "GET" && req.method !== "HEAD") return NextResponse.next();
  if (shouldSkip(pathname)) return NextResponse.next();

  const map = await getRedirectMap();

  let rule: RedirectRule | undefined;
  for (const k of candidates(pathname)) {
    const found = map.get(k);
    if (found) {
      rule = found;
      break;
    }
  }

  if (!rule) return NextResponse.next();

  const destUrl = toAbsolute(req, rule.destination);

  // prevent loops
  if (destUrl.pathname === pathname) return NextResponse.next();

  if ([301, 302, 307, 308].includes(rule.type)) {
    return NextResponse.redirect(destUrl, rule.type);
  }
  if (rule.type === 410) return new NextResponse("Gone", { status: 410 });
  if (rule.type === 451) return new NextResponse("Unavailable For Legal Reasons", { status: 451 });

  return NextResponse.redirect(destUrl, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};





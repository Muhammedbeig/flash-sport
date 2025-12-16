// lib/seo/seo-resolver.ts
import type { Metadata } from "next";
import {
  SEO_ADMIN_OVERRIDES,
  SEO_BRAND,
  SEO_HOME,
  SEO_PAGES,
  SPORT_LABELS,
  SPORTS_TAB_LABELS,
  type SeoEntry,
} from "./seo-central";
import { buildMatchSeo } from "./match-seo";

function clamp(s: string, max: number) {
  if (!s) return s;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function fullUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || SEO_BRAND.siteUrl).replace(/\/+$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

function toMetadata(entry: SeoEntry, canonicalPath: string): Metadata {
  const canonicalUrl = fullUrl(entry.canonical || canonicalPath);
  const title = clamp(entry.title, 60);
  const description = clamp(entry.description, 155);
  const ogImage = entry.ogImage || SEO_BRAND.defaultOgImage;

  return {
    title,
    description,
    keywords: entry.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      siteName: SEO_BRAND.siteName,
      title,
      description,
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: entry.h1 }],
      locale: SEO_BRAND.locale,
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    robots: { index: true, follow: true },
  };
}

function normalizeSport(raw?: string) {
  const s = (raw || "football").toLowerCase();
  if (s === "soccer") return "football";
  if (s === "ice-hockey") return "hockey";
  if (s === "american-football") return "nfl";
  return s;
}

/** ✅ Home */
export function resolveHomeSeo() {
  const canonicalPath = "/";
  const entry: SeoEntry = { ...SEO_HOME, canonical: canonicalPath };
  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/** ✅ Used by app/layout.tsx */
export function resolveRootSeo(): Metadata {
  return resolveHomeSeo().metadata;
}

/**
 * ✅ Static pages
 * Supports:
 *  - resolveStaticPageSeo("contact", "/contact")
 *  - resolveStaticPageSeo("privacy-policy", "/privacy-policy")
 *  - resolveStaticPageSeo("privacyPolicy")
 */
export function resolveStaticPageSeo(
  pageKey: "contact" | "privacyPolicy" | "privacy-policy",
  pathname?: string
) {
  const normalizedKey: "contact" | "privacyPolicy" =
    pageKey === "privacy-policy" ? "privacyPolicy" : pageKey;

  const base = SEO_PAGES[normalizedKey];

  const defaultPath = normalizedKey === "contact" ? "/contact" : "/privacy-policy";
  const canonicalPath = pathname || defaultPath;

  const override =
    SEO_ADMIN_OVERRIDES[`page:${normalizedKey}`] ||
    SEO_ADMIN_OVERRIDES[normalizedKey] ||
    SEO_ADMIN_OVERRIDES[`page:${pageKey}`] ||
    SEO_ADMIN_OVERRIDES[pageKey] ||
    undefined;

  const entry: SeoEntry = { ...base, ...override, canonical: canonicalPath };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/* -----------------------------
   SPORTS TAB SEO (sync)
   Supports BOTH:
   - resolveSportsTabSeo(sport, tab)
   - resolveSportsTabSeo({ sport, tab, pathname? })
------------------------------ */
type SportsTabArgs = { sport: string; tab: string; pathname?: string };

export function resolveSportsTabSeo(rawSport: string, rawTab: string): {
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
};
export function resolveSportsTabSeo(args: SportsTabArgs): {
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
};
export function resolveSportsTabSeo(
  arg1: string | SportsTabArgs,
  arg2?: string
) {
  const sport = normalizeSport(typeof arg1 === "string" ? arg1 : arg1.sport);
  const tab = (typeof arg1 === "string" ? (arg2 || "all") : arg1.tab || "all").toLowerCase();

  const canonicalPath =
    typeof arg1 === "string"
      ? `/sports/${sport}/${tab}`
      : arg1.pathname || `/sports/${sport}/${tab}`;

  const sportName = SPORT_LABELS[sport] || sport;
  const tabLabel = SPORTS_TAB_LABELS[tab] || "Today";

  const base: SeoEntry = {
    title: `Live ${sportName} Scores – ${tabLabel} | ${SEO_BRAND.siteName}`,
    description: `See ${tabLabel.toLowerCase()} ${sportName.toLowerCase()} scores with match stats, lineups, results and fixtures. Fast updates on ${SEO_BRAND.siteName}.`,
    h1: `Live ${sportName} Scores – ${tabLabel}`,
    primaryKeyword: `live ${sportName.toLowerCase()} scores`,
    keywords: [`live ${sportName.toLowerCase()} scores`, "live scores", "fixtures", "results"],
    canonical: canonicalPath,
  };

  const key = `sports:${sport}:${tab}`;
  const entry: SeoEntry = { ...base, ...(SEO_ADMIN_OVERRIDES[key] || {}) };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/* -----------------------------
   LEAGUE SEO (sync)
   Supports BOTH:
   - resolveSportsLeagueSeo(sport, tab, leagueId, pathname?)
   - resolveSportsLeagueSeo({ sport, tab, leagueId, pathname? })
------------------------------ */
type LeagueArgs = { sport: string; tab: string; leagueId: string; pathname?: string };

export function resolveSportsLeagueSeo(
  rawSport: string,
  rawTab: string,
  leagueId: string,
  pathname?: string
): { entry: SeoEntry; metadata: Metadata; canonicalPath: string };
export function resolveSportsLeagueSeo(args: LeagueArgs): {
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
};
export function resolveSportsLeagueSeo(
  arg1: string | LeagueArgs,
  arg2?: string,
  arg3?: string,
  arg4?: string
) {
  const sport = normalizeSport(typeof arg1 === "string" ? arg1 : arg1.sport);
  const tab = (typeof arg1 === "string" ? (arg2 || "all") : arg1.tab || "all").toLowerCase();
  const leagueId = typeof arg1 === "string" ? (arg3 || "") : arg1.leagueId;

  const canonicalPath =
    typeof arg1 === "string"
      ? arg4 || `/sports/${sport}/${tab}/league/${leagueId}`
      : arg1.pathname || `/sports/${sport}/${tab}/league/${leagueId}`;

  const { entry: baseEntry } = resolveSportsTabSeo(sport, tab);

  const base: SeoEntry = {
    ...baseEntry,
    title: clamp(`${baseEntry.title} – League ${leagueId}`, 60),
    h1: `${baseEntry.h1} – League ${leagueId}`,
    canonical: canonicalPath,
  };

  const key = `league:${sport}:${leagueId}:${tab}`;
  const entry: SeoEntry = { ...base, ...(SEO_ADMIN_OVERRIDES[key] || {}) };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/* -----------------------------
   MATCH SEO (async)
   Supports BOTH:
   - resolveMatchSeo(sport, id, tab?)
   - resolveMatchSeo({ sport, id, tab? })
------------------------------ */
type MatchArgs = { sport: string; id: string; tab?: string };

export async function resolveMatchSeo(sport: string, id: string, tab?: string): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolveMatchSeo(args: MatchArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolveMatchSeo(
  arg1: string | MatchArgs,
  arg2?: string,
  arg3?: string
) {
  if (typeof arg1 === "string") {
    return buildMatchSeo({ sport: arg1, id: String(arg2 || ""), tab: arg3 });
  }
  return buildMatchSeo({ sport: arg1.sport, id: String(arg1.id), tab: arg1.tab });
}

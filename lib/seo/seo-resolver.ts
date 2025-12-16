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

/** ✅ Used by landing/home */
export function resolveHomeSeo() {
  const canonicalPath = "/";
  const entry: SeoEntry = { ...SEO_HOME, canonical: canonicalPath };
  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/** ✅ Your app/layout.tsx imports this */
export function resolveRootSeo(): Metadata {
  return resolveHomeSeo().metadata;
}

/**
 * ✅ Static pages
 * Works with:
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

/**
 * ✅ /sports/[sport]/[tab]
 * MUST exist (your sports layout imports resolveSportsTabSeo)
 * Keep sync: layouts don’t need await.
 */
export function resolveSportsTabSeo(rawSport: string, rawTab: string) {
  const sport = normalizeSport(rawSport);
  const tab = (rawTab || "all").toLowerCase();

  const sportName = SPORT_LABELS[sport] || sport;
  const tabLabel = SPORTS_TAB_LABELS[tab] || "Today";

  const canonicalPath = `/sports/${sport}/${tab}`;

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

/**
 * ✅ /sports/[sport]/[tab]/league/[leagueId]
 * Keep sync.
 */
export function resolveSportsLeagueSeo(
  rawSport: string,
  rawTab: string,
  leagueId: string,
  pathname?: string
) {
  const sport = normalizeSport(rawSport);
  const tab = (rawTab || "all").toLowerCase();

  const canonicalPath = pathname || `/sports/${sport}/${tab}/league/${leagueId}`;

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

/**
 * ✅ Match SEO
 * MUST exist (your match layout imports resolveMatchSeo)
 * Uses API via buildMatchSeo to fetch REAL team names.
 */
export async function resolveMatchSeo(sport: string, id: string, tab?: string) {
  return buildMatchSeo({ sport, id, tab });
}

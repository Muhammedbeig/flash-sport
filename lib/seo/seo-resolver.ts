// lib/seo/seo-resolver.ts
import type { Metadata } from "next";
import { buildMatchSeo } from "./match-seo";
import type { SeoEntry } from "./seo-central";
import { getSeoStoreSync } from "./seo-store";

function clamp(s: string, max: number) {
  if (!s) return s;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function normalizeSport(raw?: string) {
  const s = (raw || "football").toLowerCase();
  if (s === "soccer") return "football";
  if (s === "ice-hockey") return "hockey";
  if (s === "american-football") return "nfl";
  return s;
}

function fullUrl(baseUrl: string, path: string) {
  const base = (baseUrl || "").replace(/\/+$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

function applyTitleDecorations(rawTitle: string, brand: { siteName: string; titlePrefix: string; titleSuffix: string }) {
  let t = rawTitle || "";

  const prefix = brand.titlePrefix || "";
  const suffix = brand.titleSuffix || "";

  if (prefix && !t.startsWith(prefix)) t = `${prefix}${t}`;

  // avoid obvious duplication if suffix contains siteName and title already has siteName
  const tLower = t.toLowerCase();
  const siteLower = (brand.siteName || "").toLowerCase();
  const suffixLower = suffix.toLowerCase();

  const wouldDuplicateSiteName =
    suffix &&
    siteLower &&
    suffixLower.includes(siteLower) &&
    tLower.includes(siteLower) &&
    !tLower.endsWith(suffixLower);

  if (suffix && !t.endsWith(suffix) && !wouldDuplicateSiteName) t = `${t}${suffix}`;

  return t;
}

function toMetadata(entry: SeoEntry, canonicalPath: string): Metadata {
  const store = getSeoStoreSync();
  const brand = store.brand;

  const canonicalUrl = fullUrl(brand.siteUrl, entry.canonical || canonicalPath);

  const rawTitle = entry.title || brand.siteName;
  const title = clamp(applyTitleDecorations(rawTitle, brand), 60);

  const descRaw = entry.description || brand.defaultMetaDescription || "";
  const description = clamp(descRaw, 155);

  const ogImage = entry.ogImage || brand.defaultOgImage;

  return {
    title,
    description,
    keywords: entry.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      siteName: brand.siteName,
      title,
      description,
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: entry.h1 }],
      locale: brand.locale,
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    robots: { index: true, follow: true },
  };
}

/** ✅ Home */
export function resolveHomeSeo() {
  const store = getSeoStoreSync();
  const canonicalPath = "/";
  const entry: SeoEntry = { ...store.home, canonical: canonicalPath };
  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/** ✅ Used by app/layout.tsx */
export function resolveRootSeo(): Metadata {
  return resolveHomeSeo().metadata;
}

/** ✅ Static pages */
export function resolveStaticPageSeo(
  pageKey: "contact" | "privacyPolicy" | "privacy-policy",
  pathname?: string
) {
  const store = getSeoStoreSync();

  const normalizedKey: "contact" | "privacyPolicy" =
    pageKey === "privacy-policy" ? "privacyPolicy" : pageKey;

  const base = store.pages[normalizedKey];
  const defaultPath = normalizedKey === "contact" ? "/contact" : "/privacy-policy";
  const canonicalPath = pathname || defaultPath;

  const override =
    store.overrides[`page:${normalizedKey}`] ||
    store.overrides[normalizedKey] ||
    store.overrides[`page:${pageKey}`] ||
    store.overrides[pageKey] ||
    undefined;

  const entry: SeoEntry = { ...base, ...override, canonical: canonicalPath };
  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/* ----------------------------- SPORTS TAB SEO ------------------------------ */
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
export function resolveSportsTabSeo(arg1: string | SportsTabArgs, arg2?: string) {
  const store = getSeoStoreSync();
  const brand = store.brand;

  const sport = normalizeSport(typeof arg1 === "string" ? arg1 : arg1.sport);
  const tab = (typeof arg1 === "string" ? (arg2 || "all") : arg1.tab || "all").toLowerCase();

  const canonicalPath =
    typeof arg1 === "string"
      ? `/sports/${sport}/${tab}`
      : arg1.pathname || `/sports/${sport}/${tab}`;

  const sportName = store.labels.sportLabels[sport] || sport;
  const tabLabel = store.labels.sportsTabLabels[tab] || "Today";

  const base: SeoEntry = {
    title: `Live ${sportName} Scores – ${tabLabel} | ${brand.siteName}`,
    description: `See ${tabLabel.toLowerCase()} ${sportName.toLowerCase()} scores with match stats, lineups, results and fixtures. Fast updates on ${brand.siteName}.`,
    h1: `Live ${sportName} Scores – ${tabLabel}`,
    primaryKeyword: `live ${sportName.toLowerCase()} scores`,
    keywords: [`live ${sportName.toLowerCase()} scores`, "live scores", "fixtures", "results"],
    canonical: canonicalPath,
  };

  const key = `sports:${sport}:${tab}`;
  const entry: SeoEntry = { ...base, ...(store.overrides[key] || {}) };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/* ----------------------------- LEAGUE SEO --------------------------------- */
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
  const store = getSeoStoreSync();

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
  const entry: SeoEntry = { ...base, ...(store.overrides[key] || {}) };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/* ----------------------------- MATCH SEO (async) --------------------------- */
type MatchArgs = { sport: string; id: string; tab?: string };

export async function resolveMatchSeo(sport: string, id: string, tab?: string): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolveMatchSeo(args: MatchArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolveMatchSeo(arg1: string | MatchArgs, arg2?: string, arg3?: string) {
  if (typeof arg1 === "string") return buildMatchSeo({ sport: arg1, id: String(arg2 || ""), tab: arg3 });
  return buildMatchSeo({ sport: arg1.sport, id: String(arg1.id), tab: arg1.tab });
}

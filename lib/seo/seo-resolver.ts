// lib/seo/seo-resolver.ts
import type { Metadata } from "next";
import { buildMatchSeo } from "./match-seo";
import { buildPlayerSeo } from "./player-seo";
import { buildLeagueSeo } from "./league-seo"; 
import type { SeoEntry } from "./seo-central";
import { getSeoStoreSync } from "./seo-store";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* STATIC & ROOT RESOLVERS                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* SPORTS TAB SEO                                                             */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* LEAGUE SEO (Country/Numeric IDs) - FIXED & UPGRADED                        */
/* -------------------------------------------------------------------------- */
type LeagueArgs = { sport: string; tab: string; leagueId: string; pathname?: string };

// 1. Overloads (Now return Promise because we fetch data)
export async function resolveSportsLeagueSeo(
  rawSport: string,
  rawTab: string,
  leagueId: string,
  pathname?: string
): Promise<{ entry: SeoEntry; metadata: Metadata; canonicalPath: string }>;

export async function resolveSportsLeagueSeo(args: LeagueArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
}>;

// 2. Implementation
export async function resolveSportsLeagueSeo(
  arg1: string | LeagueArgs,
  arg2?: string,
  arg3?: string,
  arg4?: string
) {
  // A. Normalize Arguments
  const sport = normalizeSport(typeof arg1 === "string" ? arg1 : arg1.sport);
  const tab = (typeof arg1 === "string" ? (arg2 || "all") : arg1.tab || "all").toLowerCase();
  const leagueId = typeof arg1 === "string" ? (arg3 || "") : arg1.leagueId;
  const pathname = typeof arg1 === "string" ? arg4 : arg1.pathname;

  // B. Fetch Real Data using the Builder
  // We pass 'leagueId' (numeric string) as the 'league' argument.
  // The builder handles fetching data by ID automatically.
  const { entry: baseEntry } = await buildLeagueSeo({ 
    sport, 
    league: leagueId, 
    tab: tab !== "all" ? tab : undefined 
  });

  // C. Override Canonical URL
  // The builder might default to "/football/premier-league", but we want to KEEP your structure:
  // "/sports/football/all/league/906"
  const finalCanonical = pathname || `/sports/${sport}/${tab}/league/${leagueId}`;
  
  // D. Create Final Entry with correct Canonical
  const entry: SeoEntry = {
    ...baseEntry,
    canonical: finalCanonical,
  };

  // E. Generate Metadata
  const metadata = toMetadata(entry, finalCanonical);

  return { entry, metadata, canonicalPath: finalCanonical };
}

/* -------------------------------------------------------------------------- */
/* MATCH SEO (async)                                                          */
/* -------------------------------------------------------------------------- */
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
  const sport = typeof arg1 === "string" ? arg1 : arg1.sport;
  const id = String(typeof arg1 === "string" ? (arg2 || "") : arg1.id);
  const tab = typeof arg1 === "string" ? arg3 : arg1.tab;

  const { entry } = await buildMatchSeo({ sport, id, tab });

  const cleanTab = (tab || "summary").toLowerCase();
  const canonicalPath = entry.canonical || `/match/${normalizeSport(sport)}/${id}/${cleanTab}`;

  const metadata = toMetadata(entry, canonicalPath);

  return { entry, metadata };
}

/* -------------------------------------------------------------------------- */
/* PLAYER SEO (async)                                                         */
/* -------------------------------------------------------------------------- */
type PlayerArgs = { sport: string; id: string };

export async function resolvePlayerSeo(sport: string, id: string): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolvePlayerSeo(args: PlayerArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolvePlayerSeo(arg1: string | PlayerArgs, arg2?: string) {
  const sport = typeof arg1 === "string" ? arg1 : arg1.sport;
  const id = String(typeof arg1 === "string" ? (arg2 || "") : arg1.id);

  const { entry } = await buildPlayerSeo({ sport, id });

  const canonicalPath = entry.canonical || `/player/${normalizeSport(sport)}/${id}`;

  const metadata = toMetadata(entry, canonicalPath);

  return { entry, metadata };
}

/* -------------------------------------------------------------------------- */
/* LEAGUE SEO (Main/Slug Based)                                               */
/* -------------------------------------------------------------------------- */
export async function resolveLeagueSeo(sport: string, leagueIdOrSlug: string, tab?: string) {
  // 1. Pass 'tab' to the builder
  const { entry } = await buildLeagueSeo({ sport, league: leagueIdOrSlug, tab });
  
  // 2. Use the canonical path from the builder (which handles standard league URLs)
  const canonicalPath = entry.canonical || `/${normalizeSport(sport)}/${leagueIdOrSlug}`;
  
  // 3. Generate Metadata
  const metadata = toMetadata(entry, canonicalPath);
  
  return { entry, metadata };
}
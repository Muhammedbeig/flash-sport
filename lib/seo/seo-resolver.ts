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

function ensureTrailingSlash(p: string) {
  if (!p) return p;
  if (p === "/") return "/";
  return p.endsWith("/") ? p : `${p}/`;
}

function fullUrl(baseUrl: string, pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const base = (baseUrl || "").replace(/\/+$/, "");
  const clean = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${clean}`;
}

function toAbsoluteUrl(baseUrl: string, maybeRelative?: string) {
  if (!maybeRelative) return maybeRelative;
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  return fullUrl(baseUrl, maybeRelative);
}

function parseRobots(input?: any): { index: boolean; follow: boolean } {
  // supports { index, follow }
  if (input && typeof input === "object") {
    return { index: input.index !== false, follow: input.follow !== false };
  }

  // supports "index, follow" (optional in JSON)
  if (typeof input === "string") {
    const s = input.toLowerCase();
    const hasIndex = s.includes("index");
    const hasFollow = s.includes("follow");
    // if someone passes an empty string, default true,true
    if (!s.trim()) return { index: true, follow: true };
    return { index: hasIndex, follow: hasFollow };
  }

  return { index: true, follow: true };
}

function applyTitleDecorations(
  rawTitle: string,
  brand: { siteName: string; titlePrefix: string; titleSuffix: string }
) {
  let t = rawTitle || "";

  const prefix = brand.titlePrefix || "";
  const suffix = brand.titleSuffix || "";

  if (prefix && !t.startsWith(prefix)) t = `${prefix}${t}`;

  // prevent "SiteName | SiteName" style duplication
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
  const store: any = getSeoStoreSync();
  const brand = store.brand;
  const defaults = store.defaults || {};
  const ogDefaults = defaults.og || {};
  const twitterDefaults = defaults.twitter || {};

  const canonPath = ensureTrailingSlash(entry.canonical || canonicalPath);
  const canonicalUrl = fullUrl(brand.siteUrl, canonPath);

  const rawTitle = entry.title || brand.siteName;
  const title = clamp(applyTitleDecorations(rawTitle, brand), 60);

  const descRaw = entry.description || brand.defaultMetaDescription || "";
  const description = clamp(descRaw, 155);

  const keywords = entry.keywords || defaults.keywords || undefined;

  const ogImageRaw =
    entry.ogImage || ogDefaults.fallbackImage || brand.defaultOgImage || brand.defaultOgImage;
  const ogImage = toAbsoluteUrl(brand.siteUrl, ogImageRaw);

  // robots precedence: entry.robots -> store.defaults.robots -> default (index,follow)
  const robots = entry.robots ? parseRobots(entry.robots) : parseRobots(defaults.robots);

  const ogType = ogDefaults.type || "website";
  const ogAlt = ogDefaults.imageAlt || entry.h1 || brand.siteName;

  const twitterCard = twitterDefaults.card || "summary_large_image";

  let metadataBase: URL | undefined;
  try {
    metadataBase = brand.siteUrl ? new URL(brand.siteUrl) : undefined;
  } catch {
    metadataBase = undefined;
  }

  return {
    metadataBase,
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: ogType,
      siteName: brand.siteName,
      title,
      description,
      url: canonicalUrl,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }] : [],
      locale: brand.locale,
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots,
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

export function resolveRootSeo(): Metadata {
  return resolveHomeSeo().metadata;
}

/** ✅ Static pages */
export function resolveStaticPageSeo(
  pageKey:
    | "contact"
    | "privacyPolicy"
    | "termsOfService"
    | "privacy-policy"
    | "terms-of-service",
  pathname?: string
) {
  const store: any = getSeoStoreSync();

  const normalizedKey: "contact" | "privacyPolicy" | "termsOfService" =
    pageKey === "privacy-policy"
      ? "privacyPolicy"
      : pageKey === "terms-of-service"
        ? "termsOfService"
        : pageKey;

  const base =
    store.pages?.[normalizedKey] ||
    store.pages?.[pageKey] ||
    (normalizedKey === "privacyPolicy" ? store.pages?.["privacy-policy"] : undefined) ||
    (normalizedKey === "termsOfService" ? store.pages?.["terms-of-service"] : undefined);

  const defaultPath =
    normalizedKey === "contact"
      ? "/contact/"
      : normalizedKey === "termsOfService"
        ? "/terms-of-service/"
        : "/privacy-policy/";

  const canonicalPath = ensureTrailingSlash(pathname || defaultPath);

  const override =
    store.overrides?.[`page:${normalizedKey}`] ||
    store.overrides?.[normalizedKey] ||
    store.overrides?.[`page:${pageKey}`] ||
    store.overrides?.[pageKey] ||
    undefined;

  const entry: SeoEntry = { ...(base || {}), ...(override || {}), canonical: canonicalPath };
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
  const store: any = getSeoStoreSync();
  const brand = store.brand;

  const sport = normalizeSport(typeof arg1 === "string" ? arg1 : arg1.sport);
  const tab = (typeof arg1 === "string" ? arg2 || "all" : arg1.tab || "all").toLowerCase();

  const canonicalPath = ensureTrailingSlash(
    typeof arg1 === "string" ? `/sports/${sport}/${tab}/` : arg1.pathname || `/sports/${sport}/${tab}/`
  );

  const sportName = store.labels?.sportLabels?.[sport] || sport;
  const tabLabel = store.labels?.sportsTabLabels?.[tab] || tab;

  const base: SeoEntry = {
    title: `Live ${sportName} Scores – ${tabLabel} | ${brand.siteName}`,
    description: `See ${tabLabel.toLowerCase()} ${sportName.toLowerCase()} scores with match stats, lineups, results and fixtures. Fast updates on ${brand.siteName}.`,
    h1: `${sportName} ${tabLabel}`,
    canonical: canonicalPath,
    ogImage: brand.defaultOgImage,
  };

  const key = `sportsTab:${sport}:${tab}`;
  const entry: SeoEntry = { ...base, ...(store.overrides?.[key] || {}) };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);
  entry.canonical = canonicalPath;

  return { entry, metadata: toMetadata(entry, canonicalPath), canonicalPath };
}

/* -------------------------------------------------------------------------- */
/* LEAGUE SEO (Country/Numeric IDs)                                           */
/* -------------------------------------------------------------------------- */
type LeagueArgs = { sport: string; tab: string; leagueId: string; pathname?: string };

export async function resolveSportsLeagueSeo(
  sport: string,
  tab: string,
  leagueId: string
): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
}>;
export async function resolveSportsLeagueSeo(args: LeagueArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
}>;
export async function resolveSportsLeagueSeo(arg1: string | LeagueArgs, arg2?: string, arg3?: string) {
  const store: any = getSeoStoreSync();

  const sport = normalizeSport(typeof arg1 === "string" ? arg1 : arg1.sport);
  const tab = (typeof arg1 === "string" ? arg2 || "all" : arg1.tab || "all").toLowerCase();
  const leagueId = String(typeof arg1 === "string" ? arg3 || "" : arg1.leagueId);

  const pathname = typeof arg1 === "string" ? undefined : arg1.pathname;

  const { entry: baseEntry } = await buildLeagueSeo({
    sport,
    league: leagueId,
    tab: tab !== "all" ? tab : undefined,
  });

  const finalCanonical = ensureTrailingSlash(pathname || `/sports/${sport}/${tab}/league/${leagueId}/`);

  const overrideKey = `sportsLeague:${sport}:${tab}:${leagueId}`;
  const override = store.overrides?.[overrideKey] || {};

  const entry: SeoEntry = {
    ...baseEntry,
    ...override,
    canonical: finalCanonical,
  };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  const metadata = toMetadata(entry, finalCanonical);
  return { entry, metadata, canonicalPath: finalCanonical };
}

/* -------------------------------------------------------------------------- */
/* MATCH SEO (async)                                                          */
/* -------------------------------------------------------------------------- */
type MatchArgs = { sport: string; id: string; tab?: string };

export async function resolveMatchSeo(
  sport: string,
  id: string,
  tab?: string
): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolveMatchSeo(args: MatchArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolveMatchSeo(arg1: string | MatchArgs, arg2?: string, arg3?: string) {
  const sport = typeof arg1 === "string" ? arg1 : arg1.sport;
  const id = String(typeof arg1 === "string" ? arg2 || "" : arg1.id);
  const tab = (typeof arg1 === "string" ? arg3 : arg1.tab) || "summary";

  const { entry: built } = await buildMatchSeo({ sport, id, tab });
  const cleanSport = normalizeSport(sport);
  const cleanTab = (tab || "summary").toLowerCase();

  const canonicalPath = ensureTrailingSlash(
    built.canonical || `/match/${cleanSport}/${id}/${cleanTab}/`
  );

  const entry: SeoEntry = { ...built, canonical: canonicalPath };
  const metadata = toMetadata(entry, canonicalPath);

  return { entry, metadata };
}

/* -------------------------------------------------------------------------- */
/* PLAYER SEO (async)                                                         */
/* -------------------------------------------------------------------------- */
type PlayerArgs = { sport: string; id: string };

export async function resolvePlayerSeo(
  sport: string,
  id: string
): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolvePlayerSeo(args: PlayerArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
}>;
export async function resolvePlayerSeo(arg1: string | PlayerArgs, arg2?: string) {
  const sport = typeof arg1 === "string" ? arg1 : arg1.sport;
  const id = String(typeof arg1 === "string" ? arg2 || "" : arg1.id);

  const { entry: built } = await buildPlayerSeo({ sport, id });

  const canonicalPath = ensureTrailingSlash(
    built.canonical || `/player/${normalizeSport(sport)}/${id}/`
  );

  const entry: SeoEntry = { ...built, canonical: canonicalPath };
  const metadata = toMetadata(entry, canonicalPath);

  return { entry, metadata };
}

/* -------------------------------------------------------------------------- */
/* LEAGUE SEO (Main/Slug Based)                                               */
/* -------------------------------------------------------------------------- */
export async function resolveLeagueSeo(sport: string, leagueIdOrSlug: string, tab?: string) {
  const { entry: built } = await buildLeagueSeo({
    sport,
    league: leagueIdOrSlug,
    tab,
  });

  const canonicalPath = ensureTrailingSlash(
    built.canonical || `/${normalizeSport(sport)}/${leagueIdOrSlug}/`
  );

  const entry: SeoEntry = { ...built, canonical: canonicalPath };
  const metadata = toMetadata(entry, canonicalPath);

  return { entry, metadata };
}

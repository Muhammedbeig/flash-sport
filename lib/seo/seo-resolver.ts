// lib/seo/seo-resolver.ts
import "server-only";

import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { buildMatchSeo } from "./match-seo";
import { buildPlayerSeo } from "./player-seo";
import { buildLeagueSeo } from "./league-seo";
import type { SeoEntry } from "./seo-central";
import { getSeoStore } from "./seo-store";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function clamp(s: string, max: number) {
  if (!s) return s;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "...";
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
  if (input && typeof input === "object") {
    return { index: input.index !== false, follow: input.follow !== false };
  }

  if (typeof input === "string") {
    const s = input.toLowerCase();
    const hasIndex = s.includes("index");
    const hasFollow = s.includes("follow");
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

function isEdgeRuntime() {
  return process.env.NEXT_RUNTIME === "edge";
}

const STATIC_PAGE_DB_SLUGS = {
  contact: "contact",
  privacyPolicy: "privacy-policy",
  termsOfService: "terms-of-service",
} as const;

const SLUG_ALIASES: Record<string, string[]> = {
  "privacy-policy": ["privacy", "privacy_policy", "privacyPolicy", "/privacy-policy"],
  "terms-of-service": ["terms", "tos", "terms_service", "termsOfService", "/terms-of-service"],
  contact: ["contact-us", "support", "/contact"],
};

function normalizeSlug(raw: string) {
  return String(raw || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function extractSeoFromUnknown(input: any): any | null {
  if (!input || typeof input !== "object") return null;

  // A) canonical admin format { seo, content, ... }
  if (input.seo && typeof input.seo === "object") return input.seo;

  // B) nested wrappers
  const candidates = [input.page, input.data, input.payload, input.value];
  for (const c of candidates) {
    if (c?.seo && typeof c.seo === "object") return c.seo;
  }

  return null;
}

async function readStaticPageSeoOverrideFromDb(slug: string): Promise<Partial<SeoEntry> | null> {
  // DB not available on Edge
  if (isEdgeRuntime()) return null;

  const normalized = normalizeSlug(slug);
  const slugsToTry = [normalized, ...(SLUG_ALIASES[normalized] || [])]
    .map(normalizeSlug)
    .filter(Boolean);

  try {
    const { prisma } = await import("@/lib/db/prisma");

    const row = await prisma.seoPage.findFirst({
      where: { slug: { in: slugsToTry } },
      select: { slug: true, data: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!row?.data) return null;

    const seo = extractSeoFromUnknown(row.data);
    if (!seo) return null;

    const patch: Partial<SeoEntry> = {
      title: seo.title,
      description: seo.description,
      h1: seo.h1,
      primaryKeyword: seo.primaryKeyword,
      keywords: seo.keywords,
      canonical: seo.canonical, // canonical overridden later by canonicalPath
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.ogImage,
      robots: seo.robots,
    };

    Object.keys(patch).forEach((k) => (patch as any)[k] === undefined && delete (patch as any)[k]);
    return patch;
  } catch (e) {
    console.warn(`[seo-resolver] Failed to read seoPage override for "${slug}"`, e);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* METADATA BUILDER                                                           */
/* -------------------------------------------------------------------------- */

function toMetadata(store: any, entry: SeoEntry, canonicalPath: string): Metadata {
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

  // OG/Twitter title/desc should respect ogTitle/ogDescription if present
  const ogTitleRaw = entry.ogTitle || rawTitle;
  const ogTitle = clamp(applyTitleDecorations(ogTitleRaw, brand), 60);

  const ogDescRaw = entry.ogDescription || descRaw;
  const ogDescription = clamp(ogDescRaw, 155);

  const twitterTitleRaw = ogTitleRaw;
  const twitterTitle = clamp(applyTitleDecorations(twitterTitleRaw, brand), 60);
  const twitterDescription = ogDescription;

  const ogImageRaw = entry.ogImage || ogDefaults.fallbackImage || brand.defaultOgImage;
  const ogImage = toAbsoluteUrl(brand.siteUrl, ogImageRaw);

  const robots = entry.robots ? parseRobots(entry.robots) : parseRobots(defaults.robots);

  const ogType = ogDefaults.type || "website";
  const ogAlt = ogDefaults.imageAlt || entry.h1 || brand.siteName;

  const twitterCard = twitterDefaults.card || "summary_large_image";

  // ✅ Web Settings / Global SEO (same store)
  const faviconRaw = (store?.brand?.faviconUrl || "/favicon.ico") as string;
  const favicon = toAbsoluteUrl(brand.siteUrl, faviconRaw) || "/favicon.ico";

  const themeColor = store?.brand?.themeColor;

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

    // ✅ NEW (favicon + themeColor from store)
    icons: { icon: favicon },
    themeColor: typeof themeColor === "string" && themeColor ? themeColor : undefined,

    openGraph: {
      type: ogType,
      siteName: brand.siteName,
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }] : [],
      locale: brand.locale,
    },
    twitter: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      images: ogImage ? [ogImage] : [],
    },
    robots,
  };
}

/* -------------------------------------------------------------------------- */
/* STATIC & ROOT RESOLVERS                                                    */
/* -------------------------------------------------------------------------- */

export async function resolveHomeSeo() {
  // Make metadata dynamic so admin edits reflect immediately
  noStore();

  const store: any = await getSeoStore();
  const canonicalPath = "/";
  const entry: SeoEntry = { ...store.home, canonical: canonicalPath };
  return { entry, metadata: toMetadata(store, entry, canonicalPath), canonicalPath };
}

export async function resolveRootSeo(): Promise<Metadata> {
  return (await resolveHomeSeo()).metadata;
}

/**
 * ✅ Static pages (Contact / Privacy / Terms)
 * Applies seo overrides stored in prisma.seoPage (admin “content pages” editor)
 */
export async function resolveStaticPageSeo(
  pageKey: "contact" | "privacyPolicy" | "termsOfService" | "privacy-policy" | "terms-of-service",
  pathname?: string
) {
  // Make metadata dynamic so admin edits reflect immediately
  noStore();

  const store: any = await getSeoStore();

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

  // ✅ DB override from seoPage table (admin content pages)
  const dbSlug = STATIC_PAGE_DB_SLUGS[normalizedKey];
  const dbOverride = await readStaticPageSeoOverrideFromDb(dbSlug);

  const entry: SeoEntry = {
    ...(base || {}),
    ...(override || {}),
    ...(dbOverride || {}),
    canonical: canonicalPath, // canonical always matches route
  };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);
  if (entry.ogTitle) entry.ogTitle = clamp(entry.ogTitle, 60);
  if (entry.ogDescription) entry.ogDescription = clamp(entry.ogDescription, 155);

  return { entry, metadata: toMetadata(store, entry, canonicalPath), canonicalPath };
}

/* -------------------------------------------------------------------------- */
/* SPORTS TAB SEO                                                             */
/* -------------------------------------------------------------------------- */

type SportsTabArgs = { sport: string; tab: string; pathname?: string };

export async function resolveSportsTabSeo(rawSport: string, rawTab: string): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
}>;
export async function resolveSportsTabSeo(args: SportsTabArgs): Promise<{
  entry: SeoEntry;
  metadata: Metadata;
  canonicalPath: string;
}>;
export async function resolveSportsTabSeo(arg1: string | SportsTabArgs, arg2?: string) {
  const store: any = await getSeoStore();
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

  return { entry, metadata: toMetadata(store, entry, canonicalPath), canonicalPath };
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
  const store: any = await getSeoStore();

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

  const metadata = toMetadata(store, entry, finalCanonical);
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
): Promise<{ entry: SeoEntry; metadata: Metadata }>;
export async function resolveMatchSeo(args: MatchArgs): Promise<{ entry: SeoEntry; metadata: Metadata }>;
export async function resolveMatchSeo(arg1: string | MatchArgs, arg2?: string, arg3?: string) {
  const store: any = await getSeoStore();

  const sport = typeof arg1 === "string" ? arg1 : arg1.sport;
  const id = String(typeof arg1 === "string" ? arg2 || "" : arg1.id);
  const tab = (typeof arg1 === "string" ? arg3 : arg1.tab) || "summary";

  const { entry: built } = await buildMatchSeo({ sport, id, tab });
  const cleanSport = normalizeSport(sport);
  const cleanTab = (tab || "summary").toLowerCase();

  const canonicalPath = ensureTrailingSlash(built.canonical || `/match/${cleanSport}/${id}/${cleanTab}/`);

  const entry: SeoEntry = { ...built, canonical: canonicalPath };
  const metadata = toMetadata(store, entry, canonicalPath);

  return { entry, metadata };
}

/* -------------------------------------------------------------------------- */
/* PLAYER SEO (async)                                                         */
/* -------------------------------------------------------------------------- */

type PlayerArgs = { sport: string; id: string };

export async function resolvePlayerSeo(sport: string, id: string): Promise<{ entry: SeoEntry; metadata: Metadata }>;
export async function resolvePlayerSeo(args: PlayerArgs): Promise<{ entry: SeoEntry; metadata: Metadata }>;
export async function resolvePlayerSeo(arg1: string | PlayerArgs, arg2?: string) {
  // Make metadata dynamic so admin edits reflect immediately
  noStore();
  const store: any = await getSeoStore();

  const sport = typeof arg1 === "string" ? arg1 : arg1.sport;
  const id = String(typeof arg1 === "string" ? arg2 || "" : arg1.id);

  const { entry: built } = await buildPlayerSeo({ sport, id });

  const canonicalPath = ensureTrailingSlash(built.canonical || `/player/${normalizeSport(sport)}/${id}/`);

  const entry: SeoEntry = { ...built, canonical: canonicalPath };
  const metadata = toMetadata(store, entry, canonicalPath);

  return { entry, metadata };
}

/* -------------------------------------------------------------------------- */
/* LEAGUE SEO (Main/Slug Based)                                               */
/* -------------------------------------------------------------------------- */

export async function resolveLeagueSeo(sport: string, leagueIdOrSlug: string, tab?: string) {
  const store: any = await getSeoStore();

  const { entry: built } = await buildLeagueSeo({
    sport,
    league: leagueIdOrSlug,
    tab,
  });

  const canonicalPath = ensureTrailingSlash(built.canonical || `/${normalizeSport(sport)}/${leagueIdOrSlug}/`);

  const entry: SeoEntry = { ...built, canonical: canonicalPath };
  const metadata = toMetadata(store, entry, canonicalPath);

  return { entry, metadata };
}

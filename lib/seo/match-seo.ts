// lib/seo/match-seo.ts
import type { Metadata } from "next";
import type { SeoEntry } from "./seo-central";
import { getSeoStoreSync } from "./seo-store";

/* -------------------------------------------------------------------------- */
/* TYPES & HELPERS                                                            */
/* -------------------------------------------------------------------------- */

type MatchApiData = {
  home: string;
  away: string;
  homeLogo?: string | null;
  awayLogo?: string | null;
  dateIso?: string | null;
  statusShort?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
};

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

function isAbsUrl(u?: string | null) {
  return !!u && /^https?:\/\//i.test(u);
}

function fullUrl(baseUrl: string, pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (isAbsUrl(pathOrUrl)) return pathOrUrl;

  const base = (baseUrl || "").replace(/\/+$/, "");
  const clean = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${clean}`;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.max(250, timeoutMs || 1200));
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

// Map API-Sports short codes to Schema.org EventStatusType
function mapEventStatus(short?: string | null): string {
  if (!short) return "https://schema.org/EventScheduled";

  const finished = ["FT", "AET", "PEN", "Finished", "Ended"];
  const live = ["1H", "2H", "HT", "ET", "P", "LIVE"];
  const postponed = ["PST", "Postponed"];
  const cancelled = ["CANC", "ABD", "Cancelled"];

  // Schema.org doesn't have "completed" — keep Scheduled for finished/live to avoid invalid values.
  if (finished.includes(short)) return "https://schema.org/EventScheduled";
  if (live.includes(short)) return "https://schema.org/EventScheduled";
  if (postponed.includes(short)) return "https://schema.org/EventPostponed";
  if (cancelled.includes(short)) return "https://schema.org/EventCancelled";

  return "https://schema.org/EventScheduled";
}

/* -------------------------------------------------------------------------- */
/* API CONFIG                                                                 */
/* -------------------------------------------------------------------------- */

const SPORT_API: Record<string, { host: string; path: string; cdnEnv: string }> = {
  football: { host: "v3.football.api-sports.io", path: "fixtures", cdnEnv: "NEXT_PUBLIC_CDN_FOOTBALL_URL" },
  basketball: { host: "v1.basketball.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_BASKETBALL_URL" },
  baseball: { host: "v1.baseball.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_BASEBALL_URL" },
  hockey: { host: "v1.hockey.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_HOCKEY_URL" },
  nfl: { host: "v1.american-football.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_NFL_URL" },
  rugby: { host: "v1.rugby.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_RUGBY_URL" },
  volleyball: { host: "v1.volleyball.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_VOLLEYBALL_URL" },
};

/* -------------------------------------------------------------------------- */
/* DATA FETCHER                                                               */
/* -------------------------------------------------------------------------- */

function parseMatchItem(sport: string, item: any): MatchApiData | null {
  if (!item) return null;

  const core = item.fixture || item.game || item;
  const teams = item.teams || {};
  const scores = item.goals || item.scores || {};

  const home = teams.home?.name || "Home Team";
  const away = teams.away?.name || "Away Team";

  let homeScore: number | null = null;
  let awayScore: number | null = null;

  if (typeof scores.home === "object") homeScore = scores.home?.total ?? null;
  else homeScore = scores.home ?? null;

  if (typeof scores.away === "object") awayScore = scores.away?.total ?? null;
  else awayScore = scores.away ?? null;

  return {
    home,
    away,
    homeLogo: teams.home?.logo ?? null,
    awayLogo: teams.away?.logo ?? null,
    dateIso: core.date ?? null,
    statusShort: core.status?.short ?? null,
    homeScore,
    awayScore,
  };
}

async function fetchMatchData(sport: string, id: string): Promise<MatchApiData | null> {
  const cfg = SPORT_API[sport];
  if (!cfg) return null;

  const store = getSeoStoreSync();
  const timeoutMs = store?.match?.apiTimeoutMs ?? 650;
  const revalidate = store?.match?.revalidateSeconds ?? 60;

  try {
    // 1) Try CDN first (no key)
    const cdnBase = process.env[cfg.cdnEnv];
    if (cdnBase) {
      const url = `${cdnBase.replace(/\/+$/, "")}/${cfg.path}?id=${encodeURIComponent(id)}`;
      const res = await fetchWithTimeout(url, { next: { revalidate } }, timeoutMs);
      if (res.ok) {
        const json = await res.json();
        return parseMatchItem(sport, json.response?.[0]);
      }
    }

    // 2) Fallback: API-Sports (server key)
    const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    if (!apiKey) return null;

    const url = `https://${cfg.host}/${cfg.path}?id=${encodeURIComponent(id)}`;
    const res = await fetchWithTimeout(
      url,
      {
        headers: {
          "x-rapidapi-host": cfg.host,
          "x-rapidapi-key": apiKey,
          "x-apisports-key": apiKey,
        },
        next: { revalidate },
      },
      timeoutMs
    );

    if (!res.ok) return null;

    const json = await res.json();
    return parseMatchItem(sport, json.response?.[0]);
  } catch (err) {
    console.error(`Error fetching match SEO for ${sport}/${id}:`, err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* MAIN BUILDER                                                               */
/* -------------------------------------------------------------------------- */

type BuildMatchArgs = {
  sport: string;
  id: string;
  tab?: string;
};

export async function buildMatchSeo({ sport: rawSport, id, tab }: BuildMatchArgs) {
  const store = getSeoStoreSync();
  const brand = store.brand;

  const sport = normalizeSport(rawSport);
  const cleanTab = (tab || "summary").toLowerCase();

  // 1) Data
  const data = await fetchMatchData(sport, id);

  const home = data?.home || "Home";
  const away = data?.away || "Away";
  const matchTitle = `${home} vs ${away}`;

  // 2) Patterns from JSON store
  const patterns = store.match;
  const patternIndex = (id.charCodeAt(0) || 0) % patterns.titlePatterns.length;
  const rawTitlePattern = patterns.titlePatterns[patternIndex] || patterns.titlePatterns[0];

  const sportLabel = store.labels?.sportLabels?.[sport] || sport;
  const tabLabel = store.labels?.matchTabLabels?.[cleanTab] || "Live Score";

  const replacer = (tpl: string) =>
    tpl
      .replace(/{home}/g, home)
      .replace(/{away}/g, away)
      .replace(/{brand}/g, brand.siteName)
      .replace(/{sport}/g, sportLabel)
      .replace(/{tab}/g, tabLabel);

  const title = replacer(rawTitlePattern);
  const description = replacer(patterns.descriptionPattern);
  const h1 = replacer(patterns.h1Pattern);

  // Canonical must match your real route format
  const canonicalPath = ensureTrailingSlash(`/match/${sport}/${id}/${cleanTab}`);

  // OG image (keep as path in entry; resolver will absolute-ify for metadata)
  const ogPath = patterns.og.useDynamicBanner
    ? patterns.og.bannerPath.replace("{sport}", sport).replace("{id}", id)
    : patterns.og.fallbackImage;

  const ogImageForJsonLd = fullUrl(brand.siteUrl, ogPath);

  let entry: SeoEntry = {
    title,
    description,
    h1,
    canonical: canonicalPath,
    ogImage: ogPath,
    keywords: [
      matchTitle,
      `${matchTitle} live score`,
      `${matchTitle} result`,
      `${matchTitle} stats`,
      patterns.primaryKeyword || "live score",
    ].filter(Boolean),
  };

  // JSON-LD
  if (patterns.schema.enabled) {
    const scoreLine =
      typeof data?.homeScore === "number" && typeof data?.awayScore === "number"
        ? `${home} ${data.homeScore} - ${data.awayScore} ${away}`
        : "";

    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: matchTitle,
      url: fullUrl(brand.siteUrl, canonicalPath),
      startDate: data?.dateIso || undefined,
      eventStatus: mapEventStatus(data?.statusShort),
      description: scoreLine ? `Live score: ${scoreLine}. ${description}` : description,
      sport: sportLabel,
      competitor: [
        {
          "@type": "SportsTeam",
          name: home,
          logo: data?.homeLogo ? fullUrl(brand.siteUrl, data.homeLogo) : undefined,
        },
        {
          "@type": "SportsTeam",
          name: away,
          logo: data?.awayLogo ? fullUrl(brand.siteUrl, data.awayLogo) : undefined,
        },
      ],
      homeTeam: {
        "@type": "SportsTeam",
        name: home,
        logo: data?.homeLogo ? fullUrl(brand.siteUrl, data.homeLogo) : undefined,
      },
      awayTeam: {
        "@type": "SportsTeam",
        name: away,
        logo: data?.awayLogo ? fullUrl(brand.siteUrl, data.awayLogo) : undefined,
      },
      image: ogImageForJsonLd ? [ogImageForJsonLd] : undefined,
      organizer: {
        "@type": "Organization",
        name: brand.siteName,
        url: brand.siteUrl,
        logo: fullUrl(brand.siteUrl, brand.defaultOgImage),
      },
    };
  }

  // Admin overrides
  const overrideKey = `match:${sport}:${id}:${cleanTab}`;
  const override = store.overrides?.[overrideKey] || store.overrides?.[`match:${sport}:${id}`];
  if (override) entry = { ...entry, ...override };

  return { entry, metadata: {} as Metadata };
}

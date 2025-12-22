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

// Map API-Sports short codes to Schema.org EventStatusType
function mapEventStatus(short?: string | null): string {
  if (!short) return "https://schema.org/EventScheduled";
  const finished = ["FT", "AET", "PEN", "Finished", "Ended"];
  const live = ["1H", "2H", "HT", "ET", "P", "LIVE"];
  const postponed = ["PST", "Postponed"];
  const cancelled = ["CANC", "ABD", "Cancelled"];

  if (finished.includes(short)) return "https://schema.org/EventScheduled"; // Or EventMovedOnline if applicable, but usually Scheduled/Past
  if (live.includes(short)) return "https://schema.org/EventMovedOnline"; // Schema doesn't have "Live", usually "EventScheduled" covers it
  if (postponed.includes(short)) return "https://schema.org/EventPostponed";
  if (cancelled.includes(short)) return "https://schema.org/EventCancelled";
  
  return "https://schema.org/EventScheduled";
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

async function fetchMatchData(sport: string, id: string): Promise<MatchApiData | null> {
  const cfg = SPORT_API[sport];
  if (!cfg) return null;

  try {
    // 1. Try CDN first (No Key Needed)
    // We check process.env[cfg.cdnEnv] dynamically
    const cdnBase = process.env[cfg.cdnEnv];
    
    if (cdnBase) {
      const url = `${cdnBase.replace(/\/+$/, "")}/${cfg.path}?id=${id}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const json = await res.json();
        const item = json.response?.[0];
        return parseMatchItem(sport, item);
      }
    }

    // 2. Fallback to API-Sports (Server-Side Key)
    const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    if (!apiKey) return null;

    const url = `https://${cfg.host}/${cfg.path}?id=${id}`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": cfg.host,
        "x-rapidapi-key": apiKey,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return parseMatchItem(sport, json.response?.[0]);

  } catch (err) {
    console.error(`Error fetching match SEO for ${sport}/${id}:`, err);
    return null;
  }
}

function parseMatchItem(sport: string, item: any): MatchApiData | null {
  if (!item) return null;

  // Different sports have slightly different structures
  // Football: item.fixture, item.goals
  // Others: item.game, item.scores
  const core = item.fixture || item.game || item;
  const teams = item.teams || {};
  const scores = item.goals || item.scores || {};

  const home = teams.home?.name || "Home Team";
  const away = teams.away?.name || "Away Team";
  
  // Normalize Scores (handle objects vs numbers)
  let homeScore = null;
  let awayScore = null;

  if (typeof scores.home === "object") {
    homeScore = scores.home?.total ?? null;
  } else {
    homeScore = scores.home ?? null;
  }

  if (typeof scores.away === "object") {
    awayScore = scores.away?.total ?? null;
  } else {
    awayScore = scores.away ?? null;
  }

  return {
    home,
    away,
    homeLogo: teams.home?.logo,
    awayLogo: teams.away?.logo,
    dateIso: core.date,
    statusShort: core.status?.short,
    homeScore,
    awayScore,
  };
}

/* -------------------------------------------------------------------------- */
/* MAIN RESOLVER                                                              */
/* -------------------------------------------------------------------------- */

type BuildMatchArgs = {
  sport: string;
  id: string;
  tab?: string; // e.g. "summary", "h2h", "standings"
};

export async function buildMatchSeo({ sport: rawSport, id, tab }: BuildMatchArgs) {
  const store = getSeoStoreSync();
  const brand = store.brand;
  const sport = normalizeSport(rawSport);
  const cleanTab = (tab || "summary").toLowerCase();

  // 1. Fetch Data
  const data = await fetchMatchData(sport, id);

  // 2. Fallback strings if data fails
  const home = data?.home || "Home";
  const away = data?.away || "Away";
  const matchTitle = `${home} vs ${away}`;

  // 3. Resolve Patterns from Store
  const patterns = store.match;
  
  // Select a title pattern cyclically or random, or just the first one
  const patternIndex = (id.charCodeAt(0) || 0) % patterns.titlePatterns.length;
  const rawTitlePattern = patterns.titlePatterns[patternIndex] || patterns.titlePatterns[0];

  // Replacements
  const replacer = (tpl: string) =>
    tpl
      .replace(/{home}/g, home)
      .replace(/{away}/g, away)
      .replace(/{brand}/g, brand.siteName)
      .replace(/{sport}/g, store.labels.sportLabels[sport] || sport)
      .replace(/{tab}/g, store.labels.matchTabLabels[cleanTab] || "Live Score");

  // 4. Construct Meta
  const title = replacer(rawTitlePattern);
  const description = replacer(patterns.descriptionPattern);
  const h1 = replacer(patterns.h1Pattern);

  const canonicalPath = `/match/${sport}/${id}/${cleanTab}`;
  
  // Dynamic OG Image
  const ogImage = patterns.og.useDynamicBanner
    ? patterns.og.bannerPath.replace("{sport}", sport).replace("{id}", id)
    : patterns.og.fallbackImage;

  // 5. Build Entry
  let entry: SeoEntry = {
    title,
    description,
    h1,
    canonical: canonicalPath,
    ogImage,
    keywords: [
      `${home} vs ${away}`,
      `${home} vs ${away} live score`,
      `${home} vs ${away} result`,
      `${home} vs ${away} stats`
    ],
  };

  // 6. JSON-LD Schema (Organization, Event)
  if (patterns.schema.enabled) {
    const scoreLine =
      typeof data?.homeScore === "number" && typeof data?.awayScore === "number"
        ? `${home} ${data.homeScore} - ${data.awayScore} ${away}`
        : "";

    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": matchTitle,
      "url": fullUrl(brand.siteUrl, canonicalPath),
      "startDate": data?.dateIso || undefined,
      "eventStatus": mapEventStatus(data?.statusShort),
      "description": scoreLine ? `Live score: ${scoreLine}. ${description}` : description,
      "sport": store.labels.sportLabels[sport] || sport,
      "competitor": [
        { "@type": "SportsTeam", "name": home, "logo": data?.homeLogo || undefined },
        { "@type": "SportsTeam", "name": away, "logo": data?.awayLogo || undefined }
      ],
      "homeTeam": { "@type": "SportsTeam", "name": home, "logo": data?.homeLogo || undefined },
      "awayTeam": { "@type": "SportsTeam", "name": away, "logo": data?.awayLogo || undefined },
      "image": [fullUrl(brand.siteUrl, ogImage)],
      "organizer": { 
        "@type": "Organization", 
        "name": brand.siteName, 
        "url": brand.siteUrl, 
        // ✅ FIX: Use defaultOgImage instead of logoUrl (which doesn't exist)
        "logo": fullUrl(brand.siteUrl, brand.defaultOgImage) 
      },
    };
  }

  // 7. Check for Admin Overrides (manual override in DB)
  const overrideKey = `match:${sport}:${id}:${cleanTab}`;
  const override = store.overrides[overrideKey] || store.overrides[`match:${sport}:${id}`]; // fallback to general match override

  if (override) {
    entry = { ...entry, ...override };
  }

  // 8. Return for Resolver
  // We return 'metadata' format here just for convenience, 
  // but usually resolver handles the final transformation. 
  // We'll return just the data needed by resolver.
  return { entry, metadata: {} as Metadata };
}
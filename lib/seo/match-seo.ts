// lib/seo/match-seo.ts
import type { Metadata } from "next";
import { cache } from "react";
import {
  SEO_ADMIN_OVERRIDES,
  SEO_BRAND,
  SEO_MATCH,
  MATCH_TAB_LABELS,
  SPORT_LABELS,
  type SeoEntry,
} from "./seo-central";

type NextFetchInit = RequestInit & { next?: { revalidate?: number } };

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

const SPORT_API: Record<string, { host: string; path: string }> = {
  football: { host: "v3.football.api-sports.io", path: "fixtures" },
  basketball: { host: "v1.basketball.api-sports.io", path: "games" },
  baseball: { host: "v1.baseball.api-sports.io", path: "games" },
  hockey: { host: "v1.hockey.api-sports.io", path: "games" },
  nfl: { host: "v1.american-football.api-sports.io", path: "games" },
  rugby: { host: "v1.rugby.api-sports.io", path: "games" },
  volleyball: { host: "v1.volleyball.api-sports.io", path: "games" },
};

function clamp(s: string, max: number) {
  if (!s) return s;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function fill(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function fullUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || SEO_BRAND.siteUrl).replace(/\/+$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

function mapEventStatus(statusShort?: string | null) {
  const s = (statusShort || "").toUpperCase();
  if (["FT", "AET", "PEN", "FINAL", "FIN"].includes(s)) return "https://schema.org/EventCompleted";
  if (["LIVE", "1H", "2H", "HT", "Q1", "Q2", "Q3", "Q4", "OT", "INP"].includes(s)) return "https://schema.org/EventInProgress";
  return "https://schema.org/EventScheduled";
}

async function fetchJsonWithTimeout(url: string, init: NextFetchInit, timeoutMs: number) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// ✅ Cached per request (metadata + layout both calling won’t double hit API)
const getMatchApiData = cache(async (sportRaw: string, id: string): Promise<MatchApiData | null> => {
  const sport = normalizeSport(sportRaw);
  const cfg = SPORT_API[sport];
  if (!cfg) return null;

  const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;
  if (!apiKey) return null;

  const url = `https://${cfg.host}/${cfg.path}?id=${encodeURIComponent(id)}&timezone=UTC`;

  const init: NextFetchInit = {
    headers: {
      "x-apisports-key": apiKey,
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": cfg.host,
    },
    next: { revalidate: SEO_MATCH.revalidateSeconds },
  };

  const json = await fetchJsonWithTimeout(url, init, SEO_MATCH.apiTimeoutMs);
  const item = json?.response?.[0];
  if (!item) return null;

  const core = item.fixture || item.game || item;
  const teams = item.teams || core.teams || {};
  const homeRaw = teams.home || teams.local || {};
  const awayRaw = teams.away || teams.visitors || teams.visitor || {};

  const status = core.status || item.status || {};
  const statusShort = typeof status === "string" ? status : status.short || status.code || null;

  const scoresRaw = item.goals || item.scores || item.score || {};
  const homeScore =
    typeof scoresRaw?.home?.total !== "undefined"
      ? Number(scoresRaw.home.total)
      : typeof scoresRaw?.home !== "undefined"
      ? Number(scoresRaw.home)
      : null;

  const awayScore =
    typeof scoresRaw?.away?.total !== "undefined"
      ? Number(scoresRaw.away.total)
      : typeof scoresRaw?.away !== "undefined"
      ? Number(scoresRaw.away)
      : typeof scoresRaw?.visitors?.total !== "undefined"
      ? Number(scoresRaw.visitors.total)
      : typeof scoresRaw?.visitors !== "undefined"
      ? Number(scoresRaw.visitors)
      : null;

  return {
    home: homeRaw.name || "Match",
    away: awayRaw.name || `#${id}`,
    homeLogo: homeRaw.logo || null,
    awayLogo: awayRaw.logo || null,
    dateIso: core.date || core.datetime || item.date || null,
    statusShort,
    homeScore,
    awayScore,
  };
});

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

export async function buildMatchSeo(args: { sport: string; id: string; tab?: string }) {
  const sport = normalizeSport(args.sport);
  const matchId = String(args.id || "");
  const tab = (args.tab || "summary").toLowerCase();

  const canonicalPath = `/match/${sport}/${matchId}`;

  const data = await getMatchApiData(sport, matchId);

  // ✅ REAL team names from API
  const home = data?.home || "Match";
  const away = data?.away || `#${matchId}`;

  const vars = { home, away, brand: SEO_BRAND.siteName, sport, id: matchId };

  let title = fill(SEO_MATCH.titlePatterns[0], vars);
  const tabLabel = MATCH_TAB_LABELS[tab];
  if (tab !== "summary" && tabLabel) title = `LIVE: ${home} vs ${away} – ${tabLabel}`;

  const description = clamp(fill(SEO_MATCH.descriptionPattern, vars), 155);
  const h1 = fill(SEO_MATCH.h1Pattern, vars);

  const ogImage =
    SEO_MATCH.og.useDynamicBanner
      ? fullUrl(fill(SEO_MATCH.og.bannerPath, vars))
      : fullUrl(SEO_MATCH.og.fallbackImage);

  let entry: SeoEntry = {
    title: clamp(`${title} | ${SEO_BRAND.siteName}`, 60),
    description,
    h1,
    canonical: canonicalPath,
    ogImage,
    primaryKeyword: SEO_MATCH.primaryKeyword,
    keywords: [
      SEO_MATCH.primaryKeyword,
      `${home} vs ${away}`,
      `live ${SPORT_LABELS[sport] || sport} scores`,
      "lineups",
      "match stats",
      "results",
    ],
  };

  if (SEO_MATCH.schema.enabled) {
    const scoreLine =
      typeof data?.homeScore === "number" && typeof data?.awayScore === "number"
        ? `${home} ${data.homeScore} - ${data.awayScore} ${away}`
        : "";

    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${home} vs ${away}`,
      url: fullUrl(canonicalPath),
      startDate: data?.dateIso || undefined,
      eventStatus: mapEventStatus(data?.statusShort),
      description: scoreLine ? `Live score: ${scoreLine}. ${description}` : description,
      sport: SPORT_LABELS[sport] || sport,
      homeTeam: { "@type": "SportsTeam", name: home, logo: data?.homeLogo || undefined },
      awayTeam: { "@type": "SportsTeam", name: away, logo: data?.awayLogo || undefined },
      image: [ogImage],
      organizer: { "@type": "Organization", name: SEO_BRAND.siteName, url: SEO_BRAND.siteUrl },
    };
  }

  // ✅ admin overrides: per match + per tab
  const baseKey = `match:${sport}:${matchId}`;
  const tabKey = `match:${sport}:${matchId}:${tab}`;
  entry = { ...entry, ...(SEO_ADMIN_OVERRIDES[baseKey] || {}), ...(SEO_ADMIN_OVERRIDES[tabKey] || {}) };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath) };
}

// Legacy alias if any old file expects it
export const resolveDynamicMatchSeoBundle = buildMatchSeo;

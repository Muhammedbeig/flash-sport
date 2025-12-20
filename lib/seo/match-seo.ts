// lib/seo/match-seo.ts
import type { Metadata } from "next";
import { cache } from "react";
import type { SeoEntry } from "./seo-central";
import { getSeoStoreSync } from "./seo-store";

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

function fullUrl(baseUrl: string, path: string) {
  const base = (baseUrl || "").replace(/\/+$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

function mapEventStatus(statusShort?: string | null) {
  const s = (statusShort || "").toUpperCase();
  if (["FT", "AET", "PEN", "FINAL", "FIN"].includes(s)) return "https://schema.org/EventCompleted";
  if (["LIVE", "1H", "2H", "HT", "Q1", "Q2", "Q3", "Q4", "OT", "INP"].includes(s))
    return "https://schema.org/EventInProgress";
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

const getMatchApiData = cache(async (sportRaw: string, id: string): Promise<MatchApiData | null> => {
  const store = getSeoStoreSync();
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
    next: { revalidate: store.match.revalidateSeconds },
  };

  const json = await fetchJsonWithTimeout(url, init, store.match.apiTimeoutMs);
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
  const store = getSeoStoreSync();
  const brand = store.brand;

  const canonicalUrl = fullUrl(brand.siteUrl, entry.canonical || canonicalPath);
  const title = clamp(entry.title, 60);
  const description = clamp(entry.description || brand.defaultMetaDescription, 155);
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

export async function buildMatchSeo(args: { sport: string; id: string; tab?: string }) {
  const store = getSeoStoreSync();
  const brand = store.brand;

  const sport = normalizeSport(args.sport);
  const matchId = String(args.id || "");
  const tab = (args.tab || "summary").toLowerCase();

  const canonicalPath = `/match/${sport}/${matchId}`;
  const data = await getMatchApiData(sport, matchId);

  const home = data?.home || "Match";
  const away = data?.away || `#${matchId}`;

  const vars = { home, away, brand: brand.siteName, sport, id: matchId };

  // ✅ Uses Global Settings (first title pattern + desc pattern + schema enabled)
  const titleTpl = store.match.titlePatterns?.[0] || "LIVE: {home} vs {away} – Score, Lineups & Stats";
  const descriptionTpl = store.match.descriptionPattern || brand.defaultMetaDescription;

  const title = fill(titleTpl, vars);
  const description = clamp(fill(descriptionTpl, vars), 155);
  const h1 = fill(store.match.h1Pattern || "LIVE: {home} vs {away} – Live Score", vars);

  const ogImage =
    store.match.og.useDynamicBanner
      ? fullUrl(brand.siteUrl, fill(store.match.og.bannerPath, vars))
      : fullUrl(brand.siteUrl, store.match.og.fallbackImage);

  let entry: SeoEntry = {
    title: clamp(title, 60),
    description,
    h1,
    canonical: canonicalPath,
    ogImage,
    primaryKeyword: store.match.primaryKeyword,
    keywords: [
      store.match.primaryKeyword,
      `${home} vs ${away}`,
      `live ${store.labels.sportLabels[sport] || sport} scores`,
      "lineups",
      "match stats",
      "results",
    ],
  };

  if (store.match.schema.enabled) {
    const scoreLine =
      typeof data?.homeScore === "number" && typeof data?.awayScore === "number"
        ? `${home} ${data.homeScore} - ${data.awayScore} ${away}`
        : "";

    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${home} vs ${away}`,
      url: fullUrl(brand.siteUrl, canonicalPath),
      startDate: data?.dateIso || undefined,
      eventStatus: mapEventStatus(data?.statusShort),
      description: scoreLine ? `Live score: ${scoreLine}. ${description}` : description,
      sport: store.labels.sportLabels[sport] || sport,
      homeTeam: { "@type": "SportsTeam", name: home, logo: data?.homeLogo || undefined },
      awayTeam: { "@type": "SportsTeam", name: away, logo: data?.awayLogo || undefined },
      image: [ogImage],
      organizer: { "@type": "Organization", name: brand.siteName, url: brand.siteUrl, logo: brand.logoUrl },
    };
  }

  const baseKey = `match:${sport}:${matchId}`;
  const tabKey = `match:${sport}:${matchId}:${tab}`;
  entry = { ...entry, ...(store.overrides[baseKey] || {}), ...(store.overrides[tabKey] || {}) };

  entry.title = clamp(entry.title, 60);
  entry.description = clamp(entry.description, 155);

  return { entry, metadata: toMetadata(entry, canonicalPath) };
}

export const resolveDynamicMatchSeoBundle = buildMatchSeo;

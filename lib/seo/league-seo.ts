// lib/seo/league-seo.ts
import type { Metadata } from "next";
import type { SeoEntry } from "./seo-central";
import { getSeoStore } from "./seo-store";


/* -------------------------------------------------------------------------- */
/* TYPES & HELPERS                                                            */
/* -------------------------------------------------------------------------- */

type LeagueApiData = {
  id: number;
  name: string;
  country: string;
  logo?: string;
  season?: number;
};

const SPORT_API: Record<string, { host: string; path: string }> = {
  football: { host: "v3.football.api-sports.io", path: "leagues" },
  basketball: { host: "v1.basketball.api-sports.io", path: "leagues" },
  baseball: { host: "v1.baseball.api-sports.io", path: "leagues" },
  hockey: { host: "v1.hockey.api-sports.io", path: "leagues" },
  nfl: { host: "v1.american-football.api-sports.io", path: "leagues" },
  rugby: { host: "v1.rugby.api-sports.io", path: "leagues" },
  volleyball: { host: "v1.volleyball.api-sports.io", path: "leagues" },
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

function cleanSlug(slug: string) {
  return slug.replace(/-/g, " ").trim();
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

/* -------------------------------------------------------------------------- */
/* DATA FETCHER                                                               */
/* -------------------------------------------------------------------------- */

export async function fetchLeagueData(sport: string, idOrSlug: string): Promise<LeagueApiData | null> {
  const cfg = SPORT_API[sport];
  if (!cfg) return null;

  const store = await getSeoStore();
  const timeoutMs = store?.league?.apiTimeoutMs ?? 2000;
  const revalidate = store?.league?.revalidateSeconds ?? 86400;

  try {
    const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    if (!apiKey) return null;

    const isNumeric = /^\d+$/.test(idOrSlug);
    let url = `https://${cfg.host}/${cfg.path}`;

    if (isNumeric) url += `?id=${encodeURIComponent(idOrSlug)}`;
    else url += `?search=${encodeURIComponent(cleanSlug(idOrSlug))}`;

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
    const item = json.response?.[0];
    if (!item) return null;

    const leagueNode = item.league || item;
    const countryNode = item.country || {};

    const id = Number(leagueNode.id);
    const name = leagueNode.name || "League";
    const logo = leagueNode.logo;
    const country = countryNode.name || "World";

    let season: number | undefined;
    if (Array.isArray(item.seasons) && item.seasons.length) {
      const last = item.seasons[item.seasons.length - 1];
      season = last?.year ?? last?.season;
    } else if (typeof item.season === "number") {
      season = item.season;
    }

    if (!Number.isFinite(id)) return null;
    return { id, name, country, logo, season };
  } catch (err) {
    console.error(`Error fetching league SEO for ${sport}/${idOrSlug}:`, err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* SEO BUILDER                                                                */
/* -------------------------------------------------------------------------- */

export async function buildLeagueSeo({
  sport: rawSport,
  league,
  tab,
}: {
  sport: string;
  league: string;
  tab?: string;
}) {
  const store = await getSeoStore();
  const brand = store.brand;
  const sport = normalizeSport(rawSport);

  const cleanTab = (tab || "all").toLowerCase();

  const data = await fetchLeagueData(sport, league);

  const resolvedLeagueId = data?.id ? String(data.id) : league;
  const name = data?.name || cleanSlug(league) || "League";
  const country = data?.country || "World";
  const seasonStr = data?.season ? String(data.season) : "";

  const patterns = store.league;
  const patternIndex = (resolvedLeagueId.charCodeAt(0) || 0) % patterns.titlePatterns.length;
  const rawTitlePattern = patterns.titlePatterns[patternIndex] || patterns.titlePatterns[0];

  const sportLabel = store.labels?.sportLabels?.[sport] || sport;

  const replacer = (tpl: string) =>
    tpl
      .replace(/{name}/g, name)
      .replace(/{country}/g, country)
      .replace(/{season}/g, seasonStr)
      .replace(/{brand}/g, brand.siteName)
      .replace(/{sport}/g, sportLabel);

  const title = replacer(rawTitlePattern).replace(/\s{2,}/g, " ").trim();
  const description = replacer(patterns.descriptionPattern).replace(/\s{2,}/g, " ").trim();
  const h1 = replacer(patterns.h1Pattern).replace(/\s{2,}/g, " ").trim();

  // ✅ Canonical must match your real sports league route
  const canonicalPath = ensureTrailingSlash(`/sports/${sport}/${cleanTab}/league/${resolvedLeagueId}`);

  let entry: SeoEntry = {
    title,
    description,
    h1,
    canonical: canonicalPath,
    ogImage: data?.logo || patterns.og.fallbackImage,
    keywords: [
      name,
      country,
      seasonStr ? `${name} ${seasonStr}` : "",
      `${name} standings`,
      `${name} table`,
      `${name} fixtures`,
      `${name} results`,
      `${name} live scores`,
    ].filter(Boolean),
  };

  if (patterns.schema.enabled) {
    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      name,
      url: fullUrl(brand.siteUrl, canonicalPath),
      logo: data?.logo ? fullUrl(brand.siteUrl, data.logo) : undefined,
      location: { "@type": "Place", name: country },
      sport: sportLabel,
      description,
    };
  }

  // Admin overrides (optional)
  const overrideKey = `league:${sport}:${resolvedLeagueId}:${cleanTab}`;
  const override = store.overrides?.[overrideKey] || store.overrides?.[`league:${sport}:${resolvedLeagueId}`];
  if (override) entry = { ...entry, ...override };

  return { entry, metadata: {} as Metadata };
}

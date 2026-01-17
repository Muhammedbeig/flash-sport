// lib/seo/player-seo.ts
import type { Metadata } from "next";
import type { SeoEntry } from "./seo-central";
import { getSeoStore } from "./seo-store";

/* -------------------------------------------------------------------------- */
/* CONFIG & HELPERS                                                           */
/* -------------------------------------------------------------------------- */

type PlayerApiData = {
  name: string;
  teamName: string;
  photo?: string;
  nationality?: string;
};

const SPORT_API: Record<string, { host: string; path: string }> = {
  football: { host: "v3.football.api-sports.io", path: "players" },
  basketball: { host: "v1.basketball.api-sports.io", path: "players" },
  baseball: { host: "v1.baseball.api-sports.io", path: "players" },
  hockey: { host: "v1.hockey.api-sports.io", path: "players" },
  nfl: { host: "v1.american-football.api-sports.io", path: "players" },
  rugby: { host: "v1.rugby.api-sports.io", path: "players" },
  volleyball: { host: "v1.volleyball.api-sports.io", path: "players" },
};

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

const ABSOLUTE_URL_RE = /^https?:\/\//i;
function isAbsoluteUrl(u?: string) {
  return !!u && ABSOLUTE_URL_RE.test(u);
}

function normalizeImageUrl(baseUrl: string, img?: string) {
  if (!img) return undefined;
  return isAbsoluteUrl(img) ? img : fullUrl(baseUrl, img);
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

/**
 * Season logic:
 * - basketball: prefer current season based on month (typical start ~ Jul)
 * - others: try current year, then previous years
 */
function seasonCandidates(sport: string): string[] {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1; // 1..12

  if (sport === "basketball") {
    const startYear = m >= 7 ? y : y - 1;
    return uniq([
      `${startYear}-${startYear + 1}`,
      `${startYear - 1}-${startYear}`,
      `${startYear - 2}-${startYear - 1}`,
      `${startYear + 1}-${startYear + 2}`,
      String(y),
      String(y - 1),
    ]);
  }

  return uniq([String(y), String(y - 1), String(y - 2), String(y - 3)]);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
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

async function fetchPlayerData(sport: string, id: string): Promise<PlayerApiData | null> {
  const cfg = SPORT_API[sport];
  if (!cfg) return null;

  try {
    const store = await getSeoStore();
    const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    if (!apiKey) return null;

    const revalidate = store?.player?.revalidateSeconds ?? 3600;
    const timeoutMs = store?.player?.apiTimeoutMs ?? 1500;

    const baseHeaders: Record<string, string> = {
      "x-rapidapi-host": cfg.host,
      "x-rapidapi-key": apiKey,
      "x-apisports-key": apiKey,
    };

    // 1) Try with season (best for football + some other sports)
    for (const season of seasonCandidates(sport)) {
      const url =
        `https://${cfg.host}/${cfg.path}` +
        `?id=${encodeURIComponent(id)}` +
        `&season=${encodeURIComponent(season)}`;

      const res = await fetchWithTimeout(
        url,
        { headers: baseHeaders, next: { revalidate } },
        timeoutMs
      );

      if (!res.ok) continue;

      const json = await res.json();
      const item = json.response?.[0];
      if (!item) continue;

      let name = "Player";
      let teamName = "";
      let photo: string | undefined;
      let nationality: string | undefined;

      if (sport === "football") {
        name = item.player?.name || item.player?.lastname || name;
        photo = item.player?.photo;
        nationality = item.player?.nationality;
        teamName = item.statistics?.[0]?.team?.name || "";
      } else {
        const first = item.firstname ?? "";
        const last = item.lastname ?? "";
        name = (item.name || `${first} ${last}`.trim() || name).trim();
        teamName = item.team?.name || "";
        photo = item.photo || item.image;
        nationality = item.country;
      }

      return { name, teamName, photo, nationality };
    }

    // 2) Fallback: try without season (some endpoints may still respond)
    const url = `https://${cfg.host}/${cfg.path}?id=${encodeURIComponent(id)}`;
    const res = await fetchWithTimeout(
      url,
      { headers: baseHeaders, next: { revalidate } },
      timeoutMs
    );

    if (!res.ok) return null;

    const json = await res.json();
    const item = json.response?.[0];
    if (!item) return null;

    let name = "Player";
    let teamName = "";
    let photo: string | undefined;
    let nationality: string | undefined;

    if (sport === "football") {
      name = item.player?.name || item.player?.lastname || name;
      photo = item.player?.photo;
      nationality = item.player?.nationality;
      teamName = item.statistics?.[0]?.team?.name || "";
    } else {
      const first = item.firstname ?? "";
      const last = item.lastname ?? "";
      name = (item.name || `${first} ${last}`.trim() || name).trim();
      teamName = item.team?.name || "";
      photo = item.photo || item.image;
      nationality = item.country;
    }

    return { name, teamName, photo, nationality };
  } catch (err) {
    // Don't throw — keep SEO stable with fallbacks
    console.error(`Error fetching player SEO for ${sport}/${id}:`, err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* BUILDER                                                                    */
/* -------------------------------------------------------------------------- */

export async function buildPlayerSeo({ sport: rawSport, id }: { sport: string; id: string }) {
  const store = await getSeoStore();
  const brand = store.brand;
  const sport = normalizeSport(rawSport);

  // 1) Fetch Data
  const data = await fetchPlayerData(sport, id);

  // 2) Fallback strings
  const name = data?.name || "Player Profile";
  const team = data?.teamName || "";

  // 3) Resolve Patterns (from JSON-backed store)
  const patterns = store.player;
  const patternIndex = (id.charCodeAt(0) || 0) % patterns.titlePatterns.length;
  const rawTitlePattern = patterns.titlePatterns[patternIndex] || patterns.titlePatterns[0];

  const sportLabel = store.labels?.sportLabels?.[sport] || sport;

  const replacer = (tpl: string) =>
    tpl
      .replace(/{name}/g, name)
      .replace(/{team}/g, team)
      .replace(/{brand}/g, brand.siteName)
      .replace(/{sport}/g, sportLabel);

  const cleanup = (s: string) =>
    s
      .replace(/\s*\(\s*\)\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

  const title = cleanup(replacer(rawTitlePattern));
  const description = cleanup(replacer(patterns.descriptionPattern));
  const h1 = cleanup(replacer(patterns.h1Pattern));

  // 4) Canonical (keep trailing slash consistent with your deployed URLs)
  const canonicalPath = `/player/${sport}/${id}/`;

  // 5) Keywords (include player name strongly)
  const keywords = [
    name,
    `${name} profile`,
    `${name} stats`,
    `${name} ${sportLabel}`,
    team ? `${name} ${team}` : "",
    team ? `${team} player` : "",
    "player profile",
    "player stats",
  ].filter(Boolean);

  // 6) OG image (absolute is safest)
  const ogImageAbs =
    normalizeImageUrl(brand.siteUrl, data?.photo) ||
    normalizeImageUrl(brand.siteUrl, patterns.og.fallbackImage) ||
    normalizeImageUrl(brand.siteUrl, brand.defaultOgImage);

  let entry: SeoEntry = {
    title,
    description,
    h1,
    canonical: canonicalPath,
    ogImage: ogImageAbs,
    keywords,
  };

  // 7) JSON-LD
  if (patterns.schema.enabled) {
    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "Athlete",
      name,
      url: fullUrl(brand.siteUrl, canonicalPath),
      nationality: data?.nationality ? { "@type": "Country", name: data.nationality } : undefined,
      affiliation: team ? { "@type": "SportsTeam", name: team } : undefined,
      image: ogImageAbs,
      description,
    };
  }

  // 8) (Optional) builder-level metadata — safe if used anywhere else
  const canonicalUrl = fullUrl(brand.siteUrl, canonicalPath);

  const metadata: Metadata = {
    title,
    description,
    keywords, // string[]
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: ogImageAbs ? [{ url: ogImageAbs, width: 1200, height: 630, alt: h1 }] : [],
      type: "profile",
      siteName: brand.siteName,
      locale: brand.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageAbs ? [ogImageAbs] : [],
    },
    robots: { index: true, follow: true },
  };

  return { entry, metadata };
}

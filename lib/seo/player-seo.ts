// lib/seo/player-seo.ts
import type { Metadata } from "next";
import type { SeoEntry } from "./seo-central";
import { getSeoStoreSync } from "./seo-store";

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

/* -------------------------------------------------------------------------- */
/* DATA FETCHER                                                               */
/* -------------------------------------------------------------------------- */

async function fetchPlayerData(sport: string, id: string): Promise<PlayerApiData | null> {
  const cfg = SPORT_API[sport];
  if (!cfg) return null;

  try {
    const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    if (!apiKey) return null;

    // IMPORTANT: Football API requires a 'season' param for the /players endpoint.
    // We default to 2024 to ensure we get data.
    let url = `https://${cfg.host}/${cfg.path}?id=${id}`;
    if (sport === "football") url += "&season=2024";
    else if (sport === "basketball") url += "&season=2024-2025";
    else url += "&season=2024";

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": cfg.host,
        "x-rapidapi-key": apiKey,
      },
      next: { revalidate: 3600 }, // Cache SEO data for 1 hour
    });

    if (!res.ok) return null;
    const json = await res.json();
    const item = json.response?.[0];

    if (!item) return null;

    // Parse Response
    let name = "Player";
    let teamName = "";
    let photo = undefined;
    let nationality = undefined;

    if (sport === "football") {
      name = item.player?.name || item.player?.lastname || name;
      photo = item.player?.photo;
      nationality = item.player?.nationality;
      teamName = item.statistics?.[0]?.team?.name || "";
    } else {
      name = item.name || `${item.firstname} ${item.lastname}` || name;
      teamName = item.team?.name || "";
      photo = item.photo || item.image;
      nationality = item.country;
    }

    return { name, teamName, photo, nationality };

  } catch (err) {
    console.error(`Error fetching player SEO for ${sport}/${id}:`, err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* BUILDER                                                                    */
/* -------------------------------------------------------------------------- */

export async function buildPlayerSeo({ sport: rawSport, id }: { sport: string; id: string }) {
  const store = getSeoStoreSync();
  const brand = store.brand;
  const sport = normalizeSport(rawSport);

  // 1. Fetch Data
  const data = await fetchPlayerData(sport, id);

  // 2. Fallback strings
  const name = data?.name || "Player Profile";
  const team = data?.teamName || "";
  
  // 3. Resolve Patterns
  const patterns = store.player;
  const patternIndex = (id.charCodeAt(0) || 0) % patterns.titlePatterns.length;
  const rawTitlePattern = patterns.titlePatterns[patternIndex] || patterns.titlePatterns[0];

  const replacer = (tpl: string) =>
    tpl
      .replace(/{name}/g, name)
      .replace(/{team}/g, team)
      .replace(/{brand}/g, brand.siteName)
      .replace(/{sport}/g, store.labels.sportLabels[sport] || sport);

  const title = replacer(rawTitlePattern);
  const description = replacer(patterns.descriptionPattern);
  const h1 = replacer(patterns.h1Pattern);

  const canonicalPath = `/player/${sport}/${id}`;
  
  // 4. Build Entry
  let entry: SeoEntry = {
    title,
    description,
    h1,
    canonical: canonicalPath,
    ogImage: data?.photo || patterns.og.fallbackImage,
    keywords: [name, `${name} stats`, `${name} ${team}`, team],
  };

  // 5. JSON-LD
  if (patterns.schema.enabled) {
    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "Athlete",
      "name": name,
      "url": fullUrl(brand.siteUrl, canonicalPath),
      "nationality": data?.nationality ? { "@type": "Country", "name": data.nationality } : undefined,
      "affiliation": { "@type": "SportsTeam", "name": team },
      "image": data?.photo ? fullUrl(brand.siteUrl, data.photo) : undefined,
      "description": description
    };
  }

  return { entry, metadata: {} as Metadata };
}
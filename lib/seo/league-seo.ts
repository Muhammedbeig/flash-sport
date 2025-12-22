// lib/seo/league-seo.ts
import type { Metadata } from "next";
import type { SeoEntry } from "./seo-central";
import { getSeoStoreSync } from "./seo-store";

/* -------------------------------------------------------------------------- */
/* CONFIG & HELPERS                                                           */
/* -------------------------------------------------------------------------- */

// ✅ FIX: Added 'id' to the type definition
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

function cleanSlug(slug: string) {
  return slug.replace(/-/g, " ");
}

function fullUrl(baseUrl: string, path: string) {
  const base = (baseUrl || "").replace(/\/+$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

/* -------------------------------------------------------------------------- */
/* DATA FETCHER                                                               */
/* -------------------------------------------------------------------------- */

// ✅ Ensure this is exported
export async function fetchLeagueData(sport: string, idOrSlug: string): Promise<LeagueApiData | null> {
  const cfg = SPORT_API[sport];
  if (!cfg) return null;

  try {
    const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    if (!apiKey) return null;

    const isNumeric = /^\d+$/.test(idOrSlug);
    let url = `https://${cfg.host}/${cfg.path}`;
    
    if (isNumeric) {
      url += `?id=${idOrSlug}`;
    } else {
      url += `?search=${encodeURIComponent(cleanSlug(idOrSlug))}`;
    }

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": cfg.host,
        "x-rapidapi-key": apiKey,
      },
      next: { revalidate: 86400 }, 
    });

    if (!res.ok) return null;
    const json = await res.json();
    const item = json.response?.[0];

    if (!item) return null;

    const leagueNode = item.league || item; 
    const countryNode = item.country || {};

    // ✅ FIX: Capture the ID
    const id = leagueNode.id;
    const name = leagueNode.name || "Unknown League";
    const logo = leagueNode.logo;
    const country = countryNode.name || "World";
    
    let season = undefined;
    if (item.seasons && Array.isArray(item.seasons)) {
        const last = item.seasons[item.seasons.length - 1];
        season = last.year || last.season;
    }

    // ✅ FIX: Return the ID
    return { id, name, country, logo, season };

  } catch (err) {
    console.error(`Error fetching league SEO for ${sport}/${idOrSlug}:`, err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* SEO BUILDER                                                                */
/* -------------------------------------------------------------------------- */

export async function buildLeagueSeo({ sport: rawSport, league, tab }: { sport: string; league: string; tab?: string }) {
  const store = getSeoStoreSync();
  const brand = store.brand;
  const sport = normalizeSport(rawSport);

  const data = await fetchLeagueData(sport, league);

  const name = data?.name || cleanSlug(league) || "League";
  const country = data?.country || "";
  const cleanTab = (tab || "").toLowerCase();
  
  const patterns = store.league;
  const rawTitlePattern = patterns.titlePatterns[0];

  const replacer = (tpl: string) =>
    tpl
      .replace(/{name}/g, name)
      .replace(/{country}/g, country)
      .replace(/{season}/g, data?.season ? String(data.season) : "")
      .replace(/{brand}/g, brand.siteName)
      .replace(/{sport}/g, store.labels.sportLabels[sport] || sport);

  const title = replacer(rawTitlePattern);
  const description = replacer(patterns.descriptionPattern);
  const h1 = replacer(patterns.h1Pattern);

  let canonicalPath = `/${sport}/${league}`;
  let finalTitle = title;
  
  if (cleanTab && cleanTab !== "summary") {
    canonicalPath += `/${cleanTab}`;
    finalTitle = `${name} ${cleanTab.charAt(0).toUpperCase() + cleanTab.slice(1)} | ${brand.siteName}`;
  }
  
  let entry: SeoEntry = {
    title: finalTitle,
    description,
    h1,
    canonical: canonicalPath,
    ogImage: data?.logo || patterns.og.fallbackImage,
    keywords: [name, `${name} table`, `${name} fixtures`, `${name} scores`],
  };

  if (patterns.schema.enabled) {
    entry.jsonLd = {
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      "name": name,
      "url": fullUrl(brand.siteUrl, canonicalPath),
      "logo": data?.logo ? fullUrl(brand.siteUrl, data.logo) : undefined,
      "location": { "@type": "Place", "name": country },
      "sport": sport,
      "description": description
    };
  }

  return { entry, metadata: {} as Metadata };
}
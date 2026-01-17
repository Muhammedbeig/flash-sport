// lib/sitemap.ts
import type { MetadataRoute } from "next";
import { buildApiRequest } from "@/lib/apiClient";
import { FOOTBALL_ROUTES } from "@/lib/seo-routes";

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

const SPORTS = ["football", "basketball", "baseball", "hockey", "rugby", "nfl", "volleyball"] as const;
const FEED_TABS = ["all", "live", "today", "finished", "scheduled"] as const;

const DEFAULT_MATCH_TAB = "summary";
const FETCH_REVALIDATE_SECONDS = 1800;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (explicit && explicit.trim()) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel && vercel.trim()) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

function isoDateUTC(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function safeDate(value: any): Date {
  const d = value ? new Date(value) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

function withSlash(url: string) {
  // Your next.config has trailingSlash: true
  return url.endsWith("/") ? url : `${url}/`;
}

function page(
  url: string,
  opts?: { lastModified?: Date; changeFrequency?: ChangeFreq; priority?: number }
) {
  const out: MetadataRoute.Sitemap[number] = {
    url: withSlash(url),
    lastModified: opts?.lastModified ?? new Date(),
    changeFrequency: opts?.changeFrequency,
    priority: opts?.priority,
  };
  return out;
}

async function fetchTodayMatchEntriesForSport(
  sport: (typeof SPORTS)[number],
  baseUrl: string
) {
  const endpointPath = sport === "football" ? "fixtures" : "games";

  const params = new URLSearchParams();
  params.set("timezone", "UTC");
  params.set("date", isoDateUTC());

  const { url, headers } = buildApiRequest(sport, endpointPath, params);

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const list: any[] = Array.isArray(json?.response) ? json.response : [];

    const items = list
      .map((item) => {
        const id =
          sport === "football"
            ? item?.fixture?.id ?? item?.id
            : item?.game?.id ?? item?.id;

        const date =
          sport === "football"
            ? item?.fixture?.date ?? item?.date
            : item?.game?.date ?? item?.date;

        if (id === undefined || id === null) return null;

        return { id: String(id), lastModified: safeDate(date) };
      })
      .filter(Boolean) as { id: string; lastModified: Date }[];

    const seen = new Set<string>();
    const deduped = items.filter((x) => {
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });

    return deduped.map((m) =>
      page(`${baseUrl}/match/${sport}/${m.id}/${DEFAULT_MATCH_TAB}`, {
        lastModified: m.lastModified,
        changeFrequency: "hourly",
        priority: 0.7,
      })
    );
  } catch {
    return [];
  }
}

/**
 * Sports + core static sitemap entries.
 * (DB-driven stuff like blog/faqs/custom pages is added in app/sitemap.ts)
 */
export async function buildSitemap(baseUrlOverride?: string): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (baseUrlOverride || getSiteUrl()).replace(/\/+$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Core static pages
  entries.push(page(`${baseUrl}/`, { lastModified: now, changeFrequency: "hourly", priority: 1 }));
  entries.push(page(`${baseUrl}/contact`, { lastModified: now, changeFrequency: "monthly", priority: 0.3 }));
  entries.push(page(`${baseUrl}/privacy-policy`, { lastModified: now, changeFrequency: "yearly", priority: 0.2 }));
  entries.push(page(`${baseUrl}/terms-of-service`, { lastModified: now, changeFrequency: "yearly", priority: 0.2 }));

  // Multi-sport feeds
  for (const sport of SPORTS) {
    for (const tab of FEED_TABS) {
      entries.push(
        page(`${baseUrl}/sports/${sport}/${tab}`, {
          lastModified: now,
          changeFrequency: "hourly",
          priority: 0.8,
        })
      );
    }
  }

  // Football SEO slug routes
  const footballLeagueSlugs = Object.keys(FOOTBALL_ROUTES.leagues || {});
  const footballTabs = ["summary", "fixtures", "results", "standings"];

  for (const slug of footballLeagueSlugs) {
    entries.push(page(`${baseUrl}/football/${slug}`, { lastModified: now, changeFrequency: "daily", priority: 0.7 }));
    for (const t of footballTabs) {
      entries.push(
        page(`${baseUrl}/football/${slug}/${t}`, {
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.65,
        })
      );
    }
  }

  // Today match pages
  const matchEntries = await Promise.all(SPORTS.map((s) => fetchTodayMatchEntriesForSport(s, baseUrl)));
  entries.push(...matchEntries.flat());

  return entries;
}

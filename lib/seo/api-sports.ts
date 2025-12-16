// lib/seo/api-sports.ts
import { SportKey } from "./seo-central";

type SportApiCfg = {
  host: string;
  path: string;
  cdnEnv?: string; // your existing env names (works server-side too)
};

const SPORT_API: Record<SportKey, SportApiCfg> = {
  football: { host: "v3.football.api-sports.io", path: "fixtures", cdnEnv: "NEXT_PUBLIC_CDN_FOOTBALL_URL" },
  basketball: { host: "v1.basketball.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_BASKETBALL_URL" },
  baseball: { host: "v1.baseball.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_BASEBALL_URL" },
  hockey: { host: "v1.hockey.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_HOCKEY_URL" },
  nfl: { host: "v1.american-football.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_NFL_URL" },
  rugby: { host: "v1.rugby.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_RUGBY_URL" },
  volleyball: { host: "v1.volleyball.api-sports.io", path: "games", cdnEnv: "NEXT_PUBLIC_CDN_VOLLEYBALL_URL" },
};

function normalizeSport(raw: string): SportKey {
  const s = (raw || "football").toLowerCase();
  if (s === "soccer") return "football";
  if (s === "ice-hockey") return "hockey";
  if (s === "american-football") return "nfl";
  return (s as SportKey) || "football";
}

function getApiKey() {
  return (
    process.env.API_SPORTS_KEY ||
    process.env.NEXT_PUBLIC_API_SPORTS_KEY || // fallback (you already use it)
    ""
  );
}

export type NormalizedMatch = {
  sport: SportKey;
  id: string;
  homeName: string;
  awayName: string;
  homeLogo?: string | null;
  awayLogo?: string | null;
  scoreText?: string; // "2 - 1"
  dateIso?: string;
  leagueName?: string;
  leagueCountry?: string;
  statusShort?: string;
  isLive?: boolean;
};

export async function fetchMatchNormalized(params: {
  sport: string;
  id: string;
  timeoutMs: number;
  revalidateSeconds: number;
}): Promise<NormalizedMatch | null> {
  const sport = normalizeSport(params.sport);
  const id = params.id;
  const cfg = SPORT_API[sport];
  const apiKey = getApiKey();

  const cdnBase = cfg.cdnEnv ? process.env[cfg.cdnEnv] : undefined;

  const url = cdnBase
    ? `${String(cdnBase).replace(/\/$/, "")}/${cfg.path}?id=${encodeURIComponent(id)}&timezone=UTC`
    : `https://${cfg.host}/${cfg.path}?id=${encodeURIComponent(id)}&timezone=UTC`;

  const headers: Record<string, string> = {};
  if (!cdnBase && apiKey) {
    // Works for API-Sports direct OR RapidAPI-style setups (harmless if unused)
    headers["x-apisports-key"] = apiKey;
    headers["x-rapidapi-key"] = apiKey;
    headers["x-rapidapi-host"] = cfg.host;
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      // In server code, Next will cache this if you enable it in your project;
      // keep it safe even if TS types complain by not using `next:` here.
      cache: "force-cache",
    });

    const json = await res.json();
    const item = json?.response?.[0];
    if (!item) return null;

    const core = item.fixture || item.game || item;
    const teams = item.teams || core.teams || {};
    const homeRaw = teams.home || teams.local || {};
    const awayRaw = teams.away || teams.visitors || teams.visitor || {};

    const homeName = homeRaw.name || "Team A";
    const awayName = awayRaw.name || "Team B";

    const scoresRaw = item.goals || item.scores || item.score || {};
    const hs =
      typeof scoresRaw?.home?.total !== "undefined"
        ? Number(scoresRaw.home.total)
        : typeof scoresRaw?.home !== "undefined"
        ? Number(scoresRaw.home)
        : null;

    const as =
      typeof scoresRaw?.away?.total !== "undefined"
        ? Number(scoresRaw.away.total)
        : typeof scoresRaw?.away !== "undefined"
        ? Number(scoresRaw.away)
        : typeof scoresRaw?.visitors?.total !== "undefined"
        ? Number(scoresRaw.visitors.total)
        : typeof scoresRaw?.visitors !== "undefined"
        ? Number(scoresRaw.visitors)
        : null;

    const scoreText =
      typeof hs === "number" && typeof as === "number" ? `${hs} - ${as}` : undefined;

    const league = item.league || core.league || {};
    const status = core.status || item.status || {};
    const statusShort = status.short || status.code || undefined;

    const isLive = ["1H", "2H", "HT", "ET", "P", "Q1", "Q2", "Q3", "Q4", "OT", "BT"].includes(
      String(statusShort || "")
    );

    return {
      sport,
      id,
      homeName,
      awayName,
      homeLogo: homeRaw.logo || null,
      awayLogo: awayRaw.logo || null,
      scoreText,
      dateIso: core.date || core.datetime || item.date || undefined,
      leagueName: league.name || undefined,
      leagueCountry: league.country || item.country?.name || undefined,
      statusShort,
      isLive,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

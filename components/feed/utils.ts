"use client";

export type NormalizedLeague = {
  id: number;
  name: string;
  country: string;
  logo?: string;
  flag: string | null;
};

export type NormalizedTeam = {
  id: number;
  name: string;
  logo?: string;
  winner?: boolean;
};

export type NormalizedGame = {
  id: number;
  date: string;
  status: { short: string; elapsed?: number; long: string };
  league: NormalizedLeague;
  teams: {
    home: NormalizedTeam;
    away: NormalizedTeam;
  };
  scores: {
    home: number | null;
    away: number | null;
  };
};

export function normalizeGame(item: any): NormalizedGame | null {
  if (!item) return null;

  // 1. Resolve Root Object
  // Football uses 'fixture', NBA/NFL/MLB/Hockey use 'game' or root
  const core = item.fixture || item.game || item;
  
  // Safety check: must have an ID
  if (!core || (!core.id && core.id !== 0)) return null;

  // 2. Resolve Date
  const dateStr = core.date || core.datetime || item.date || new Date().toISOString();
  
  // 3. Resolve Status
  const rawStatus = core.status || item.status || {};
  let statusShort = "NS";
  let statusLong = "Not Started";
  let elapsed: number | undefined;

  if (typeof rawStatus === "string") {
    statusShort = rawStatus;
  } else if (rawStatus) {
    statusShort = rawStatus.short || rawStatus.code || "NS";
    statusLong = rawStatus.long || rawStatus.description || statusShort;
    if (typeof rawStatus.timer === "number") elapsed = rawStatus.timer;
    else if (typeof rawStatus.elapsed === "number") elapsed = rawStatus.elapsed;
  }

  // 4. Resolve League
  const rawLeague = item.league || core.league || {};
  const rawCountry = rawLeague.country || item.country || core.country || {};
  
  const league: NormalizedLeague = {
    id: rawLeague.id || 0,
    name: rawLeague.name || "Unknown League",
    country: typeof rawCountry === "string" ? rawCountry : (rawCountry.name || "World"),
    logo: rawLeague.logo || null,
    flag: (typeof rawCountry === "object" ? rawCountry.flag : null) || rawLeague.flag || null,
  };

  // 5. Resolve Teams (Handle 'visitors' alias)
  const rawTeams = item.teams || core.teams || {};
  const homeRaw = rawTeams.home || rawTeams.local || {};
  const awayRaw = rawTeams.away || rawTeams.visitors || rawTeams.visitor || {};

  const home: NormalizedTeam = {
    id: homeRaw.id || 0,
    name: homeRaw.name || "Home",
    logo: homeRaw.logo || null,
    winner: homeRaw.winner,
  };

  const away: NormalizedTeam = {
    id: awayRaw.id || 0,
    name: awayRaw.name || "Away",
    logo: awayRaw.logo || null,
    winner: awayRaw.winner,
  };

  // 6. Resolve Scores
  const scoresRaw = item.goals || item.scores || item.score || {};
  
  const getScore = (side: string) => {
    // Nested object (scores.home.total) - Common in V1
    if (scoresRaw[side] && typeof scoresRaw[side].total !== "undefined") return scoresRaw[side].total;
    // Direct value (goals.home) - Common in V3
    if (typeof scoresRaw[side] !== "undefined" && scoresRaw[side] !== null) return Number(scoresRaw[side]);
    // 'visitors' alias for away
    if (side === "away" && scoresRaw.visitors) {
       return typeof scoresRaw.visitors.total !== "undefined" ? scoresRaw.visitors.total : scoresRaw.visitors;
    }
    return null;
  };

  return {
    id: core.id,
    date: dateStr,
    status: { short: statusShort, long: statusLong, elapsed },
    league,
    teams: { home, away },
    scores: { home: getScore("home"), away: getScore("away") },
  };
}
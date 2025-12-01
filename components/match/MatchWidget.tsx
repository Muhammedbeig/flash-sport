"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import MatchSummary from "@/components/match/tabs/MatchSummary";
import MatchStats from "@/components/match/tabs/MatchStats";
import MatchLineups from "@/components/match/tabs/MatchLineups";
import MatchH2H from "@/components/match/tabs/MatchH2H";

// ---- API HOSTS ----
const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  volleyball: "v1.volleyball.api-sports.io",
  handball: "v1.handball.api-sports.io",
  nba: "v1.basketball.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
};

// ---- TYPES (loose, we normalize later) ----
type ApiTeam = {
  id?: number;
  name?: string;
  logo?: string;
  winner?: boolean;
};

type ApiLeague = {
  id?: number;
  name?: string;
  country?: string;
  logo?: string;
  round?: string;
  season?: number;
};

type ApiStatusObject = {
  short?: string;
  long?: string;
  elapsed?: number;
};

type ApiFixtureCore = {
  id?: number;
  date?: string;
  timezone?: string;
  status?: ApiStatusObject | string;
  venue?: { name?: string; city?: string };
  league?: ApiLeague;
  teams?: { home?: ApiTeam; away?: ApiTeam };
};

type ApiEvent = {
  time: { elapsed: number; extra?: number };
  team: { id: number; logo: string; name: string };
  player: { id: number; name: string };
  assist: { id: number; name: string };
  type: string;
  detail: string;
};

type StatItem = {
  type: string;
  value: string | number | null;
};

type TeamStats = {
  team: { id: number; name: string; logo: string };
  statistics: StatItem[];
};

type NormalizedTeam = {
  id: number;
  name: string;
  logo: string;
  winner?: boolean;
};

type NormalizedLeague = {
  id: number;
  name: string;
  country: string;
  logo: string;
  round?: string;
  season?: number;
};

type NormalizedMatch = {
  id: number;
  date: string;
  venueName?: string;
  venueCity?: string;
  status: {
    short: string;
    long: string;
    elapsed?: number;
  };
  league: NormalizedLeague;
  teams: {
    home: NormalizedTeam;
    away: NormalizedTeam;
  };
  homeScore: number;
  awayScore: number;
  events: ApiEvent[];
  statistics: TeamStats[];
};

type MatchWidgetProps = {
  matchId: string | number;
  sport: string;
};

type TabId = "summary" | "stats" | "lineups" | "h2h";

export default function MatchWidget({ matchId, sport }: MatchWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // Match the widget theme to our app theme
  const widgetTheme = isDark ? "flash-dark" : "flash-light";

  const [match, setMatch] = useState<NormalizedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("summary");

  useEffect(() => {
    async function load() {
      // 1. If not football, we don't fetch/normalize manually.
      // We let the official widget handle it in the render below.
      if (sport !== "football") {
        setLoading(false);
        return;
      }

      if (!matchId) return;
      setLoading(true);

      try {
        const cdnFootball = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

        const host = SPORT_HOSTS[sport] || SPORT_HOSTS.football;
        const endpoint = sport === "football" ? "fixtures" : "games";

        let url = "";
        let headers: Record<string, string> = {};

        if (sport === "football" && cdnFootball) {
          url = `${cdnFootball}/${endpoint}?id=${matchId}`;
        } else {
          if (!apiKey) throw new Error("Missing API key");
          url = `https://${host}/${endpoint}?id=${matchId}`;
          headers = {
            "x-rapidapi-host": host,
            "x-rapidapi-key": apiKey,
          };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();
        const raw = Array.isArray(json?.response) ? json.response[0] : json?.response?.[0];

        if (!raw) {
          setMatch(null);
          return;
        }

        // ---- Normalize core, league, teams ----
        const core: ApiFixtureCore = (raw.fixture || raw.game || raw) ?? {};
        const leagueRaw: ApiLeague = (raw.league || core.league || {}) ?? {};
        const teamsRaw = (raw.teams || core.teams || {}) ?? {};

        const homeRaw: ApiTeam = teamsRaw.home ?? {};
        const awayRaw: ApiTeam = teamsRaw.away ?? {};

        const homeTeam: NormalizedTeam = {
          id: typeof homeRaw.id === "number" ? homeRaw.id : 0,
          name: homeRaw.name || "Home",
          logo: homeRaw.logo || "",
          winner: homeRaw.winner,
        };

        const awayTeam: NormalizedTeam = {
          id: typeof awayRaw.id === "number" ? awayRaw.id : 0,
          name: awayRaw.name || "Away",
          logo: awayRaw.logo || "",
          winner: awayRaw.winner,
        };

        const league: NormalizedLeague = {
          id: typeof leagueRaw.id === "number" ? leagueRaw.id : 0,
          name: leagueRaw.name || "Unknown League",
          country: leagueRaw.country || "",
          logo: leagueRaw.logo || "",
          round: leagueRaw.round,
          season: leagueRaw.season,
        };

        // ---- Normalize status ----
        const rawStatus = core.status;
        let statusShort = "";
        let statusLong = "";
        let elapsed: number | undefined;

        if (typeof rawStatus === "string") {
          statusShort = rawStatus;
          statusLong = rawStatus;
        } else if (rawStatus && typeof rawStatus === "object") {
          statusShort = rawStatus.short || "";
          statusLong = rawStatus.long || rawStatus.short || "";
          elapsed = rawStatus.elapsed;
        }

        // ---- Normalize scores (goals + scores + score.fulltime, with object totals) ----
        const goals = (raw.goals ?? {}) as { home?: number | null; away?: number | null };
        const scoresRaw = (raw.scores ?? raw.score ?? {}) as any;

        const computeScore = (side: "home" | "away"): number => {
          // 1) goals.home / goals.away (football)
          const goalVal = goals?.[side];
          if (typeof goalVal === "number") return goalVal;

          // 2) scoresRaw.home / scoresRaw.away directly as number
          const directScore = scoresRaw?.[side];
          if (typeof directScore === "number") return directScore;

          // 3) object with total / score (basketball, hockey, etc.)
          if (directScore && typeof directScore === "object") {
            if (typeof directScore.total === "number") return directScore.total;
            if (typeof directScore.score === "number") return directScore.score;
            if (typeof directScore.points === "number") return directScore.points;
          }

          // 4) scoresRaw.fulltime.home / away (some football formats)
          const fulltime = scoresRaw?.fulltime;
          if (fulltime && typeof fulltime[side] === "number") {
            return fulltime[side];
          }

          return 0;
        };

        const homeScore = computeScore("home");
        const awayScore = computeScore("away");

        // ---- Events & stats (mostly football) ----
        const events: ApiEvent[] = Array.isArray(raw.events) ? raw.events : [];
        const statistics: TeamStats[] = Array.isArray(raw.statistics)
          ? (raw.statistics as TeamStats[])
          : [];

        const normalized: NormalizedMatch = {
          id: typeof core.id === "number" ? core.id : Number(matchId),
          date: core.date || "",
          venueName: core.venue?.name,
          venueCity: core.venue?.city,
          status: {
            short: statusShort,
            long: statusLong || statusShort,
            elapsed,
          },
          league,
          teams: { home: homeTeam, away: awayTeam },
          homeScore,
          awayScore,
          events,
          statistics,
        };

        setMatch(normalized);
      } catch (err) {
        console.error("MatchWidget fetch error:", err);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [matchId, sport]);

  // =======================================================
  // 1. FALLBACK FOR NON-FOOTBALL SPORTS
  // =======================================================
  // Use the Official Widget for Basketball, NFL, Baseball, etc.
  // This automatically provides Summary, Stats, H2H, Lineups, etc.
  // without needing custom normalization.
  if (sport !== "football") {
    return (
      <div className="theme-bg rounded-xl border theme-border overflow-hidden min-h-[500px]">
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <api-sports-widget
                data-type="game"
                data-game-id="${matchId}"
                data-sport="${sport}"
                data-theme="${widgetTheme}"
                data-show-toolbar="true"
                data-refresh="60"
              ></api-sports-widget>
            `,
          }}
        />
      </div>
    );
  }

  // =======================================================
  // 2. FOOTBALL CUSTOM IMPLEMENTATION
  // =======================================================
  
  // ---- Loading / error states ----
  if (loading) {
    return (
      <div className="theme-bg rounded-xl border theme-border p-4 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="theme-bg rounded-xl border theme-border p-6 text-center text-sm text-secondary">
        Match details are not available.
      </div>
    );
  }

  // ---- Derived display values ----
  const { league, teams, status, homeScore, awayScore } = match;
  const homeTeam = teams.home;
  const awayTeam = teams.away;

  const finishedCodes = ["FT", "AET", "PEN", "AWD", "WO", "ABD", "CANC", "POST"];
  const scheduledCodes = ["NS", "TBD"];

  const isFinished = finishedCodes.includes(status.short);
  const isScheduled = scheduledCodes.includes(status.short);
  const isLive = !isFinished && !isScheduled;

  const dateObj = match.date ? new Date(match.date) : null;
  const localTime =
    dateObj && !Number.isNaN(dateObj.getTime())
      ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

  const displayStatus = isLive
    ? status.elapsed
      ? `${status.elapsed}'`
      : status.short || localTime
    : isScheduled
    ? localTime
    : status.short || localTime;

  const leagueLabel = `${league.country ? league.country + " - " : ""}${league.name}`;

  const tabs: { id: TabId; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "stats", label: "Stats" },
    { id: "lineups", label: "Lineups" },
    { id: "h2h", label: "H2H" },
  ];

  const tabButtonBase =
    "px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors";
  const activeTabClass = isDark
    ? "bg-slate-900 border-slate-600 text-blue-400"
    : "bg-blue-50 border-blue-400 text-blue-700";
  const inactiveTabClass = isDark
    ? "bg-transparent border-transparent text-secondary hover:bg-slate-900/60"
    : "bg-transparent border-transparent text-secondary hover:bg-slate-100";

  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden">
      {/* Header / meta */}
      <div className="px-4 py-3 border-b theme-border flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {league.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={league.logo}
              alt={league.name}
              className="w-8 h-8 object-contain"
            />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              {leagueLabel}
            </span>
            {league.round && (
              <span className="text-[11px] text-secondary">{league.round}</span>
            )}
            {(match.venueName || match.venueCity) && (
              <span className="text-[11px] text-secondary">
                {match.venueName}
                {match.venueCity ? ` · ${match.venueCity}` : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-[11px] font-bold uppercase tracking-widest text-secondary">
            <div className={isLive ? "text-[#dc2626]" : ""}>{displayStatus}</div>
            {localTime && !isLive && (
              <div className="text-[10px] text-secondary mt-0.5">{localTime}</div>
            )}
          </div>
        </div>
      </div>

      {/* Teams + score */}
      <div className="px-4 py-4 border-b theme-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 md:gap-5 flex-1 justify-between md:justify-start">
          {/* Home */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {homeTeam.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
            )}
            <span
              className={`text-sm md:text-base truncate ${
                homeScore > awayScore
                  ? "font-bold text-primary"
                  : "font-medium text-primary"
              }`}
            >
              {homeTeam.name}
            </span>
          </div>

          {/* Score */}
          <div className="text-2xl md:text-3xl font-black text-primary tracking-tight text-center px-2 md:px-6">
            {homeScore}
            <span className="text-secondary text-lg md:text-xl mx-1">-</span>
            {awayScore}
          </div>

          {/* Away */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 justify-end">
            <span
              className={`text-sm md:text-base truncate text-right ${
                awayScore > homeScore
                  ? "font-bold text-primary"
                  : "font-medium text-primary"
              }`}
            >
              {awayTeam.name}
            </span>
            {awayTeam.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-2 border-b theme-border flex items-center gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`${tabButtonBase} ${
              tab === t.id ? activeTabClass : inactiveTabClass
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {tab === "summary" && (
          <MatchSummary
            events={match.events}
            homeId={homeTeam.id}
            awayId={awayTeam.id}
            sport={sport}
          />
        )}
        {tab === "stats" && <MatchStats stats={match.statistics} />}
        {tab === "lineups" && (
          <MatchLineups matchId={String(match.id)} sport={sport} widgetTheme={widgetTheme} />
        )}
        {tab === "h2h" && (
          <MatchH2H teamOneId={homeTeam.id} teamTwoId={awayTeam.id} sport={sport} />
        )}
      </div>
    </div>
  );
}
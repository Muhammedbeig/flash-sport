"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import LeagueTabs from "@/components/widgets/LeagueTabs";

// ---------- API CONFIG PER SPORT ----------
const SPORT_CONFIG: Record<string, { host: string; endpoint: string }> = {
  football: { host: "v3.football.api-sports.io", endpoint: "fixtures" },
  basketball: { host: "v1.basketball.api-sports.io", endpoint: "games" },
  nba: { host: "v1.basketball.api-sports.io", endpoint: "games" },
  baseball: { host: "v1.baseball.api-sports.io", endpoint: "games" },
  hockey: { host: "v1.hockey.api-sports.io", endpoint: "games" },
  rugby: { host: "v1.rugby.api-sports.io", endpoint: "games" },
  nfl: { host: "v1.american-football.api-sports.io", endpoint: "games" },
  volleyball: { host: "v1.volleyball.api-sports.io", endpoint: "games" },
  handball: { host: "v1.handball.api-sports.io", endpoint: "games" },
};

// Sports supported by the LEAGUE widget + LeagueTabs
const LEAGUE_WIDGET_SPORTS = [
  "football",
  "afl",
  "baseball",
  "basketball",
  "handball",
  "hockey",
  "nba",
  "nfl",
  "rugby",
  "volleyball",
];

type NormalizedLeague = {
  id: number;
  name: string;
  country: string;
  logo?: string;
  flag: string | null;
};

type NormalizedTeam = {
  id: number;
  name: string;
  logo?: string;
  winner?: boolean;
};

type NormalizedGame = {
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

type CustomGameFeedProps = {
  sport?: string;
  leagueId?: string;
};

// ---------- NORMALIZER (ALL SPORTS) ----------
function normalizeGame(item: any): NormalizedGame | null {
  const core = item.fixture || item.game || item;
  if (!core || core.id == null) return null;

  // --- Status ---
  const rawStatus = core.status || item.status || {};
  let statusShort = "";
  let statusLong = "";
  let elapsed: number | undefined;

  if (typeof rawStatus === "string") {
    statusShort = rawStatus;
    statusLong = rawStatus;
  } else if (rawStatus) {
    statusShort = rawStatus.short ?? rawStatus.code ?? "";
    statusLong =
      rawStatus.long ??
      rawStatus.description ??
      rawStatus.full ??
      statusShort;
    if (typeof rawStatus.elapsed === "number") {
      elapsed = rawStatus.elapsed;
    }
  }

  // --- League & Country ---
  const rawLeague = item.league || core.league || {};
  const rawCountry = rawLeague.country || item.country || core.country;
  let countryName = "";
  let countryFlag: string | null = null;

  if (typeof rawCountry === "string") {
    countryName = rawCountry;
    countryFlag = rawLeague.flag ?? null;
  } else if (rawCountry && typeof rawCountry === "object") {
    // { name, code, flag }
    countryName = rawCountry.name ?? "";
    countryFlag = rawCountry.flag ?? rawLeague.flag ?? null;
  } else {
    countryName = "";
    countryFlag = rawLeague.flag ?? null;
  }

  const league: NormalizedLeague = {
    id: rawLeague.id ?? 0,
    name: rawLeague.name ?? "Unknown League",
    country: countryName,
    logo: rawLeague.logo ?? undefined,
    flag: countryFlag,
  };

  // --- Teams ---
  const rawTeams = item.teams || core.teams || {};
  const homeTeam = rawTeams.home || {};
  const awayTeam = rawTeams.away || {};

  const home: NormalizedTeam = {
    id: homeTeam.id ?? 0,
    name: homeTeam.name ?? "Home",
    logo: homeTeam.logo ?? undefined,
    winner: homeTeam.winner,
  };

  const away: NormalizedTeam = {
    id: awayTeam.id ?? 0,
    name: awayTeam.name ?? "Away",
    logo: awayTeam.logo ?? undefined,
    winner: awayTeam.winner,
  };

  // --- Scores ---
  const scoresRaw = item.goals ?? item.scores ?? item.score ?? {};
  let homeScore: any = scoresRaw.home;
  let awayScore: any = scoresRaw.away;

  if (homeScore && typeof homeScore === "object") {
    homeScore = homeScore.total ?? homeScore.score ?? homeScore.points ?? null;
  }
  if (awayScore && typeof awayScore === "object") {
    awayScore = awayScore.total ?? awayScore.score ?? awayScore.points ?? null;
  }

  return {
    id: core.id,
    date: core.date ?? core.datetime ?? core.time ?? "",
    status: {
      short: statusShort || "NS",
      long: statusLong || statusShort || "",
      elapsed,
    },
    league,
    teams: { home, away },
    scores: {
      home:
        typeof homeScore === "number"
          ? homeScore
          : homeScore == null
          ? null
          : Number(homeScore),
      away:
        typeof awayScore === "number"
          ? awayScore
          : awayScore == null
          ? null
          : Number(awayScore),
    },
  };
}

// ---------- MAIN COMPONENT ----------
export default function CustomGameFeed({
  sport = "football",
  leagueId,
}: CustomGameFeedProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] =
    useState<"all" | "live" | "finished" | "scheduled">("all");
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- FETCH DATA (RAW API + LEAGUE FILTER) ----
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setGames([]);

      const config = SPORT_CONFIG[sport] || SPORT_CONFIG.football;

      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        
        // DATE LOGIC:
        // 1. Football CDN usually expects UTC or works best with specific UTC dates.
        // 2. Other sports (Basketball, NFL) rely on the API receiving the LOCAL date/timezone to show "Today's" games correctly.
        
        const now = new Date();
        const utcDate = now.toISOString().split("T")[0]; // UTC for Football
        const localDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD Local for others
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        let url = "";
        let headers: Record<string, string> = {};
        const params = new URLSearchParams();

        // League filter
        if (sport === "nba") {
          // NBA default league 12 when leagueId not provided
          params.set("league", leagueId || "12");
        } else if (leagueId) {
          params.set("league", leagueId);
        }

        if (sport === "football" && cdnUrl) {
          // Keep existing Football functionality (UTC)
          params.set("date", utcDate);
          
          // BunnyCDN cache for football only
          url = `${cdnUrl.replace(/\/$/, "")}/${config.endpoint}?${params.toString()}`;
        } else {
          if (!apiKey) {
            console.warn("Missing NEXT_PUBLIC_API_SPORTS_KEY");
            setGames([]);
            setLoading(false);
            return;
          }

          // FIX: Use Local Date and User Timezone for non-football sports
          // This ensures if it's "Tuesday" for the user, we ask the API for "Tuesday" games in their timezone.
          params.set("date", localDate);
          params.set("timezone", userTimezone);

          url = `https://${config.host}/${config.endpoint}?${params.toString()}`;
          headers = {
            "x-rapidapi-host": config.host,
            "x-rapidapi-key": apiKey,
          };
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          console.error("Feed HTTP error", res.status, res.statusText);
          setGames([]);
          setLoading(false);
          return;
        }

        const json = await res.json();
        const rawList: any[] =
          Array.isArray(json?.response) && json.response.length > 0
            ? json.response
            : Array.isArray(json?.data)
            ? json.data
            : [];

        const normalized: NormalizedGame[] = rawList
          .map((item: any) => normalizeGame(item))
          .filter(
            (g: NormalizedGame | null): g is NormalizedGame => g !== null,
          );

        setGames(normalized);
      } catch (err) {
        console.error("Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sport, leagueId]);

  // ---------- TAB FILTERING ----------
  const finishedCodes = [
    "FT",
    "AET",
    "PEN",
    "POST",
    "CANC",
    "ABD",
    "AWD",
    "WO",
    "FO",
    "Ended",
  ];
  const scheduledCodes = ["NS", "TBD", "Not Started", "Scheduled"];

  const filteredGames = games.filter((g: NormalizedGame) => {
    const s = g.status.short;
    if (activeTab === "finished") return finishedCodes.includes(s);
    if (activeTab === "scheduled") return scheduledCodes.includes(s);
    if (activeTab === "live") {
      return !finishedCodes.includes(s) && !scheduledCodes.includes(s);
    }
    return true; // "all"
  });

  // ---------- GROUP BY LEAGUE ----------
  const grouped = filteredGames.reduce<
    Record<string, { meta: NormalizedLeague; games: NormalizedGame[] }>
  >((groups, game: NormalizedGame) => {
    const key = `${game.league.country || "World"}-${game.league.name}`;
    if (!groups[key]) {
      groups[key] = { meta: game.league, games: [] };
    }
    groups[key].games.push(game);
    return groups;
  }, {});

  // Live count for badge
  const liveCount = games.filter((g: NormalizedGame) => {
    const s = g.status.short;
    return ![...finishedCodes, ...scheduledCodes].includes(s);
  }).length;

  if (loading) {
    return <Skeleton className="w-full h-96 rounded-xl bg-skeleton" />;
  }

  // ---------- STYLING (MATCH YOUR EXISTING DESIGN) ----------
  const isDark = theme === "dark";

  const getTabStyle = (
    tab: "all" | "live" | "finished" | "scheduled",
  ): string => {
    const isActive = activeTab === tab;
    if (isActive && tab === "live") {
      return "bg-[#dc2626] text-white border-transparent shadow-sm";
    }
    if (isActive) {
      return "bg-[#0f80da] text-white border-transparent shadow-sm";
    }
    return isDark
      ? "bg-slate-800 text-slate-400 hover:bg-slate-700 border-transparent"
      : "bg-gray-100 text-slate-600 hover:bg-gray-200 border-transparent";
  };

  const matchRowBase =
    "flex items-center justify-between px-3 py-3 rounded-lg text-sm border-l-4 transition-all duration-200 group cursor-pointer";

  const matchRowInactive =
    theme === "dark"
      ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
      : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

  const canShowLeagueTabs =
    !!leagueId && LEAGUE_WIDGET_SPORTS.includes(sport.toLowerCase());

  // ---------- RENDER ----------
  return (
    <div className="w-full space-y-4">
      {/* Tabs (All / Live / Finished / Scheduled) */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${getTabStyle(
            "all",
          )}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("live")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${getTabStyle(
            "live",
          )}`}
        >
          {activeTab === "live" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
          Live ({liveCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("finished")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${getTabStyle(
            "finished",
          )}`}
        >
          Finished
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scheduled")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${getTabStyle(
            "scheduled",
          )}`}
        >
          Scheduled
        </button>
      </div>

      {/* Match list (grouped by league) */}
      <div className="theme-bg rounded-xl border theme-border overflow-hidden shadow-sm">
        {Object.values(grouped).map(({ meta, games: leagueGames }) => (
          <div
            key={`${meta.country || "World"}-${meta.name}`}
          >
            {/* League header */}
            <div
              className={`px-4 py-3 flex items-center justify-between border-b theme-border ${
                isDark ? "bg-slate-900/50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {meta.flag && (
                  <img
                    src={meta.flag}
                    alt={meta.country}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {meta.country || "World"} : {meta.name}
                </span>
              </div>
              <ChevronDown size={14} className="text-secondary" />
            </div>

            {/* Games for this league */}
            <div className="divide-y theme-border">
              {leagueGames.map((game) => {
                const s = game.status.short;
                const isFinished = finishedCodes.includes(s);
                const isScheduled = scheduledCodes.includes(s);
                const isLive = !isFinished && !isScheduled;

                const statusColor = isLive
                  ? "text-[#dc2626]"
                  : "text-secondary";

                const dateObj = game.date ? new Date(game.date) : null;
                const time =
                  dateObj && !Number.isNaN(dateObj.getTime())
                    ? dateObj.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                const displayStatus = isLive
                  ? game.status.elapsed
                    ? `${game.status.elapsed}'`
                    : game.status.short || time
                  : isScheduled
                  ? time
                  : game.status.short || time;

                return (
                  <Link
                    key={game.id}
                    href={`/match?id=${game.id}&sport=${sport}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${matchRowBase} ${matchRowInactive}`}
                  >
                    {/* Time / Status */}
                    <div
                      className={`w-12 text-center text-xs font-bold ${statusColor} shrink-0`}
                    >
                      {displayStatus}
                    </div>

                    {/* Teams */}
                    <div className="flex-1 px-4 space-y-2">
                      {/* Home */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {game.teams.home.logo && (
                            <img
                              src={game.teams.home.logo}
                              alt={game.teams.home.name}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span
                            className={`text-sm ${
                              game.teams.home.winner
                                ? "font-bold text-primary"
                                : "font-medium text-secondary group-hover:text-primary transition-colors"
                            }`}
                          >
                            {game.teams.home.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {game.scores.home ?? "-"}
                        </span>
                      </div>

                      {/* Away */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {game.teams.away.logo && (
                            <img
                              src={game.teams.away.logo}
                              alt={game.teams.away.name}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span
                            className={`text-sm ${
                              game.teams.away.winner
                                ? "font-bold text-primary"
                                : "font-medium text-secondary group-hover:text-primary transition-colors"
                            }`}
                          >
                            {game.teams.away.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {game.scores.away ?? "-"}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-primary transition-colors"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty-state: LeagueTabs for league pages, otherwise message */}
        {filteredGames.length === 0 && (
          <div className="p-4">
            {canShowLeagueTabs ? (
              <LeagueTabs sport={sport} leagueId={leagueId!} />
            ) : (
              <div className="p-8 text-center text-secondary">
                No matches found for this category today.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
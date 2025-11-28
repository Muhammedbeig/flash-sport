"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ChevronDown, ChevronRight } from "lucide-react";

// === 1. CONFIGURATION FOR SUPPORTED SPORTS ===
const SPORT_CONFIG: Record<string, { host: string; endpoint: string }> = {
  football: { host: "v3.football.api-sports.io", endpoint: "fixtures" },
  basketball: { host: "v1.basketball.api-sports.io", endpoint: "games" },
  nba: { host: "v1.basketball.api-sports.io", endpoint: "games" }, // NBA shares basketball host
  baseball: { host: "v1.baseball.api-sports.io", endpoint: "games" },
  hockey: { host: "v1.hockey.api-sports.io", endpoint: "games" },
  rugby: { host: "v1.rugby.api-sports.io", endpoint: "games" },
  nfl: { host: "v1.american-football.api-sports.io", endpoint: "games" },
  volleyball: { host: "v1.volleyball.api-sports.io", endpoint: "games" },
  handball: { host: "v1.handball.api-sports.io", endpoint: "games" },
};

// === 2. NORMALIZED DATA STRUCTURE ===
type NormalizedGame = {
  id: number;
  date: string;
  status: { short: string; elapsed?: number; long: string };
  league: {
    id: number;
    name: string;
    country: string; // always string after normalization
    logo: string;
    flag: string | null;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner?: boolean };
    away: { id: number; name: string; logo: string; winner?: boolean };
  };
  scores: {
    home: string | number | null;
    away: string | number | null;
  };
};

type TabKey = "all" | "live" | "finished" | "scheduled";

export default function CustomGameFeed({ sport = "football" }: { sport?: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  // GitHub Pages base path support (same pattern as MatchWidget player links)
  const repoName = process.env.NEXT_PUBLIC_REPO_NAME;
  const basePath = repoName ? `/${repoName}` : "";

  const openMatchUrl = (matchId: number) =>
    `${basePath}/match?id=${matchId}&sport=${sport}`;

  // === 3. UNIVERSAL DATA FETCHING ===
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setGames([]);

      const config = SPORT_CONFIG[sport] || SPORT_CONFIG.football;

      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const date = new Date().toISOString().split("T")[0];

        let url = "";
        let headers: Record<string, string> = {};

        // Use CDN for football if available
        if (sport === "football" && cdnUrl) {
          url = `${cdnUrl}/${config.endpoint}?date=${date}`;
        } else {
          if (!apiKey) {
            console.warn("Missing NEXT_PUBLIC_API_SPORTS_KEY");
            setGames([]);
            setLoading(false);
            return;
          }

          url = `https://${config.host}/${config.endpoint}?date=${date}`;

          // NBA filter: league id = 12 (standard NBA)
          if (sport === "nba") {
            url += `&league=12`;
          }

          headers = {
            "x-rapidapi-host": config.host,
            "x-rapidapi-key": apiKey,
          };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (!json || !json.response) {
          setGames([]);
          setLoading(false);
          return;
        }

        // === 4. DATA NORMALIZATION LAYER ===
        const normalized: NormalizedGame[] = (json.response as any[])
          .map((item: any) => {
            // Football uses 'fixture', others use 'game'
            const core = item.fixture || item.game;
            if (!core) return null; // guard against undefined core (fix for core.id error)

            // Football uses 'goals', others use 'scores'
            const scoreObj = item.goals || item.scores || {};

            let homeScore: any = scoreObj?.home ?? null;
            let awayScore: any = scoreObj?.away ?? null;

            if (typeof homeScore === "object" && homeScore !== null) {
              homeScore = homeScore.total ?? homeScore.score ?? null;
            }
            if (typeof awayScore === "object" && awayScore !== null) {
              awayScore = awayScore.total ?? awayScore.score ?? null;
            }

            // Normalize league.country – some (NFL) return { name, code, flag }
            const rawLeague = item.league || {};
            let leagueCountry = "";
            let leagueFlag: string | null = null;

            if (rawLeague.country && typeof rawLeague.country === "object") {
              leagueCountry = rawLeague.country.name ?? "";
              leagueFlag = rawLeague.country.flag ?? rawLeague.flag ?? null;
            } else {
              leagueCountry = rawLeague.country ?? "";
              leagueFlag = rawLeague.flag ?? null;
            }

            const league: NormalizedGame["league"] = {
              id: rawLeague.id,
              name: rawLeague.name,
              country: leagueCountry,
              logo: rawLeague.logo,
              flag: leagueFlag,
            };

            return {
              id: core.id,
              date: core.date,
              status: core.status,
              league,
              teams: item.teams,
              scores: {
                home: homeScore,
                away: awayScore,
              },
            } as NormalizedGame;
          })
          .filter((g): g is NormalizedGame => g !== null);

        setGames(normalized);
      } catch (e) {
        console.error("Feed Error:", e);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sport]);

  // === 5. FILTERS (TABS) ===
  const finishedCodes = ["FT", "AET", "PEN", "POST", "CANC", "ABD", "AWD", "WO", "FO"];
  const scheduledCodes = ["NS", "TBD"];

  const filteredGames = games.filter((g) => {
    const s = g.status.short;
    if (activeTab === "finished") return finishedCodes.includes(s);
    if (activeTab === "scheduled") return scheduledCodes.includes(s);
    if (activeTab === "live") {
      return !finishedCodes.includes(s) && !scheduledCodes.includes(s);
    }
    return true;
  });

  const liveCount = games.filter((g) => {
    const s = g.status.short;
    return !finishedCodes.includes(s) && !scheduledCodes.includes(s);
  }).length;

  // === 6. GROUP BY LEAGUE ===
  const grouped = filteredGames.reduce(
    (
      acc: Record<
        string,
        { meta: NormalizedGame["league"]; games: NormalizedGame[] }
      >,
      game,
    ) => {
      const key = `${game.league.country}-${game.league.name}`;
      if (!acc[key]) {
        acc[key] = { meta: game.league, games: [] };
      }
      acc[key].games.push(game);
      return acc;
    },
    {},
  );

  if (loading) {
    return <Skeleton className="w-full h-96 rounded-xl bg-skeleton" />;
  }

  const isDark = theme === "dark";

  const getTabStyle = (tab: TabKey | string) => {
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

  return (
    <div className="w-full space-y-4">
      {/* TABS (Rounded-MD) */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${getTabStyle(
            "all",
          )}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${getTabStyle(
            "live",
          )}`}
        >
          {activeTab === "live" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}{" "}
          Live ({liveCount})
        </button>
        <button
          onClick={() => setActiveTab("finished")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${getTabStyle(
            "finished",
          )}`}
        >
          Finished
        </button>
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${getTabStyle(
            "scheduled",
          )}`}
        >
          Scheduled
        </button>
      </div>

      {/* MATCH LIST */}
      <div className="theme-bg rounded-xl border theme-border overflow-hidden shadow-sm">
        {Object.values(grouped).map((group) => (
          <div key={`${group.meta.country}-${group.meta.name}`}>
            {/* LEAGUE HEADER */}
            <div
              className={`px-4 py-3 flex items-center justify-between border-b theme-border ${
                isDark ? "bg-slate-900/50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {group.meta.flag && (
                  <img
                    src={group.meta.flag}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {group.meta.country} : {group.meta.name}
                </span>
              </div>
              <ChevronDown size={14} className="text-secondary" />
            </div>

            {/* MATCHES */}
            <div className="divide-y theme-border">
              {group.games.map((game) => {
                const isLive =
                  !finishedCodes.includes(game.status.short) &&
                  !scheduledCodes.includes(game.status.short);
                const statusColor = isLive ? "text-[#dc2626]" : "text-secondary";

                const time = new Date(game.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const displayStatus = isLive
                  ? game.status.elapsed
                    ? `${game.status.elapsed}'`
                    : game.status.short
                  : scheduledCodes.includes(game.status.short)
                  ? time
                  : game.status.short;

                return (
                  <a
                    key={game.id}
                    href={openMatchUrl(game.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-3 border-l-4 border-transparent transition-all duration-200 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  >
                    {/* Time / Status */}
                    <div
                      className={`w-12 text-center text-xs font-bold ${statusColor} shrink-0`}
                    >
                      {displayStatus}
                    </div>

                    {/* Teams */}
                    <div className="flex-1 px-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={game.teams.home.logo}
                            alt={game.teams.home.name}
                            className="w-5 h-5 object-contain"
                          />
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

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={game.teams.away.logo}
                            alt={game.teams.away.name}
                            className="w-5 h-5 object-contain"
                          />
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

                    {/* Detail Arrow */}
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-primary transition-colors"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGames.length === 0 && (
          <div className="p-8 text-center text-secondary">
            No matches found for this category today.
          </div>
        )}
      </div>
    </div>
  );
}

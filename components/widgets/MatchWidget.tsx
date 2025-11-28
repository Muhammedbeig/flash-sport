"use client";

import { useEffect, useState, ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ChevronDown, ChevronUp, User } from "lucide-react";

// === CONSTANTS ===
const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  nba: "v1.basketball.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
  volleyball: "v1.volleyball.api-sports.io",
  handball: "v1.handball.api-sports.io",
};

// === TYPES ===
type Team = {
  id: number;
  name: string;
  logo: string;
  winner?: boolean;
};

type Score = {
  home: number | null;
  away: number | null;
};

type Status = {
  long: string;
  short: string;
  elapsed?: number;
};

type Venue = {
  name: string;
  city: string;
};

type League = {
  id: number;
  name: string;
  country: string; // always string after normalization
  logo: string;
  season: number;
};

type MatchData = {
  fixture: {
    id: number;
    date: string;
    status: Status;
    venue: Venue;
  };
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Score;
  score: {
    halftime: Score;
    fulltime: Score;
    extratime: Score;
    penalty: Score;
  };
};

type Player = {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid?: string;
  photo: string;
};

type TeamLineup = {
  team: { id: number; name: string; logo: string };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
};

// === HELPERS ===
function normalizeLeague(rawLeague: any): League {
  if (!rawLeague) {
    return {
      id: 0,
      name: "",
      country: "",
      logo: "",
      season: new Date().getFullYear(),
    };
  }

  let country = "";
  if (rawLeague.country && typeof rawLeague.country === "object") {
    // NFL-style: { name, code, flag }
    country = rawLeague.country.name ?? "";
  } else {
    country = rawLeague.country ?? "";
  }

  return {
    id: rawLeague.id ?? 0,
    name: rawLeague.name ?? "",
    country,
    logo: rawLeague.logo ?? "",
    season: rawLeague.season ?? new Date().getFullYear(),
  };
}

// Expandable wrapper (for Stats / Timeline / Lineups blocks)
function ExpandableWidget({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border flex flex-col">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex items-center justify-between w-full p-3 border-b theme-border bg-background/90"
      >
        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp size={14} className="text-secondary" />
        ) : (
          <ChevronDown size={14} className="text-secondary" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[3000px]" : "max-h-0 overflow-hidden"
        }`}
      >
        {isExpanded && <div className="p-3 sm:p-4">{children}</div>}
      </div>
    </div>
  );
}

// === HEADER (uses league.country — fixed via normalization) ===
function MatchHeader({ data }: { data: MatchData }) {
  const { fixture, league, teams, goals } = data;

  const utcDate = new Date(fixture.date);
  const localDate = utcDate.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const localTime = utcDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const status = fixture.status.short;
  const isLive = !["FT", "NS", "TBD", "PST"].includes(status);

  return (
    <div className="theme-bg rounded-xl border theme-border shadow-sm overflow-hidden mb-4">
      {/* League + Status */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b theme-border bg-background/90">
        <div className="flex items-center gap-3">
          {league.logo && (
            <img
              src={league.logo}
              alt={league.name}
              className="w-7 h-7 rounded-md bg-muted/40 object-contain"
            />
          )}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              {league.country}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {league.name} • {league.season}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              isLive
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-muted text-secondary"
            }`}
          >
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1" />
            )}
            {fixture.status.long}
          </div>
          <div className="text-[11px] text-secondary mt-1">
            {localDate} • {localTime}
          </div>
        </div>
      </div>

      {/* Teams + Score */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          {/* Home */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
              {teams.home.logo ? (
                <img
                  src={teams.home.logo}
                  alt={teams.home.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-xs text-white">
                    {teams.home.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                Home
              </span>
              <span className="text-sm font-semibold text-foreground">
                {teams.home.name}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center justify-center px-3">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>{goals.home ?? "-"}</span>
              <span className="text-secondary text-base">-</span>
              <span>{goals.away ?? "-"}</span>
            </div>
            <div className="text-[11px] text-secondary mt-1">
              HT {data.score.halftime.home ?? "-"}-{data.score.halftime.away ?? "-"}
            </div>
          </div>

          {/* Away */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                Away
              </span>
              <span className="text-sm font-semibold text-foreground">
                {teams.away.name}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
              {teams.away.logo ? (
                <img
                  src={teams.away.logo}
                  alt={teams.away.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-xs text-white">
                    {teams.away.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center justify-between text-[11px] text-secondary pt-1">
          <div>
            <span className="font-semibold">Venue: </span>
            <span>
              {fixture.venue.name}
              {fixture.venue.city ? ` • ${fixture.venue.city}` : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// === STATS WIDGET ===
function MatchStatsWidget({
  matchId,
  league,
  widgetTheme,
}: {
  matchId: number;
  league: League;
  widgetTheme: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
  if (!apiKey) return null;

  const themeColor = widgetTheme === "dark" ? "dark" : "light";

  return (
    <ExpandableWidget title="Match Stats & Insights">
      <div className="rounded-lg overflow-hidden border theme-border">
        <div
          className="widget-container bg-background/80"
          dangerouslySetInnerHTML={{
            __html: `<api-sports-widget 
              data-type="fixture"
              data-id="${matchId}"
              data-theme="${themeColor}"
              data-refresh="120"
              data-show-errors="false"
              data-locale="en"
              data-text-color="true"
              data-background-color="true"
              data-border-radius="14"
              data-toolbar="false"
              data-host="v3.football.api-sports.io"
              data-league="${league.id}"
              data-season="${league.season}"
              data-key="${apiKey}"
            ></api-sports-widget>`,
          }}
        />
      </div>
    </ExpandableWidget>
  );
}

// === TIMELINE WIDGET ===
function MatchTimelineWidget({
  matchId,
  widgetTheme,
  leagueId,
  season,
}: {
  matchId: number;
  widgetTheme: string;
  leagueId: number;
  season: number;
}) {
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
  if (!apiKey) return null;

  const themeColor = widgetTheme === "dark" ? "dark" : "light";

  return (
    <ExpandableWidget title="Match Timeline">
      <div className="rounded-lg overflow-hidden border theme-border">
        <div
          className="widget-container bg-background/80"
          dangerouslySetInnerHTML={{
            __html: `<api-sports-widget 
              data-type="timeline" 
              data-id="${matchId}"
              data-theme="${themeColor}"
              data-locale="en"
              data-border-radius="14"
              data-toolbar="false"
              data-league="${leagueId}"
              data-season="${season}"
              data-key="${apiKey}"
            ></api-sports-widget>`,
          }}
        />
      </div>
    </ExpandableWidget>
  );
}

// === LINEUPS (custom for football, widget fallback for others) ===
function MatchLineups({
  matchId,
  sport,
  widgetTheme,
}: {
  matchId: number;
  sport: string;
  widgetTheme: string;
}) {
  const [loading, setLoading] = useState(true);
  const [lineups, setLineups] = useState<TeamLineup[] | null>(null);
  const [useWidgetFallback, setUseWidgetFallback] = useState(false);

  useEffect(() => {
    async function fetchLineups() {
      // For non-football sports, just use widget
      if (sport !== "football") {
        setUseWidgetFallback(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        if (!apiKey) {
          setUseWidgetFallback(true);
          setLoading(false);
          return;
        }

        const host = SPORT_HOSTS.football;
        const url = `https://${host}/fixtures/lineups?fixture=${matchId}`;
        const headers = {
          "x-rapidapi-host": host,
          "x-rapidapi-key": apiKey,
        };

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (json.response && json.response.length > 0) {
          setLineups(json.response);
        } else {
          setUseWidgetFallback(true);
        }
      } catch (err) {
        console.warn("Lineup fetch failed, falling back to widget", err);
        setUseWidgetFallback(true);
      } finally {
        setLoading(false);
      }
    }

    fetchLineups();
  }, [matchId, sport]);

  const openPlayer = (playerId: number) => {
    const repoName = process.env.NEXT_PUBLIC_REPO_NAME;
    const basePath = repoName ? `/${repoName}` : "";
    window.open(`${basePath}/player?id=${playerId}&sport=${sport}`, "_blank");
  };

  if (loading) {
    return (
      <Skeleton className="h-64 w-full rounded-xl mt-4 bg-skeleton" />
    );
  }

  // Fallback: official widget (for other sports or missing data)
  if (useWidgetFallback || !lineups) {
    const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    if (!apiKey) return null;

    const themeColor = widgetTheme === "dark" ? "dark" : "light";

    return (
      <ExpandableWidget title="Lineups & Players">
        <div className="rounded-lg overflow-hidden border theme-border">
          <div
            className="widget-container bg-background/80"
            dangerouslySetInnerHTML={{
              __html: `<api-sports-widget 
                data-type="lineups"
                data-id="${matchId}"
                data-theme="${themeColor}"
                data-locale="en"
                data-toolbar="false"
                data-border-radius="14"
                data-text-color="true"
                data-background-color="true"
                data-key="${apiKey}"
                data-target-player="modal"
              ></api-sports-widget>`,
            }}
          />
        </div>
      </ExpandableWidget>
    );
  }

  // Custom football lineups: every player is clickable and opens /player in a new tab
  return (
    <ExpandableWidget title="Lineups & Players">
      <div className="grid gap-4 md:grid-cols-2">
        {lineups.map((teamLineup) => (
          <div
            key={teamLineup.team.id}
            className="rounded-xl border theme-border bg-background/60 overflow-hidden"
          >
            {/* Team header */}
            <div className="flex items-center gap-3 px-3 py-3 border-b theme-border bg-background/90">
              {teamLineup.team.logo ? (
                <img
                  src={teamLineup.team.logo}
                  alt={teamLineup.team.name}
                  className="w-8 h-8 rounded-lg bg-muted object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                  {teamLineup.team.name}
                </span>
                <span className="text-[11px] text-secondary/80">
                  {teamLineup.formation
                    ? `Formation: ${teamLineup.formation}`
                    : "Formation: N/A"}
                </span>
              </div>
            </div>

            {/* Coach */}
            {teamLineup.coach && (
              <div className="flex items-center gap-3 px-3 py-2 border-b theme-border bg-muted/30">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {teamLineup.coach.photo ? (
                    <img
                      src={teamLineup.coach.photo}
                      alt={teamLineup.coach.name}
                      className="w-7 h-7 object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-secondary" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-secondary uppercase tracking-wide">
                    Coach
                  </span>
                  <span className="text-xs text-foreground">
                    {teamLineup.coach.name || "Unknown"}
                  </span>
                </div>
              </div>
            )}

            {/* Starting XI */}
            <div className="px-3 py-2">
              <div className="text-[11px] font-semibold text-secondary uppercase tracking-wide mb-2">
                Starting XI
              </div>
              <div className="space-y-1.5">
                {teamLineup.startXI?.map(({ player }) => (
                  <button
                    key={player.id}
                    onClick={() => openPlayer(player.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="w-7 h-7 object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold w-6 text-center">
                            {player.number || "-"}
                          </span>
                          <span className="font-medium text-foreground group-hover:text-primary truncate max-w-[130px]">
                            {player.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-secondary/80">
                          {player.pos} {player.grid ? `• ${player.grid}` : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Substitutes */}
            <div className="px-3 py-2 border-t theme-border bg-muted/20 max-h-52 overflow-y-auto custom-scroll">
              <div className="text-[11px] font-semibold text-secondary uppercase tracking-wide mb-2">
                Substitutes
              </div>
              <div className="space-y-1.5">
                {teamLineup.substitutes?.map(({ player }) => (
                  <button
                    key={player.id}
                    onClick={() => openPlayer(player.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted/60 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="w-6 h-6 object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3 text-secondary" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold w-6 text-center">
                            {player.number || "-"}
                          </span>
                          <span className="font-medium text-foreground group-hover:text-primary truncate max-w-[130px]">
                            {player.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-secondary/80">
                          {player.pos}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ExpandableWidget>
  );
}

// === MAIN MATCH WIDGET ===
export default function MatchWidget({
  matchId,
  sport,
}: {
  matchId: number;
  sport: string;
}) {
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const { theme } = useTheme();
  const widgetTheme = theme === "dark" ? "dark" : "light";

  useEffect(() => {
    async function fetchMatchDetails() {
      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        if (!apiKey) {
          setLoading(false);
          return;
        }

        const host = SPORT_HOSTS[sport] || SPORT_HOSTS.football;
        const isFootball = sport === "football" || sport === "rugby";

        let url: string;
        if (isFootball) {
          url = `https://${SPORT_HOSTS.football}/fixtures?id=${matchId}`;
        } else {
          url = `https://${host}/games?id=${matchId}`;
        }

        const headers = {
          "x-rapidapi-host": host,
          "x-rapidapi-key": apiKey,
        };

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (!json.response || json.response.length === 0) {
          setMatchData(null);
          setLoading(false);
          return;
        }

        const item = json.response[0];

        if (isFootball) {
          const fixture = item.fixture;
          const league = normalizeLeague(item.league);
          const teams = item.teams;
          const goals = item.goals;
          const score = item.score;

          setMatchData({
            fixture: {
              id: fixture.id,
              date: fixture.date,
              status: fixture.status,
              venue: fixture.venue,
            },
            league,
            teams,
            goals,
            score,
          });
        } else {
          const game = item.game || item;
          const league = normalizeLeague(item.league || {});
          const teams = item.teams || {};
          const scores = item.scores || item.goals || {};

          let homeScore: any = scores.home ?? null;
          let awayScore: any = scores.away ?? null;

          if (homeScore && typeof homeScore === "object") {
            homeScore = homeScore.total ?? homeScore.score ?? null;
          }
          if (awayScore && typeof awayScore === "object") {
            awayScore = awayScore.total ?? awayScore.score ?? null;
          }

          setMatchData({
            fixture: {
              id: game.id,
              date: game.date,
              status: game.status,
              venue: {
                name: game.stage || "N/A",
                city: game.city || "",
              },
            },
            league,
            teams,
            goals: {
              home: homeScore,
              away: awayScore,
            },
            score: {
              halftime: { home: null, away: null },
              fulltime: { home: homeScore, away: awayScore },
              extratime: { home: null, away: null },
              penalty: { home: null, away: null },
            },
          });
        }
      } catch (err) {
        console.error("Match details fetch error:", err);
        setMatchData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMatchDetails();
  }, [matchId, sport]);

  if (loading || !matchData) {
    return (
      <div className="mt-6 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl bg-skeleton" />
        <Skeleton className="h-64 w-full rounded-xl bg-skeleton" />
      </div>
    );
  }

  const { league } = matchData;

  return (
    <div className="space-y-4 mt-4">
      {/* 1. HEADER */}
      <MatchHeader data={matchData} />

      {/* 2. STATS & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MatchStatsWidget
          matchId={matchId}
          league={league}
          widgetTheme={widgetTheme}
        />
        <MatchTimelineWidget
          matchId={matchId}
          leagueId={league.id}
          season={league.season}
          widgetTheme={widgetTheme}
        />
      </div>

      {/* 3. LINEUPS */}
      <MatchLineups
        matchId={matchId}
        sport={sport}
        widgetTheme={widgetTheme}
      />
    </div>
  );
}

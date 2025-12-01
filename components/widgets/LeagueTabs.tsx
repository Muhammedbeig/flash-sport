"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import LeagueStandingsTabs from "@/components/widgets/LeagueStandingsTabs";

// ... (Game/Team types remain the same) ...
type ApiGame = any; 

type NormalizedGame = {
  id: number;
  date: string;
  leagueName: string;
  leagueLogo?: string;
  statusShort: string;
  statusLong?: string;
  homeTeam: { id: number; name: string; logo?: string };
  awayTeam: { id: number; name: string; logo?: string };
  homeScore: number | null;
  awayScore: number | null;
};

type StandingsRow = {
  rank: number;
  team: { id: number; name: string; logo?: string };
  points: number;
  goalsDiff?: number;
  form?: string | null;
  all?: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals?: { for: number; against: number };
  };
};

const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  volleyball: "v1.volleyball.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
  // REMOVED HANDBALL
};

const SPORTS_WITH_STANDINGS = new Set([
  "football",
  "basketball",
  "baseball",
  "hockey",
  "rugby",
  "volleyball",
  "nfl",
  // REMOVED HANDBALL
]);

// ... (Rest of the component logic remains identical, preserving functionality) ...

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "results", label: "Results" },
  { id: "fixtures", label: "Fixtures" },
  { id: "standings", label: "Standings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const COMPLETED_STATUSES = new Set([
  "FT", "AET", "PEN", "FT_PEN", "AP", "END",
]);

const UPCOMING_STATUSES = new Set([
  "NS", "TBD", "PST", "SUSP", "INT", "DELAYED",
]);

const getSeasonForLeague = () => {
  const now = new Date();
  return now.getFullYear();
};

const normalizeGame = (raw: ApiGame): NormalizedGame => {
  const meta = raw.fixture || raw.game || raw;
  const league = raw.league || {};
  const teams = raw.teams || raw.scores?.teams || {};

  const home = teams.home || raw.home || {};
  const away = teams.away || raw.away || {};

  const goals = raw.goals || raw.score || raw.scores || {};
  let scoresHome: any =
    goals.home ??
    goals.home?.total ??
    goals.fulltime?.home ??
    goals.fulltime_home ??
    null;
  let scoresAway: any =
    goals.away ??
    goals.away?.total ??
    goals.fulltime?.away ??
    goals.fulltime_away ??
    null;

  if (scoresHome && typeof scoresHome === "object") {
    scoresHome = scoresHome.total ?? scoresHome.score ?? null;
  }
  if (scoresAway && typeof scoresAway === "object") {
    scoresAway = scoresAway.total ?? scoresAway.score ?? null;
  }

  return {
    id: meta.id,
    date: meta.date,
    leagueName: league.name,
    leagueLogo: league.logo,
    statusShort: meta.status?.short || meta.status?.long || "",
    statusLong: meta.status?.long,
    homeTeam: {
      id: home.id,
      name: home.name,
      logo: home.logo,
    },
    awayTeam: {
      id: away.id,
      name: away.name,
      logo: away.logo,
    },
    homeScore: scoresHome,
    awayScore: scoresAway,
  };
};

async function fetchLeagueGames(
  leagueId: string,
  sport: string,
  opts: { scope: "last" | "next"; limit: number },
): Promise<NormalizedGame[]> {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
  const host = SPORT_HOSTS[sport] || SPORT_HOSTS.football;
  const season = getSeasonForLeague();
  const endpoint = sport === "football" ? "fixtures" : "games";

  let url = "";
  let headers: Record<string, string> = {};

  if (sport === "football" && cdnUrl) {
    url = `${cdnUrl}/${endpoint}?league=${leagueId}&season=${season}&${opts.scope}=${opts.limit}`;
  } else {
    if (!apiKey) throw new Error("Missing API key");
    url = `https://${host}/${endpoint}?league=${leagueId}&season=${season}&${opts.scope}=${opts.limit}`;
    headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey };
  }

  const res = await fetch(url, { headers });
  const json = await res.json();

  if (!json.response || !Array.isArray(json.response)) return [];
  return json.response.map(normalizeGame);
}

async function fetchLeagueStandings(
  leagueId: string,
  sport: string,
): Promise<StandingsRow[]> {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
  const host = SPORT_HOSTS[sport] || SPORT_HOSTS.football;
  const season = getSeasonForLeague();

  let url = "";
  let headers: Record<string, string> = {};

  if (sport === "football" && cdnUrl) {
    url = `${cdnUrl}/standings?league=${leagueId}&season=${season}`;
  } else {
    if (!apiKey) throw new Error("Missing API key");
    url = `https://${host}/standings?league=${leagueId}&season=${season}`;
    headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey };
  }

  const res = await fetch(url, { headers });
  const json = await res.json();

  const rows =
    json?.response?.[0]?.league?.standings?.[0] ??
    json?.response?.[0]?.standings?.[0] ??
    [];

  return rows;
}

function GameRow({ game }: { game: NormalizedGame }) {
  const { theme } = useTheme();
  const cardBg =
    theme === "dark"
      ? "bg-slate-900/60 hover:bg-slate-800"
      : "bg-white hover:bg-slate-50";
  const statusClass =
    theme === "dark"
      ? "text-[10px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-300"
      : "text-[10px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-600";

  const hasScore =
    game.homeScore !== null &&
    game.homeScore !== undefined &&
    game.awayScore !== null &&
    game.awayScore !== undefined;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-xl border theme-border ${cardBg} transition-colors`}
    >
      <div className="flex flex-col gap-1 w-28 shrink-0 border-r theme-border pr-2">
        <span className="text-[10px] text-secondary font-medium">
          {new Date(game.date).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <div className="flex items-center gap-1">
          {game.leagueLogo && (
            <img
              src={game.leagueLogo}
              alt={game.leagueName}
              className="w-3 h-3 object-contain"
            />
          )}
          <span className="text-[9px] text-secondary truncate">
            {game.leagueName}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {game.homeTeam.logo && (
              <img
                src={game.homeTeam.logo}
                alt={game.homeTeam.name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="text-xs text-primary truncate">
              {game.homeTeam.name}
            </span>
          </div>
          {hasScore && (
            <span className="text-xs font-bold">{game.homeScore}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {game.awayTeam.logo && (
              <img
                src={game.awayTeam.logo}
                alt={game.awayTeam.name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="text-xs text-primary truncate">
              {game.awayTeam.name}
            </span>
          </div>
          {hasScore && (
            <span className="text-xs font-bold">{game.awayScore}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 w-20 shrink-0">
        <span className={statusClass}>
          {hasScore
            ? game.statusShort || "FT"
            : new Date(game.date).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
        </span>
      </div>
    </div>
  );
}

function LeagueSummaryTab({ leagueId, sport }: { leagueId: string; sport: string }) {
  const [scheduled, setScheduled] = useState<NormalizedGame[]>([]);
  const [latest, setLatest] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        const [nextGames, lastGames] = await Promise.all([
          fetchLeagueGames(leagueId, sport, { scope: "next", limit: 10 }),
          fetchLeagueGames(leagueId, sport, { scope: "last", limit: 10 }),
        ]);
        if (cancelled) return;

        const scheduledGames = nextGames.filter((g) =>
          UPCOMING_STATUSES.has(g.statusShort),
        );
        const finishedGames = lastGames.filter((g) =>
          COMPLETED_STATUSES.has(g.statusShort),
        );

        setScheduled(scheduledGames);
        setLatest(finishedGames);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [leagueId, sport]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-6 w-40 mt-4" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
          Scheduled
        </div>
        {scheduled.length === 0 ? (
          <div className="p-4 text-sm text-secondary rounded-lg border theme-border theme-bg">
            No upcoming games scheduled.
          </div>
        ) : (
          <div className="space-y-2">
            {scheduled.map((g) => (
              <GameRow key={g.id} game={g} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
          Latest Scores
        </div>
        {latest.length === 0 ? (
          <div className="p-4 text-sm text-secondary rounded-lg border theme-border theme-bg">
            No recent results available.
          </div>
        ) : (
          <div className="space-y-2">
            {latest.map((g) => (
              <GameRow key={g.id} game={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeagueResultsTab({ leagueId, sport }: { leagueId: string; sport: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        const lastGames = await fetchLeagueGames(leagueId, sport, {
          scope: "last",
          limit: 50,
        });
        if (cancelled) return;
        setGames(
          lastGames.filter((g) => COMPLETED_STATUSES.has(g.statusShort)),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [leagueId, sport]);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        No recent results for this league.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {games.map((g) => (
        <GameRow key={g.id} game={g} />
      ))}
    </div>
  );
}

function LeagueFixturesTab({ leagueId, sport }: { leagueId: string; sport: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        const nextGames = await fetchLeagueGames(leagueId, sport, {
          scope: "next",
          limit: 50,
        });
        if (cancelled) return;
        setGames(
          nextGames.filter((g) => UPCOMING_STATUSES.has(g.statusShort)),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [leagueId, sport]);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        No upcoming fixtures for this league.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {games.map((g) => (
        <GameRow key={g.id} game={g} />
      ))}
    </div>
  );
}

function LeagueStandingsTab({ leagueId, sport }: { leagueId: string; sport: string }) {
  const { theme } = useTheme();
  const [rows, setRows] = useState<StandingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const season = getSeasonForLeague();

  useEffect(() => {
    if (!SPORTS_WITH_STANDINGS.has(sport)) {
      setLoading(false);
      setApiFailed(true);
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setApiFailed(false);
        const data = await fetchLeagueStandings(leagueId, sport);
        if (cancelled) return;

        if (!data || !data.length) {
          setApiFailed(true);
        } else {
          setRows(data);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("Standings fetch failed", e);
          setApiFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [leagueId, sport]);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (apiFailed || !rows.length) {
    const widgetHtml = `
      <api-sports-widget
        data-type="standings"
        data-league="${leagueId}"
        data-season="${season}"
      ></api-sports-widget>
    `;

    return (
      <div className="p-4 space-y-3">
        <div className="text-xs text-secondary text-center">
          Standings not available from raw API. Showing widget fallback.
        </div>
        <div className="rounded-xl overflow-hidden border theme-border theme-bg">
          <div
            className="min-h-[360px]"
            dangerouslySetInnerHTML={{ __html: widgetHtml }}
          />
        </div>
      </div>
    );
  }

  const headerBg =
    theme === "dark" ? "bg-slate-900/80" : "bg-slate-50";
  const rowHover =
    theme === "dark" ? "hover:bg-slate-800/80" : "hover:bg-slate-100";

  return (
    <div className="p-4">
      <div
        className={`grid grid-cols-[2rem,1fr,2.5rem,2.5rem,2.5rem,2.5rem,3rem] items-center px-3 py-2 text-[10px] font-semibold text-secondary uppercase tracking-widest rounded-t-xl border-b theme-border ${headerBg}`}
      >
        <span>#</span>
        <span>Team</span>
        <span className="text-center">MP</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">Pts</span>
      </div>

      <div className="divide-y theme-border border-x border-b rounded-b-xl overflow-hidden">
        {rows.map((row: any) => {
          const stats = row.all || row.games || {};
          const mp = stats.played ?? stats.played_games ?? 0;

          return (
            <div
              key={row.team.id}
              className={`grid grid-cols-[2rem,1fr,2.5rem,2.5rem,2.5rem,2.5rem,3rem] items-center px-3 py-2 text-xs ${rowHover}`}
            >
              <span className="text-[11px] font-semibold text-secondary">
                {row.rank}
              </span>
              <div className="flex items-center gap-2 overflow-hidden">
                {row.team.logo && (
                  <img
                    src={row.team.logo}
                    alt={row.team.name}
                    className="w-5 h-5 object-contain shrink-0"
                  />
                )}
                <span className="truncate text-sm text-primary">
                  {row.team.name}
                </span>
              </div>
              <span className="text-[11px] text-center">{mp}</span>
              <span className="text-[11px] text-center">
                {stats.win ?? stats.wins ?? 0}
              </span>
              <span className="text-[11px] text-center">
                {stats.draw ?? stats.ties ?? 0}
              </span>
              <span className="text-[11px] text-center">
                {stats.lose ?? stats.losses ?? 0}
              </span>
              <span className="text-[11px] text-center font-bold">
                {row.points}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LeagueTabs({
  leagueId,
  sport = "football",
}: {
  leagueId?: string | null;
  sport?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!leagueId) return null;
  const leagueIdStr = String(leagueId);

  const availableTabs: TabId[] = TABS.filter((t) => {
    if (t.id === "standings" && !SPORTS_WITH_STANDINGS.has(sport)) {
      return false;
    }
    return true;
  }).map((t) => t.id as TabId);

  const [activeTab, setActiveTab] = useState<TabId>(
    availableTabs[0] ?? "summary",
  );

  const getTabStyle = (id: TabId) => {
    const isActive = id === activeTab;
    const base =
      "px-4 py-2 text-xs font-semibold uppercase tracking-widest border rounded-md transition-colors";

    if (isActive) {
      return `${base} bg-[#0f80da] text-white border-transparent`;
    }
    if (isDark) {
      return `${base} bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800`;
    }
    return `${base} bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200`;
  };

 const renderTabContent = () => {
  switch (activeTab) {
    case "summary":
      return <LeagueSummaryTab leagueId={leagueIdStr} sport={sport} />;
    case "results":
      return <LeagueResultsTab leagueId={leagueIdStr} sport={sport} />;
    case "fixtures":
      return <LeagueFixturesTab leagueId={leagueIdStr} sport={sport} />;
    case "standings":
      return (
        <LeagueStandingsTabs
          leagueId={leagueIdStr}
          sport={sport}
        />
      );
    default:
      return null;
  }
};

  return (
    <div className="mt-4 theme-bg rounded-xl border theme-border overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-2 border-b theme-border">
        {availableTabs.map((tabId) => {
          const meta = TABS.find((t) => t.id === tabId)!;
          return (
            <button
              key={tabId}
              className={getTabStyle(tabId)}
              onClick={() => setActiveTab(tabId)}
              type="button"
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
}
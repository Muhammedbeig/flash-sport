"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import LeagueStandingsTabs from "@/components/widgets/LeagueStandingsTabs";

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================

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

// Mode 1: Standard (No Live Games)
const TABS_STANDARD = [
  { id: "summary", label: "Summary" },
  { id: "results", label: "Results" },
  { id: "fixtures", label: "Fixtures" },
  { id: "standings", label: "Standings" },
] as const;

// Mode 2: Live (Active Games)
const TABS_LIVE = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "finished", label: "Finished" },
  { id: "scheduled", label: "Scheduled" },
  { id: "standings", label: "Standings" },
] as const;

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "P", "BT", "LIVE", "INT", "BREAK"]);
const COMPLETED_STATUSES = new Set([
  "FT",
  "AET",
  "PEN",
  "FT_PEN",
  "AP",
  "END",
  "AWD",
  "WO",
  "CANC",
  "ABD",
]);
const UPCOMING_STATUSES = new Set(["NS", "TBD", "PST", "SUSP", "DELAYED"]);

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const normalizeGame = (raw: any): NormalizedGame => {
  const meta = raw.fixture || raw.game || raw;
  const league = raw.league || {};
  const teams = raw.teams || raw.scores?.teams || {};
  const home = teams.home || raw.home || {};
  const away = teams.away || raw.away || {};
  const goals = raw.goals || raw.score || raw.scores || {};

  let scoresHome: any = goals.home ?? goals.home?.total ?? null;
  let scoresAway: any = goals.away ?? goals.away?.total ?? null;

  // Handle nested objects sometimes returned by API
  if (scoresHome && typeof scoresHome === "object") scoresHome = scoresHome.total ?? null;
  if (scoresAway && typeof scoresAway === "object") scoresAway = scoresAway.total ?? null;

  return {
    id: meta.id,
    date: meta.date,
    leagueName: league.name,
    leagueLogo: league.logo,
    statusShort: meta.status?.short || "",
    statusLong: meta.status?.long,
    homeTeam: { id: home.id, name: home.name, logo: home.logo },
    awayTeam: { id: away.id, name: away.name, logo: away.logo },
    homeScore: scoresHome,
    awayScore: scoresAway,
  };
};

// Central Fetcher
async function fetchGames(
  leagueId: string,
  sport: string,
  queryParams: string
): Promise<NormalizedGame[]> {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

  // Host mapping
  const hosts: Record<string, string> = {
    football: "v3.football.api-sports.io",
    basketball: "v1.basketball.api-sports.io",
    baseball: "v1.baseball.api-sports.io",
    hockey: "v1.hockey.api-sports.io",
    rugby: "v1.rugby.api-sports.io",
    volleyball: "v1.volleyball.api-sports.io",
    nfl: "v1.american-football.api-sports.io",
  };
  const host = hosts[sport] || hosts.football;

  const season = new Date().getFullYear();
  const endpoint = sport === "football" ? "fixtures" : "games";

  // Construct Query
  const query = `league=${leagueId}&season=${season}&${queryParams}`;

  const url = cdnUrl ? `${cdnUrl}/${endpoint}?${query}` : `https://${host}/${endpoint}?${query}`;

  let headers: Record<string, string> = {};
  if (!cdnUrl) {
    headers = {
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey || "",
    };
  }

  try {
    const res = await fetch(url, { headers, next: { revalidate: 60 } });
    const json = await res.json();
    if (!json.response || !Array.isArray(json.response)) return [];
    return json.response.map(normalizeGame);
  } catch (err) {
    console.error("Fetch Error:", err);
    return [];
  }
}

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

function GameRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-3 py-3 rounded-xl border theme-border theme-bg mb-2">
      {/* Time / Status */}
      <div className="flex flex-col gap-2 w-20 shrink-0 border-r theme-border pr-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-14" />
      </div>

      {/* Teams & Scores */}
      <div className="flex-1 px-3 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-44 max-w-[60%]" />
          </div>
          <Skeleton className="h-3 w-7" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-40 max-w-[60%]" />
          </div>
          <Skeleton className="h-3 w-7" />
        </div>
      </div>

      {/* Short Status */}
      <div className="w-12 text-right">
        <Skeleton className="h-3 w-8 ml-auto" />
      </div>
    </div>
  );
}

function TabsHeaderSkeleton() {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b theme-border overflow-x-auto no-scrollbar">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-md shrink-0" />
      ))}
    </div>
  );
}

function LeagueTabsShellSkeleton() {
  return (
    <div className="mt-4 theme-bg rounded-xl border theme-border overflow-hidden shadow-sm min-h-[500px]">
      <TabsHeaderSkeleton />
      <div className="p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <GameRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function GenericListSkeleton() {
  return (
    <div className="p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <GameRowSkeleton key={i} />
      ))}
    </div>
  );
}

function StandardSummarySkeleton() {
  return (
    <div className="space-y-6 p-2">
      <div>
        <div className="px-2 mb-2">
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <GameRowSkeleton key={`up-${i}`} />
        ))}
      </div>

      <div>
        <div className="px-2 mb-2">
          <Skeleton className="h-4 w-36 rounded" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <GameRowSkeleton key={`rs-${i}`} />
        ))}
      </div>
    </div>
  );
}

function GameRow({ game, sport }: { game: NormalizedGame; sport: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isLive = LIVE_STATUSES.has(game.statusShort);

  const cardBg = isDark ? "bg-slate-900/60 hover:bg-slate-800" : "bg-white hover:bg-slate-50";
  const statusColor = isLive ? "text-red-500 font-bold" : "text-secondary";
  const scoreColor = isLive ? "text-red-500 font-bold" : "text-primary font-bold";

  const sportKey = (sport || "football").toLowerCase().trim();
  const matchHref = `/match/${encodeURIComponent(sportKey)}/${encodeURIComponent(
    String(game.id)
  )}/summary/`;

  // ✅ FIX (only): alt fallback = "Team logo" if no name; title uses team name if present
  const homeName = (game?.homeTeam?.name || "").trim();
  const awayName = (game?.awayTeam?.name || "").trim();

  const homeAlt = homeName ? homeName : "Team logo";
  const awayAlt = awayName ? awayName : "Team logo";

  const homeTitle = homeName ? homeName : "";
  const awayTitle = awayName ? awayName : "";

  return (
    <Link
      href={matchHref}
      target="_blank"
      rel="noopener noreferrer"
      prefetch={false}
      className={`flex items-center justify-between px-3 py-3 rounded-xl border theme-border ${cardBg} mb-2 transition-colors cursor-pointer group`}
    >
      {/* Time / Status */}
      <div className="flex flex-col gap-1 w-20 shrink-0 border-r theme-border pr-2">
        <span className={`text-[10px] ${statusColor}`}>
          {isLive
            ? "LIVE"
            : new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        {!isLive && (
          <span className="text-[9px] text-secondary">
            {new Date(game.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {/* Teams & Scores */}
      <div className="flex-1 px-3 flex flex-col gap-1">
        {/* Home */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            {game.homeTeam.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.homeTeam.logo}
                alt={homeAlt}
                title={homeTitle}
                className="w-4 h-4 object-contain shrink-0"
              />
            )}
            <span className="text-xs text-primary truncate">{game.homeTeam.name}</span>
          </div>
          <span className={`text-xs ${scoreColor}`}>{game.homeScore ?? "-"}</span>
        </div>

        {/* Away */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            {game.awayTeam.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.awayTeam.logo}
                alt={awayAlt}
                title={awayTitle}
                className="w-4 h-4 object-contain shrink-0"
              />
            )}
            <span className="text-xs text-primary truncate">{game.awayTeam.name}</span>
          </div>
          <span className={`text-xs ${scoreColor}`}>{game.awayScore ?? "-"}</span>
        </div>
      </div>

      {/* Short Status (FT, 65', etc) */}
      <div className="w-12 text-right text-[10px] text-secondary font-mono">{game.statusShort}</div>
    </Link>
  );
}

// Generic List for Results/Fixtures/Live
function GenericList({ leagueId, sport, type }: { leagueId: string; sport: string; type: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        let q = "";
        const today = new Date().toISOString().split("T")[0];

        // --- QUERY LOGIC ---
        if (type === "live") {
          q = "live=all";
        } else if (type === "finished" || type === "results") {
          q = "last=30"; // Last 30 games
        } else if (type === "scheduled" || type === "fixtures") {
          q = "next=30"; // Next 30 games
        } else if (type === "all") {
          // "All" in Live Mode usually means "Today's Games"
          q = `date=${today}`;
        }

        const data = await fetchGames(leagueId, sport, q);

        // --- CLIENT-SIDE FILTERING (Extra Safety) ---
        let final = data;
        if (type === "finished") final = data.filter((g) => COMPLETED_STATUSES.has(g.statusShort));
        if (type === "scheduled") final = data.filter((g) => UPCOMING_STATUSES.has(g.statusShort));

        // Sort by date: Newest first for results, Oldest first for fixtures
        if (type === "finished") {
          final.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
          final.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        if (!cancelled) setGames(final);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [leagueId, sport, type]);

  if (loading) return <GenericListSkeleton />;

  if (games.length === 0) {
    return (
      <div className="p-10 text-center text-secondary text-sm">No matches found for this category.</div>
    );
  }

  return (
    <div className="p-2">
      {games.map((g) => (
        <GameRow key={g.id} game={g} sport={sport} />
      ))}
    </div>
  );
}

// Standard Summary (Shows "Upcoming" + "Results" in one view)
function StandardSummary({ leagueId, sport }: { leagueId: string; sport: string }) {
  // We fetch Next 5 and Last 5 for the summary view
  const [fixtures, setFixtures] = useState<NormalizedGame[]>([]);
  const [results, setResults] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [nextData, lastData] = await Promise.all([
          fetchGames(leagueId, sport, "next=5"),
          fetchGames(leagueId, sport, "last=5"),
        ]);

        if (!cancelled) {
          setFixtures(nextData);
          setResults(
            lastData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [leagueId, sport]);

  if (loading) return <StandardSummarySkeleton />;

  return (
    <div className="space-y-6 p-2">
      {fixtures.length > 0 && (
        <div>
          <div className="px-2 mb-2 text-xs font-bold text-secondary uppercase tracking-widest">
            Upcoming
          </div>
          {fixtures.map((g) => (
            <GameRow key={g.id} game={g} sport={sport} />
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="px-2 mb-2 text-xs font-bold text-secondary uppercase tracking-widest">
            Recent Results
          </div>
          {results.map((g) => (
            <GameRow key={g.id} game={g} sport={sport} />
          ))}
        </div>
      )}

      {fixtures.length === 0 && results.length === 0 && (
        <div className="p-8 text-center text-secondary text-sm">No data available.</div>
      )}
    </div>
  );
}

// ==========================================
// 4. MAIN EXPORT
// ==========================================

export default function LeagueTabs({
  leagueId,
  sport = "football",
  initialTab = "summary",
  leagueSlug,
}: {
  leagueId?: string | null;
  sport?: string;
  initialTab?: string;
  leagueSlug?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [checkingLive, setCheckingLive] = useState(true);
  const [localTab, setLocalTab] = useState(initialTab);

  // 1. Initial Check for Live Games to decide Mode
  useEffect(() => {
    if (!leagueId) return;
    let cancelled = false;

    async function check() {
      try {
        // Fast fetch to see if any live games exist
        const liveData = await fetchGames(leagueId!, sport, "live=all");
        if (!cancelled && liveData.length > 0) {
          setIsLiveMode(true);
        }
      } catch (e) {
        console.warn("Live check failed", e);
      } finally {
        if (!cancelled) setCheckingLive(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [leagueId, sport]);

  if (!leagueId) return null;
  if (checkingLive) return <LeagueTabsShellSkeleton />;

  // 2. Decide Tab Set
  const tabs = isLiveMode ? TABS_LIVE : TABS_STANDARD;

  // 3. Resolve Active Tab
  let activeTab = leagueSlug ? initialTab : localTab;

  // Fallback Logic
  if (isLiveMode) {
    if (activeTab === "summary") activeTab = "all";
    if (activeTab === "results") activeTab = "finished";
    if (activeTab === "fixtures") activeTab = "scheduled";
  } else {
    if (activeTab === "all" || activeTab === "live") activeTab = "summary";
  }

  // 4. Styling Helper
  const getTabStyle = (id: string) => {
    const isActive = id === activeTab;
    const base =
      "px-4 py-2 text-xs font-semibold uppercase tracking-widest border rounded-md transition-colors whitespace-nowrap";

    // Live Tab Highlight
    if (id === "live") {
      return isActive
        ? "bg-red-600 text-white border-red-600 animate-pulse px-6"
        : "text-red-500 border-red-200 bg-red-50 hover:bg-red-100 px-6";
    }

    if (isActive) return `${base} bg-[#0f80da] text-white border-transparent`;
    if (isDark) return `${base} bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800`;
    return `${base} bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200`;
  };

  // 5. Render Content Helper
  const renderContent = () => {
    // Standings (Shared)
    if (activeTab === "standings") {
      return <LeagueStandingsTabs leagueId={String(leagueId)} sport={sport} />;
    }

    // Live Mode Content
    if (isLiveMode) {
      return <GenericList leagueId={String(leagueId)} sport={sport} type={activeTab} />;
    }

    // Standard Mode Content
    if (activeTab === "summary") {
      return <StandardSummary leagueId={String(leagueId)} sport={sport} />;
    }

    // Results / Fixtures
    return <GenericList leagueId={String(leagueId)} sport={sport} type={activeTab} />;
  };

  return (
    <div className="mt-4 theme-bg rounded-xl border theme-border overflow-hidden shadow-sm min-h-[500px]">
      {/* TABS HEADER */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b theme-border overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const targetId = tab.id;

          if (leagueSlug) {
            return (
              <Link
                key={tab.id}
                href={`/${sport}/${leagueSlug}/${targetId}`}
                className={getTabStyle(tab.id)}
                prefetch={false}
              >
                {tab.id === "live" && (
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse mr-2 inline-block" />
                )}
                {tab.label}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              className={getTabStyle(tab.id)}
              onClick={() => setLocalTab(targetId)}
            >
              {tab.id === "live" && (
                <span className="w-2 h-2 rounded-full bg-current animate-pulse mr-2 inline-block" />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div>{renderContent()}</div>
    </div>
  );
}

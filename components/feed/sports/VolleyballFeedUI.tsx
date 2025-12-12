"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, AlertCircle } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { NormalizedGame, NormalizedLeague } from "../utils";

// --- VOLLEYBALL STATUS CODES ---
const FINISHED_CODES = ["FT", "AOT", "POST", "CANC", "ABD", "AWD", "Finished"];
const SCHEDULED_CODES = ["NS", "TBD"];
const LIVE_CODES = ["S1", "S2", "S3", "S4", "S5"];

type VolleyballFeedUIProps = {
  games?: NormalizedGame[];
  loading: boolean;
  error?: string | null;
  leagueId?: string;
  initialTab?: string;
};

function safeMatchHref(gameId: unknown) {
  if (gameId === null || gameId === undefined) return null;
  const id = String(gameId).trim();
  if (!id) return null;
  return `/match/volleyball/${encodeURIComponent(id)}/summary`;
}

const VolleyballLeagueGroup = ({
  meta,
  games,
  matchRowBase,
  matchRowInactive,
  isDark,
}: {
  meta: NormalizedLeague;
  games: NormalizedGame[];
  matchRowBase: string;
  matchRowInactive: string;
  isDark: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b theme-border last:border-0">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
          isDark ? "bg-slate-900/50 hover:bg-slate-900" : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          {meta.flag && <img src={meta.flag} alt={meta.country} className="w-4 h-4 object-contain" />}
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            {meta.country} : {meta.name}
          </span>
        </div>
        <ChevronDown size={16} className={`text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <div className={`divide-y theme-border ${isOpen ? "block" : "hidden"}`}>
        {games.map((game) => {
          const href = safeMatchHref(game?.id);
          if (!href) return null;

          const isLive = LIVE_CODES.includes(game.status.short);
          const statusColor = isLive ? "text-[#dc2626]" : "text-secondary";

          const dateObj = new Date(game.date);
          const time = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

          const displayStatus = isLive ? game.status.short : (SCHEDULED_CODES.includes(game.status.short) ? time : game.status.short);

          return (
            <Link
              key={game.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className={`${matchRowBase} ${matchRowInactive}`}
            >
              <div className={`w-14 text-center text-xs font-bold ${statusColor} shrink-0`}>{displayStatus}</div>

              <div className="flex-1 px-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {game.teams.home.logo && <img src={game.teams.home.logo} className="w-5 h-5 object-contain" />}
                    <span className={`text-sm ${game.teams.home.winner ? "font-bold text-primary" : "font-medium text-secondary"}`}>
                      {game.teams.home.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">{game.scores.home ?? "-"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {game.teams.away.logo && <img src={game.teams.away.logo} className="w-5 h-5 object-contain" />}
                    <span className={`text-sm ${game.teams.away.winner ? "font-bold text-primary" : "font-medium text-secondary"}`}>
                      {game.teams.away.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">{game.scores.away ?? "-"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default function VolleyballFeedUI({ games = [], loading, error, leagueId, initialTab }: VolleyballFeedUIProps) {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const isDark = theme === "dark";
  const activeTab = initialTab || "all";

  const safeGames = Array.isArray(games) ? games : [];

  const filteredGames = safeGames.filter((g) => {
    const s = g.status.short;
    if (activeTab === "finished") return FINISHED_CODES.includes(s);
    if (activeTab === "scheduled") return SCHEDULED_CODES.includes(s);
    if (activeTab === "live") return LIVE_CODES.includes(s);
    return true;
  });

  const grouped = filteredGames.reduce<Record<string, { meta: NormalizedLeague; games: NormalizedGame[] }>>((groups, game) => {
    const key = `${game.league.country || "World"}-${game.league.name}`;
    if (!groups[key]) groups[key] = { meta: game.league, games: [] };
    groups[key].games.push(game);
    return groups;
  }, {});

  const liveCount = safeGames.filter((g) => LIVE_CODES.includes(g.status.short)).length;

  if (loading) return <Skeleton className="w-full h-96 rounded-xl bg-skeleton" />;

  if (error) {
    return (
      <div className="w-full p-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 flex flex-col items-center gap-2 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const getTabStyle = (tab: string) => {
    const isActive = activeTab === tab;
    if (isActive && tab === "live") return "bg-[#dc2626] text-white shadow-sm";
    if (isActive) return "bg-[#0f80da] text-white shadow-sm";
    return isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-gray-100 text-slate-600 hover:bg-gray-200";
  };

  const matchRowBase =
    "flex items-center justify-between px-3 py-3 rounded-lg text-sm border-l-4 transition-all duration-200 group cursor-pointer";
  const matchRowInactive = isDark
    ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
    : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

  const getTabUrl = (tabId: string) => {
    const base = leagueId ? `/sports/volleyball/${tabId}/league/${leagueId}` : `/sports/volleyball/${tabId}`;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sport");
    params.delete("league");
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "All" },
          { id: "live", label: `Live (${liveCount})`, hasDot: true },
          { id: "finished", label: "Finished" },
          { id: "scheduled", label: "Scheduled" },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={getTabUrl(tab.id)}
            prefetch={false}
            className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${getTabStyle(tab.id)}`}
          >
            {tab.hasDot && activeTab === "live" && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="theme-bg rounded-xl border theme-border overflow-hidden shadow-sm">
        {Object.values(grouped).map(({ meta, games: leagueGames }) => (
          <VolleyballLeagueGroup
            key={`${meta.country}-${meta.name}`}
            meta={meta}
            games={leagueGames}
            matchRowBase={matchRowBase}
            matchRowInactive={matchRowInactive}
            isDark={isDark}
          />
        ))}

        {filteredGames.length === 0 && <div className="p-8 text-center text-secondary">No matches found for this category today.</div>}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import LeagueTabs from "@/components/widgets/LeagueTabs";
import { NormalizedGame, NormalizedLeague } from "./utils";

// Sports that support the League Detail View
const LEAGUE_WIDGET_SPORTS = [
  "football", "afl", "baseball", "basketball", "handball", 
  "hockey", "nfl", "rugby", "volleyball"
];

const finishedCodes = ["FT", "AET", "PEN", "POST", "CANC", "ABD", "AWD", "WO", "FO", "Ended", "Final"];
const scheduledCodes = ["NS", "TBD", "Not Started", "Scheduled", "Pre-game"];

type FeedUIProps = {
  games: NormalizedGame[];
  loading: boolean;
  sport: string;
  leagueId?: string;
};

export default function FeedUI({ games, loading, sport, leagueId }: FeedUIProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"all" | "live" | "finished" | "scheduled">("all");
  const isDark = theme === "dark";

  // Filter Logic
  const filteredGames = games.filter((g) => {
    const s = g.status.short;
    if (activeTab === "finished") return finishedCodes.includes(s);
    if (activeTab === "scheduled") return scheduledCodes.includes(s);
    if (activeTab === "live") return !finishedCodes.includes(s) && !scheduledCodes.includes(s);
    return true;
  });

  // Group by League
  const grouped = filteredGames.reduce<Record<string, { meta: NormalizedLeague; games: NormalizedGame[] }>>((groups, game) => {
    const key = `${game.league.country || "World"}-${game.league.name}`;
    if (!groups[key]) {
      groups[key] = { meta: game.league, games: [] };
    }
    groups[key].games.push(game);
    return groups;
  }, {});

  const liveCount = games.filter((g) => {
    const s = g.status.short;
    return !finishedCodes.includes(s) && !scheduledCodes.includes(s);
  }).length;

  if (loading) {
    return <Skeleton className="w-full h-96 rounded-xl bg-skeleton" />;
  }

  // Styles
  const getTabStyle = (tab: typeof activeTab) => {
    const isActive = activeTab === tab;
    if (isActive && tab === "live") return "bg-[#dc2626] text-white shadow-sm";
    if (isActive) return "bg-[#0f80da] text-white shadow-sm";
    return isDark 
      ? "bg-slate-800 text-slate-400 hover:bg-slate-700" 
      : "bg-gray-100 text-slate-600 hover:bg-gray-200";
  };

  const matchRowBase = "flex items-center justify-between px-3 py-3 rounded-lg text-sm border-l-4 transition-all duration-200 group cursor-pointer";
  const matchRowInactive = isDark
    ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
    : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

  const canShowLeagueTabs = !!leagueId && LEAGUE_WIDGET_SPORTS.includes(sport.toLowerCase());

  return (
    <div className="w-full space-y-4">
      {/* TABS */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "All" },
          { id: "live", label: `Live (${liveCount})`, hasDot: true },
          { id: "finished", label: "Finished" },
          { id: "scheduled", label: "Scheduled" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${getTabStyle(tab.id as any)}`}
          >
            {tab.hasDot && activeTab === "live" && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="theme-bg rounded-xl border theme-border overflow-hidden shadow-sm">
        {Object.values(grouped).map(({ meta, games: leagueGames }) => (
          <div key={`${meta.country}-${meta.name}`}>
            {/* LEAGUE HEADER */}
            <div className={`px-4 py-3 flex items-center justify-between border-b theme-border ${isDark ? "bg-slate-900/50" : "bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                {meta.flag && <img src={meta.flag} alt={meta.country} className="w-4 h-4 object-contain" />}
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">{meta.country} : {meta.name}</span>
              </div>
              <ChevronDown size={14} className="text-secondary" />
            </div>

            {/* MATCHES */}
            <div className="divide-y theme-border">
              {leagueGames.map((game) => {
                const isLive = !finishedCodes.includes(game.status.short) && !scheduledCodes.includes(game.status.short);
                const statusColor = isLive ? "text-[#dc2626]" : "text-secondary";
                const dateObj = new Date(game.date);
                const time = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                const displayStatus = isLive ? (game.status.elapsed ? `${game.status.elapsed}'` : "LIVE") : (scheduledCodes.includes(game.status.short) ? time : game.status.short);

                return (
                  <Link
                    key={game.id}
                    href={`/match?id=${game.id}&sport=${sport}`}
                    target="_blank"
                    className={`${matchRowBase} ${matchRowInactive}`}
                  >
                    <div className={`w-12 text-center text-xs font-bold ${statusColor} shrink-0`}>{displayStatus}</div>
                    
                    <div className="flex-1 px-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {game.teams.home.logo && <img src={game.teams.home.logo} className="w-5 h-5 object-contain" />}
                          <span className={`text-sm ${game.teams.home.winner ? "font-bold text-primary" : "font-medium text-secondary"}`}>{game.teams.home.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{game.scores.home ?? "-"}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {game.teams.away.logo && <img src={game.teams.away.logo} className="w-5 h-5 object-contain" />}
                          <span className={`text-sm ${game.teams.away.winner ? "font-bold text-primary" : "font-medium text-secondary"}`}>{game.teams.away.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{game.scores.away ?? "-"}</span>
                      </div>
                    </div>
                    
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGames.length === 0 && (
          <div className="p-4">
            {canShowLeagueTabs ? <LeagueTabs sport={sport} leagueId={leagueId!} /> : <div className="p-8 text-center text-secondary">No matches found for this category today.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
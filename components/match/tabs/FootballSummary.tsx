"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function FootballSummary({
  match,
  error,
}: {
  match: any;
  error?: string | null;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-secondary opacity-70 font-mono">{error}</p>
      </div>
    );
  }

  if (!match)
    return (
      <div className="p-8 text-center text-secondary text-sm">
        Loading summary...
      </div>
    );

  const { teams, events, statistics } = match;

  const getEventIcon = (type: string, detail: string) => {
    if (type === "Goal") return "⚽";
    if (type === "Card") return detail.includes("Yellow") ? "🟨" : "🟥";
    if (type === "subst") return "⇄";
    return "•";
  };

  const getStat = (type: string, teamIndex: number) => {
    const teamStats = statistics?.[teamIndex]?.statistics;
    if (!teamStats) return "-";
    const stat = teamStats.find((s: any) => s.type === type);
    return stat?.value ?? 0;
  };

  const headerBg = isDark
    ? "bg-slate-900/50 border-slate-800"
    : "bg-slate-50 border-slate-200";
  const timelineLineBg = isDark ? "bg-slate-700" : "bg-slate-200";
  const timeNodeBg = isDark
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-200 text-slate-700";

  // ✅ This tab is football-only, so player route uses /player/football/{id}
  const playerHref = (playerId: number | string) => `/player/football/${playerId}`;

  return (
    <div className="space-y-6 p-4">
      {/* 1. MATCH TIMELINE */}
      <div className="theme-bg border theme-border rounded-xl overflow-hidden">
        <div
          className={`px-4 py-3 border-b theme-border font-bold text-xs text-secondary uppercase tracking-widest text-center ${headerBg}`}
        >
          Match Events
        </div>

        {!events || events.length === 0 ? (
          <div className="p-8 text-center text-secondary text-sm italic">
            No events available for this match.
          </div>
        ) : (
          <div className="relative p-6 min-h-[200px]">
            <div
              className={`absolute left-1/2 top-6 bottom-6 w-px transform -translate-x-1/2 ${timelineLineBg}`}
            ></div>

            <div className="space-y-8">
              {events.map((ev: any, i: number) => {
                const isHome = ev.team.id === teams.home.id;
                const icon = getEventIcon(ev.type, ev.detail);
                const playerName = ev.player.name;
                const playerId = ev.player.id;

                return (
                  <div
                    key={i}
                    className="flex items-center w-full relative z-10"
                  >
                    {/* HOME SIDE */}
                    <div className="flex-1 flex justify-end items-center pr-8">
                      {isHome && (
                        <div className="text-right">
                          {playerId ? (
                            <Link
                              href={playerHref(playerId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block font-bold text-sm text-primary hover:text-blue-500 hover:underline transition-all"
                            >
                              {playerName}
                            </Link>
                          ) : (
                            <span className="block font-bold text-sm text-primary">
                              {playerName}
                            </span>
                          )}
                          <span className="block text-[10px] text-secondary uppercase tracking-wide opacity-80">
                            {ev.type}{" "}
                            {ev.detail !== "Normal Goal"
                              ? `- ${ev.detail}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CENTER */}
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-sm shrink-0 relative ${timeNodeBg}`}
                    >
                      {ev.time.elapsed}'
                      <span className="absolute -top-1 -right-1 text-sm">
                        {icon}
                      </span>
                    </div>

                    {/* AWAY SIDE */}
                    <div className="flex-1 flex justify-start items-center pl-8">
                      {!isHome && (
                        <div className="text-left">
                          {playerId ? (
                            <Link
                              href={playerHref(playerId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block font-bold text-sm text-primary hover:text-blue-500 hover:underline transition-all"
                            >
                              {playerName}
                            </Link>
                          ) : (
                            <span className="block font-bold text-sm text-primary">
                              {playerName}
                            </span>
                          )}
                          <span className="block text-[10px] text-secondary uppercase tracking-wide opacity-80">
                            {ev.type}{" "}
                            {ev.detail !== "Normal Goal"
                              ? `- ${ev.detail}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. QUICK STATS */}
      {statistics && statistics.length > 0 && (
        <div className="theme-bg border theme-border rounded-xl overflow-hidden">
          <div
            className={`px-4 py-3 border-b theme-border font-bold text-xs text-secondary uppercase tracking-widest text-center ${headerBg}`}
          >
            Quick Stats
          </div>
          <div className="p-4 space-y-3">
            {[
              "Ball Possession",
              "Total Shots",
              "Shots on Goal",
              "Corner Kicks",
              "Fouls",
            ].map((statName) => {
              const homeVal = getStat(statName, 0);
              const awayVal = getStat(statName, 1);

              const hNum = parseInt(String(homeVal).replace("%", "")) || 0;
              const aNum = parseInt(String(awayVal).replace("%", "")) || 0;
              const total = hNum + aNum;
              const hPer = total ? (hNum / total) * 100 : 50;

              return (
                <div key={statName} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold px-1 text-primary">
                    <span>{homeVal}</span>
                    <span className="text-secondary font-normal uppercase text-[10px] tracking-wider">
                      {statName}
                    </span>
                    <span>{awayVal}</span>
                  </div>
                  <div className="flex h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${hPer}%` }}
                    ></div>
                    <div
                      className="bg-red-500 h-full transition-all duration-500"
                      style={{ width: `${100 - hPer}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

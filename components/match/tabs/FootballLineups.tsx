"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

type Player = {
  player: { id: number; name: string; number: number; pos: string; grid: string | null };
};

type TeamLineup = {
  team: { id: number; name: string; logo: string };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: Player[];
  substitutes: Player[];
};

export default function FootballLineups({
  lineups,
  error,
}: {
  lineups: TeamLineup[];
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

  if (!lineups || !Array.isArray(lineups) || lineups.length < 2) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        Lineups not available.
      </div>
    );
  }

  const home = lineups[0];
  const away = lineups[1];

  const rowHover = isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50";
  const badgeBg = isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600";
  const homeBadge = isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600";
  const awayBadge = isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600";

  // ✅ This tab is football-only, so player route uses /player/football/{id}
  const playerHref = (playerId: number | string) => `/player/football/${playerId}`;

  const renderList = (players: Player[], title: string) => (
    <div className="mb-6">
      <h4 className="text-xs font-bold uppercase text-secondary mb-3 tracking-wider border-b theme-border pb-2">
        {title}
      </h4>
      <div className="space-y-1">
        {(players || []).map((item, idx) => {
          const pId = item.player.id;
          const pName = item.player.name;

          return (
            <div
              key={pId || idx}
              className={`flex items-center justify-between text-sm p-2 rounded transition-colors ${rowHover}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-mono font-bold text-secondary opacity-60">
                  {item.player.number}
                </span>
                {pId ? (
                  <Link
                    href={playerHref(pId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:text-blue-500 hover:underline"
                  >
                    {pName}
                  </Link>
                ) : (
                  <span className="font-medium text-primary">{pName}</span>
                )}
              </div>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${badgeBg}`}>
                {item.player.pos}
              </span>
            </div>
          );
        })}
        {(!players || players.length === 0) && (
          <div className="text-xs text-secondary italic px-2">No data</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* HOME TEAM */}
      <div>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b theme-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.team.logo} className="w-12 h-12 object-contain" alt="" />
          <div>
            <div className="font-bold text-base text-primary">{home.team.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${homeBadge}`}>
                {home.formation}
              </span>
              <span className="text-xs text-secondary">
                Coach: <span className="text-primary font-medium">{home.coach?.name}</span>
              </span>
            </div>
          </div>
        </div>
        {renderList(home.startXI, "Starting XI")}
        {renderList(home.substitutes, "Substitutes")}
      </div>

      {/* AWAY TEAM */}
      <div>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b theme-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={away.team.logo} className="w-12 h-12 object-contain" alt="" />
          <div>
            <div className="font-bold text-base text-primary">{away.team.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${awayBadge}`}>
                {away.formation}
              </span>
              <span className="text-xs text-secondary">
                Coach: <span className="text-primary font-medium">{away.coach?.name}</span>
              </span>
            </div>
          </div>
        </div>
        {renderList(away.startXI, "Starting XI")}
        {renderList(away.substitutes, "Substitutes")}
      </div>
    </div>
  );
}

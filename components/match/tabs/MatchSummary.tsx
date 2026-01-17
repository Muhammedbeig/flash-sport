"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { ArrowLeftRight, Goal, Siren } from "lucide-react";
import Link from "next/link";

type Event = {
  time: { elapsed: number; extra?: number };
  team: { id: number; logo: string; name: string };
  player: { id: number; name: string };
  assist: { id: number; name: string };
  type: string;
  detail: string;
};

export default function MatchSummary({
  events,
  homeId,
  awayId,
  sport = "football",
}: {
  events: Event[];
  homeId: number;
  awayId: number;
  sport?: string;
}) {
  const { theme } = useTheme();

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        No events data available.
      </div>
    );
  }

  const getIcon = (type: string, detail: string) => {
    const size = 16;
    if (type === "Goal") return <Goal size={size} className="text-green-500" />;
    if (type === "Card") {
      if (detail.includes("Yellow")) {
        return <div className="w-3 h-4 bg-yellow-400 rounded-[2px]" />;
      }
      if (detail.includes("Red")) {
        return <div className="w-3 h-4 bg-red-600 rounded-[2px]" />;
      }
    }
    if (type === "subst") {
      return <ArrowLeftRight size={size} className="text-blue-500" />;
    }
    return <Siren size={size} className="text-secondary" />;
  };

  // Player link → open in new tab
  const PlayerLink = ({ player }: { player: { id: number; name: string } }) => {
    if (!player.id) return <span>{player.name}</span>;
    return (
      <Link
        href={`/player?id=${player.id}&sport=${sport}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline hover:text-blue-500 transition-colors cursor-pointer"
      >
        {player.name}
      </Link>
    );
  };

  return (
    <div className="relative py-4">
      {/* Center Line */}
      <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2 z-0 opacity-50" />

      <div className="space-y-6 relative z-10">
        {events.map((ev, i) => {
          const isHome = ev.team.id === homeId;
          const time = `${ev.time.elapsed}${
            ev.time.extra ? `+${ev.time.extra}` : ""
          }'`;

          return (
            <div
              key={i}
              className={`flex items-center w-full ${
                isHome ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`w-[45%] flex ${
                  isHome ? "flex-row-reverse" : "flex-row"
                } items-center gap-4`}
              >
                {/* Event content */}
                <div
                  className={`flex flex-col ${
                    isHome ? "items-end" : "items-start"
                  }`}
                >
                  <div className="text-xs font-bold text-primary flex items-center gap-2">
                    {!isHome && getIcon(ev.type, ev.detail)}
                    <PlayerLink player={ev.player} />
                    {isHome && getIcon(ev.type, ev.detail)}
                  </div>
                  <div className="text-[10px] text-secondary text-muted-foreground capitalize flex gap-1">
                    <span>{ev.detail}</span>
                    {ev.assist.id && (
                      <span className="opacity-75">
                        (Asst: <PlayerLink player={ev.assist} />)
                      </span>
                    )}
                  </div>
                </div>

                {/* Time badge */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold shrink-0 shadow-sm border ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  {time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

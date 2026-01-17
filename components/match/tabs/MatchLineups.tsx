"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { User } from "lucide-react";
import Link from "next/link";

// --- TYPES ---
type Player = {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
};

type Lineup = {
  team: { id: number; name: string; logo: string };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
};

export default function MatchLineups({
  matchId,
  sport,
  widgetTheme,
}: {
  matchId: string | number;
  sport: string;
  widgetTheme: string;
}) {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const matchIdStr = String(matchId);

  useEffect(() => {
    async function fetchLineups() {
      // Lineups API is standardized for Football.
      if (sport !== "football") {
        setLoading(false);
        return;
      }

      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v3.football.api-sports.io";

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl}/fixtures/lineups?fixture=${matchIdStr}`;
        } else {
          url = `https://${host}/fixtures/lineups?fixture=${matchIdStr}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (json.response && json.response.length > 0) {
          setLineups(json.response);
        }
      } catch (err) {
        console.warn("Lineups fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLineups();
  }, [matchIdStr, sport]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lineups.length) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        Lineups not available for this match.
      </div>
    );
  }

  const headerBg = theme === "dark" ? "bg-slate-900/80" : "bg-blue-50";
  const itemHover = theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100";

  return (
    <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {lineups.map((teamLineup, index) => (
          <div key={teamLineup.team?.id || index} className="flex flex-col gap-4">
            {/* Header */}
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border theme-border ${headerBg}`}
            >
              {teamLineup.team?.logo && (
                <img
                  src={teamLineup.team.logo}
                  alt={teamLineup.team.name}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-sm text-primary">
                  {teamLineup.team?.name || "Team"}
                </span>
                <span className="text-[10px] text-secondary font-mono bg-background/50 px-1.5 rounded w-fit">
                  {teamLineup.formation || "-"}
                </span>
              </div>
            </div>

            {/* Coach */}
            {teamLineup.coach && (
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-full">
                  <User size={14} className="text-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground">
                    Coach
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    {teamLineup.coach.name}
                  </span>
                </div>
              </div>
            )}

            {/* Starting XI */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 mb-1">
                Starting XI
              </div>
              {/* FIX: Added ( || [] ) to prevent crash if startXI is undefined */}
              {(teamLineup.startXI || []).map(({ player }) => (
                <Link
                  key={player.id}
                  href={`/player?id=${player.id}&sport=${sport}`}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors ${itemHover} group`}
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                >
                  <span className="w-6 text-xs font-bold text-blue-500 font-mono">
                    {player.number}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-primary group-hover:text-blue-500 transition-colors">
                      {player.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {player.pos}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Substitutes */}
            <div className="space-y-1 mt-2">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 mb-1">
                Substitutes
              </div>
              {/* FIX: Added ( || [] ) to prevent crash if substitutes is undefined */}
              {(teamLineup.substitutes || []).map(({ player }) => (
                <Link
                  key={player.id}
                  href={`/player?id=${player.id}&sport=${sport}`}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors ${itemHover} group`}
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                >
                  <span className="w-6 text-xs font-bold text-secondary font-mono">
                    {player.number}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-secondary group-hover:text-primary transition-colors">
                      {player.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
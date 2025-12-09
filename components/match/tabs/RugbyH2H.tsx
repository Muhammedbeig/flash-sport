"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { RugbyH2HSkeleton } from "@/components/match/skeletons/RugbySkeletons";

// Types
type NormalizedRugbyH2H = {
  id: number;
  date: string;
  status: { short: string; long: string };
  league: { name: string; logo: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  scores: { home: number | null; away: number | null };
};

export default function RugbyH2H({ teamOneId, teamTwoId }: { teamOneId: number; teamTwoId: number }) {
  const { theme } = useTheme();
  const [data, setData] = useState<NormalizedRugbyH2H[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchH2H() {
      if (!teamOneId || !teamTwoId) return;
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.rugby.api-sports.io";
        const url = `https://${host}/games/h2h?h2h=${teamOneId}-${teamTwoId}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        const json = await res.json();

        if (json.response && Array.isArray(json.response)) {
          const normalized: NormalizedRugbyH2H[] = json.response.map((item: any) => {
            const scores = item.scores || {};
            
            // Safe Score Extraction
            let homeTotal: number | null = null;
            if (typeof scores.home === 'number') {
                homeTotal = scores.home;
            } else if (scores.home && typeof scores.home === 'object') {
                homeTotal = scores.home.total ?? null;
            }

            let awayTotal: number | null = null;
            if (typeof scores.away === 'number') {
                awayTotal = scores.away;
            } else if (scores.away && typeof scores.away === 'object') {
                awayTotal = scores.away.total ?? null;
            }

            return {
              id: item.id,
              date: item.date,
              status: item.status,
              league: item.league,
              teams: item.teams,
              scores: { home: homeTotal, away: awayTotal }
            };
          });

          // Sort by date
          normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setData(normalized);
        }
      } catch (err) { console.error("Rugby H2H Error:", err); } 
      finally { setLoading(false); }
    }
    fetchH2H();
  }, [teamOneId, teamTwoId]);

  if (loading) return <RugbyH2HSkeleton />;
  if (!data.length) return <div className="p-8 text-center text-secondary text-sm">No head-to-head data available.</div>;

  return (
    <div className="flex flex-col gap-3 p-4">
      {data.map((match) => {
        const d = new Date(match.date);
        const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString() : "Date Unknown";
        const isDark = theme === 'dark';
        const cardBg = isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100";
        const scoreClass = isDark ? "text-white" : "text-slate-900";
        const winnerClass = "font-bold text-primary";

        return (
          <div key={match.id} className={`flex items-center justify-between p-3 rounded-xl border theme-border ${cardBg}`}>
            <div className="flex flex-col gap-1 w-24 shrink-0 border-r theme-border mr-2">
               <span className="text-[10px] text-secondary font-medium">{dateStr}</span>
               <div className="flex items-center gap-1 opacity-70">
                 {match.league.logo && <img src={match.league.logo} className="w-3 h-3 object-contain" alt=""/>}
                 <span className="text-[9px] text-secondary truncate max-w-full">{match.league.name}</span>
               </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
               <div className="flex justify-between items-center">
                 <span className={`text-xs ${match.teams.home.winner ? winnerClass : "text-secondary"}`}>{match.teams.home.name}</span>
                 <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.home ?? "-"}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className={`text-xs ${match.teams.away.winner ? winnerClass : "text-secondary"}`}>{match.teams.away.name}</span>
                 <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.away ?? "-"}</span>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
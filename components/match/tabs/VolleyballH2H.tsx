"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { VolleyballH2HSkeleton } from "@/components/match/skeletons/VolleyballSkeletons";

// Types
type NormalizedVolleyballH2H = {
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

export default function VolleyballH2H({ teamOneId, teamTwoId }: { teamOneId: number; teamTwoId: number }) {
  const { theme } = useTheme();
  const [data, setData] = useState<NormalizedVolleyballH2H[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchH2H() {
      if (!teamOneId || !teamTwoId) return;
      setLoading(true);
      setError(null);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.volleyball.api-sports.io";
        const url = `https://${host}/games/h2h?h2h=${teamOneId}-${teamTwoId}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        const json = await res.json();
        
        // Error Check
        if (json.errors && Object.keys(json.errors).length > 0) {
            const msg = typeof json.errors === 'object' ? Object.values(json.errors).join(', ') : "Error fetching H2H";
            throw new Error(msg);
        }

        if (json.response && Array.isArray(json.response)) {
          const normalized: NormalizedVolleyballH2H[] = json.response.map((item: any) => {
            const scores = item.scores || {};
            let homeTotal = null;
            if (typeof scores.home === 'number') homeTotal = scores.home;
            else if (scores.home && typeof scores.home === 'object') homeTotal = scores.home.total ?? null;

            let awayTotal = null;
            if (typeof scores.away === 'number') awayTotal = scores.away;
            else if (scores.away && typeof scores.away === 'object') awayTotal = scores.away.total ?? null;

            return {
              id: item.id,
              date: item.date,
              status: item.status,
              league: item.league,
              teams: item.teams,
              scores: { home: homeTotal, away: awayTotal }
            };
          });

          normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setData(normalized);
        }
      } catch (err: any) { 
        console.error("Volleyball H2H Error:", err);
        setError(err.message);
      } finally { 
        setLoading(false); 
      }
    }
    fetchH2H();
  }, [teamOneId, teamTwoId]);

  if (loading) return <VolleyballH2HSkeleton />;
  
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  if (!data.length) return <div className="p-8 text-center text-secondary text-sm">No head-to-head data available.</div>;

  return (
    <div className="flex flex-col gap-3 p-4">
      {data.map((match) => {
        const d = new Date(match.date);
        const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString() : "Date Unknown";
        const isDark = theme === 'dark';
        const cardBg = isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100";
        const scoreClass = isDark ? "text-white" : "text-slate-900";

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
                 <span className="text-xs text-secondary font-bold">{match.teams.home.name}</span>
                 <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.home ?? "-"}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-secondary font-bold">{match.teams.away.name}</span>
                 <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.away ?? "-"}</span>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
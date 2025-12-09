"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { BaseballH2HSkeleton } from "@/components/match/skeletons/BaseballSkeletons";

type H2HGame = {
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

export default function BaseballH2H({ teamOneId, teamTwoId }: { teamOneId: number; teamTwoId: number }) {
  const { theme } = useTheme();
  const [data, setData] = useState<H2HGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchH2H() {
      if (!teamOneId || !teamTwoId) return;

      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        // CRITICAL: Baseball Host
        const host = "v1.baseball.api-sports.io"; 
        
        // API DOCS: Endpoint is /games/h2h
        const url = `https://${host}/games/h2h?h2h=${teamOneId}-${teamTwoId}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });

        const json = await res.json();

        if (json.response && Array.isArray(json.response)) {
          const normalized = json.response.map((item: any) => {
            const scores = item.scores || {};
            // Baseball scores are typically direct values or nested in total
            let homeTotal = typeof scores.home === 'object' ? scores.home.total : scores.home;
            let awayTotal = typeof scores.away === 'object' ? scores.away.total : scores.away;

            return {
              id: item.id,
              date: item.date,
              status: item.status,
              league: item.league,
              teams: item.teams,
              scores: { home: homeTotal ?? null, away: awayTotal ?? null }
            };
          });

          // Sort by date (Newest first)
          normalized.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setData(normalized);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Baseball H2H Error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchH2H();
  }, [teamOneId, teamTwoId]);

  if (loading) return <BaseballH2HSkeleton />;
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
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${match.teams.home.winner ? winnerClass : "text-secondary"}`}>{match.teams.home.name}</span>
                </div>
                <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.home ?? "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${match.teams.away.winner ? winnerClass : "text-secondary"}`}>{match.teams.away.name}</span>
                </div>
                <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.away ?? "-"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
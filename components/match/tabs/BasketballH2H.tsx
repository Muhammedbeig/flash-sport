"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { BasketballH2HSkeleton } from "@/components/match/skeletons/BasketballSkeletons";

type H2HGame = {
  id: number;
  date: string;
  status: { short: string; long: string };
  league: { name: string; logo: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  scores: {
    home: number | null;
    away: number | null;
  };
};

export default function BasketballH2H({ teamOneId, teamTwoId }: { teamOneId: number; teamTwoId: number; }) {
  const { theme } = useTheme();
  const [data, setData] = useState<H2HGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchH2H() {
      if (!teamOneId || !teamTwoId) return;

      setLoading(true);
      try {
        const cdnBasketball = process.env.NEXT_PUBLIC_CDN_BASKETBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const h2hParam = `${teamOneId}-${teamTwoId}`;
        const host = "v1.basketball.api-sports.io";

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnBasketball) {
          url = `${cdnBasketball.replace(/\/$/, "")}/games?h2h=${h2hParam}`;
        } else {
          url = `https://${host}/games?h2h=${h2hParam}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (json.response && Array.isArray(json.response)) {
          const normalized = json.response.map((item: any) => {
            const scores = item.scores || {};
            let homeTotal = null;
            let awayTotal = null;

            // Normalize scores: sometimes object {total: 100}, sometimes number 100
            if (scores.home !== null && typeof scores.home === 'object') {
              homeTotal = scores.home.total ?? null;
            } else {
              homeTotal = scores.home ?? null;
            }

            if (scores.away !== null && typeof scores.away === 'object') {
              awayTotal = scores.away.total ?? null;
            } else {
              awayTotal = scores.away ?? null;
            }

            return {
              id: item.id,
              date: item.date,
              status: { short: item.status?.short, long: item.status?.long },
              league: item.league,
              teams: item.teams,
              scores: { home: homeTotal, away: awayTotal }
            };
          });

          normalized.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setData(normalized);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Basketball H2H Error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchH2H();
  }, [teamOneId, teamTwoId]);

  if (loading) return <BasketballH2HSkeleton />;

  if (data.length === 0) {
    return <div className="p-8 text-center text-secondary text-sm">No head-to-head data available.</div>;
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {data.map((match) => {
        const date = new Date(match.date).toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        const isDark = theme === 'dark';
        const cardBg = isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100";
        const scoreClass = isDark ? "text-white" : "text-slate-900";
        const winnerClass = "font-bold text-primary";

        return (
          <div key={match.id} className={`flex items-center justify-between p-3 rounded-xl border theme-border ${cardBg}`}>
            <div className="flex flex-col gap-1 w-20 shrink-0 border-r theme-border mr-2">
              <span className="text-[10px] text-secondary font-medium">{date}</span>
              <div className="flex items-center gap-1 opacity-70">
                 {match.league.logo && <img src={match.league.logo} className="w-3 h-3 object-contain"/>}
                 <span className="text-[9px] text-secondary truncate max-w-full">{match.league.name}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={match.teams.home.logo} className="w-5 h-5 object-contain" alt="" />
                  <span className={`text-xs ${match.teams.home.winner ? winnerClass : "text-secondary"}`}>
                    {match.teams.home.name}
                  </span>
                </div>
                <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.home ?? "-"}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={match.teams.away.logo} className="w-5 h-5 object-contain" alt="" />
                  <span className={`text-xs ${match.teams.away.winner ? winnerClass : "text-secondary"}`}>
                    {match.teams.away.name}
                  </span>
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
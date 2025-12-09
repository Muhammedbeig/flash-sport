"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { FootballH2HSkeleton } from "@/components/match/skeletons/FootballSkeletons";

type FootballH2HMatch = {
  fixture: { id: number; date: string; timestamp: number };
  teams: { 
    home: { id: number; name: string; logo: string; winner: boolean | null }; 
    away: { id: number; name: string; logo: string; winner: boolean | null }; 
  };
  goals: { home: number | null; away: number | null };
  league: { name: string; logo: string; season: number };
};

export default function FootballH2H({ teamOneId, teamTwoId }: { teamOneId: number; teamTwoId: number }) {
  const { theme } = useTheme();
  const [data, setData] = useState<FootballH2HMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchH2H() {
      if (!teamOneId || !teamTwoId) return;
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v3.football.api-sports.io";
        // Correct Endpoint: /fixtures/headtohead
        const url = `https://${host}/fixtures/headtohead?h2h=${teamOneId}-${teamTwoId}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        const json = await res.json();

        if (json.response && Array.isArray(json.response)) {
            // Sort: Newest first
            const sorted = json.response.sort((a: any, b: any) => b.fixture.timestamp - a.fixture.timestamp);
            setData(sorted);
        }
      } catch (err) { console.error("Football H2H Error:", err); } 
      finally { setLoading(false); }
    }
    fetchH2H();
  }, [teamOneId, teamTwoId]);

  if (loading) return <FootballH2HSkeleton />;
  if (!data.length) return <div className="p-8 text-center text-secondary text-sm">No head-to-head data available.</div>;

  return (
    <div className="flex flex-col gap-3 p-4">
      {data.map((match) => {
        const d = new Date(match.fixture.date);
        const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString() : "Date Unknown";
        const isDark = theme === 'dark';
        const cardBg = isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100";
        const winnerClass = "font-bold text-primary";

        return (
          <div key={match.fixture.id} className={`flex items-center justify-between p-3 rounded-xl border theme-border ${cardBg}`}>
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
                 <span className="text-xs font-bold text-primary">{match.goals.home ?? "-"}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className={`text-xs ${match.teams.away.winner ? winnerClass : "text-secondary"}`}>{match.teams.away.name}</span>
                 <span className="text-xs font-bold text-primary">{match.goals.away ?? "-"}</span>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HockeyH2HSkeleton } from "@/components/match/skeletons/HockeySkeletons";

// --- TYPES ---
// Allows flexibility for API returning numbers OR objects OR null
type RawScore = number | null | { total?: number | null };

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

export default function HockeyH2H({ teamOneId, teamTwoId }: { teamOneId: number; teamTwoId: number }) {
  const { theme } = useTheme();
  const [data, setData] = useState<H2HGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchH2H() {
      if (!teamOneId || !teamTwoId) return;

      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.hockey.api-sports.io";
        const url = `https://${host}/games/h2h?h2h=${teamOneId}-${teamTwoId}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        
        const json = await res.json();

        if (json.response && Array.isArray(json.response)) {
          // Normalize Data safely
          const normalized: H2HGame[] = json.response.map((item: any) => {
            const rawScores = item.scores || {};
            
            // Safe Score Extraction
            let homeScore: number | null = null;
            let awayScore: number | null = null;

            // Handle 'home'
            if (typeof rawScores.home === 'number') {
                homeScore = rawScores.home;
            } else if (rawScores.home && typeof rawScores.home === 'object') {
                homeScore = rawScores.home.total ?? null;
            }

            // Handle 'away'
            if (typeof rawScores.away === 'number') {
                awayScore = rawScores.away;
            } else if (rawScores.away && typeof rawScores.away === 'object') {
                awayScore = rawScores.away.total ?? null;
            }

            return {
              id: item.id,
              date: item.date,
              status: { 
                short: item.status?.short || "NS", 
                long: item.status?.long || "Not Started" 
              },
              league: {
                name: item.league?.name || "Unknown",
                logo: item.league?.logo || "",
                season: item.league?.season || 0
              },
              teams: {
                home: { 
                    id: item.teams?.home?.id, 
                    name: item.teams?.home?.name || "Home", 
                    logo: item.teams?.home?.logo || "", 
                    winner: item.teams?.home?.winner ?? null 
                },
                away: { 
                    id: item.teams?.away?.id, 
                    name: item.teams?.away?.name || "Away", 
                    logo: item.teams?.away?.logo || "", 
                    winner: item.teams?.away?.winner ?? null 
                }
              },
              scores: { home: homeScore, away: awayScore }
            };
          });

          // Sort by Date
          normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setData(normalized);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Hockey H2H Error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchH2H();
  }, [teamOneId, teamTwoId]);

  if (loading) return <HockeyH2HSkeleton />;

  if (data.length === 0) {
    return <div className="p-8 text-center text-secondary text-sm">No head-to-head data available.</div>;
  }

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
            {/* Date & League */}
            <div className="flex flex-col gap-1 w-24 shrink-0 border-r theme-border mr-2">
               <span className="text-[10px] text-secondary font-medium">{dateStr}</span>
               <div className="flex items-center gap-1 opacity-70">
                 {match.league.logo && <img src={match.league.logo} className="w-3 h-3 object-contain" alt=""/>}
                 <span className="text-[9px] text-secondary truncate max-w-full">{match.league.name}</span>
               </div>
            </div>

            {/* Teams & Score */}
            <div className="flex-1 flex flex-col gap-2">
               {/* Home */}
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <img src={match.teams.home.logo} className="w-5 h-5 object-contain" alt=""/>
                   <span className={`text-xs ${match.teams.home.winner ? winnerClass : "text-secondary"}`}>
                     {match.teams.home.name}
                   </span>
                 </div>
                 <span className={`text-xs font-bold ${scoreClass}`}>{match.scores.home ?? "-"}</span>
               </div>

               {/* Away */}
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <img src={match.teams.away.logo} className="w-5 h-5 object-contain" alt=""/>
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
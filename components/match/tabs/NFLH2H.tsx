"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { NFLH2HSkeleton } from "@/components/match/skeletons/NFLSkeletons";

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

export default function NFLH2H({
  teamOneId,
  teamTwoId,
}: {
  teamOneId: number;
  teamTwoId: number;
}) {
  const { theme } = useTheme();
  const [data, setData] = useState<H2HGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchH2H() {
      if (!teamOneId || !teamTwoId) return;

      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.american-football.api-sports.io";
        const h2hParam = `${teamOneId}-${teamTwoId}`;

        // NFL uses 'games' endpoint with 'h2h' parameter
        const url = `https://${host}/games?h2h=${h2hParam}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" },
        });

        const json = await res.json();

        if (json.response && Array.isArray(json.response)) {
          const normalized = json.response.map((item: any) => {
            // FIX: Robust extraction of Game Object
            // Sometimes it's { game: {...}, league: {...} }
            // Sometimes it's flat { id:..., date:..., league: {...} }
            const game = item.game || item;
            const league = item.league || {};
            const teams = item.teams || {};
            const scores = item.scores || {};

            // FIX: Robust Date Extraction
            const dateStr = game.date || item.date;

            // Extract scores (handle objects vs numbers)
            let homeTotal = null;
            let awayTotal = null;

            if (scores.home !== null) {
              homeTotal = typeof scores.home === "object" ? scores.home.total : scores.home;
            }
            if (scores.away !== null) {
              awayTotal = typeof scores.away === "object" ? scores.away.total : scores.away;
            }

            return {
              id: game.id,
              date: dateStr,
              status: { short: game.status?.short, long: game.status?.long },
              league: {
                name: league.name,
                logo: league.logo,
                season: league.season,
              },
              teams: {
                home: teams.home,
                away: teams.away,
              },
              scores: { home: homeTotal ?? null, away: awayTotal ?? null },
            };
          });

          // Sort by date desc
          normalized.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setData(normalized);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("NFL H2H Error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchH2H();
  }, [teamOneId, teamTwoId]);

  if (loading) return <NFLH2HSkeleton />;

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        No head-to-head data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {data.map((match) => {
        // Safe date formatting
        const d = new Date(match.date);
        const dateDisplay = !isNaN(d.getTime()) 
            ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            : "Unknown Date";
            
        const isDark = theme === "dark";
        const cardBg = isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100";
        const scoreClass = isDark ? "text-white" : "text-slate-900";
        const winnerClass = "font-bold text-primary";

        return (
          <div
            key={match.id}
            className={`flex items-center justify-between p-3 rounded-xl border theme-border ${cardBg}`}
          >
            {/* Date & League */}
            <div className="flex flex-col gap-1 w-24 shrink-0 border-r theme-border mr-2">
              <span className="text-[10px] text-secondary font-medium">
                {dateDisplay}
              </span>
              <div className="flex items-center gap-1 opacity-70">
                {match.league.logo && (
                  <img
                    src={match.league.logo}
                    className="w-3 h-3 object-contain"
                    alt="League"
                  />
                )}
                <span className="text-[9px] text-secondary truncate max-w-full">
                  {match.league.name}
                </span>
              </div>
            </div>

            {/* Teams & Score */}
            <div className="flex-1 flex flex-col gap-2">
              {/* Home */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={match.teams.home.logo}
                    className="w-5 h-5 object-contain"
                    alt=""
                  />
                  <span
                    className={`text-xs ${
                      match.teams.home.winner ? winnerClass : "text-secondary"
                    }`}
                  >
                    {match.teams.home.name}
                  </span>
                </div>
                <span className={`text-xs font-bold ${scoreClass}`}>
                  {match.scores.home ?? "-"}
                </span>
              </div>

              {/* Away */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={match.teams.away.logo}
                    className="w-5 h-5 object-contain"
                    alt=""
                  />
                  <span
                    className={`text-xs ${
                      match.teams.away.winner ? winnerClass : "text-secondary"
                    }`}
                  >
                    {match.teams.away.name}
                  </span>
                </div>
                <span className={`text-xs font-bold ${scoreClass}`}>
                  {match.scores.away ?? "-"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
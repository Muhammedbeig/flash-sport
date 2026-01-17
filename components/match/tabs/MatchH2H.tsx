"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";

type H2HFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: {
    name: string;
    logo: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

export default function MatchH2H({
  teamOneId,
  teamTwoId,
  sport,
}: {
  teamOneId: number;
  teamTwoId: number;
  sport: string;
}) {
  const { theme } = useTheme();
  const [data, setData] = useState<H2HFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchH2H() {
      // H2H is typically a Football feature in API-Sports V3 standard
      // For other sports, the endpoint might differ or not exist in the same format.
      // We'll proceed assuming Football or similar structure.
      if (!teamOneId || !teamTwoId) return;

      setLoading(true);
      setError(false);

      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const h2hParam = `${teamOneId}-${teamTwoId}`;
        
        // Hosts mapping (reused from widget config for consistency)
        const hostMap: Record<string, string> = {
          football: "v3.football.api-sports.io",
          nba: "v1.basketball.api-sports.io",
          // Add others if your plan supports H2H for them
        };
        const apiHost = hostMap[sport] || hostMap.football;

        let url = "";
        let headers: Record<string, string> = {};

        if (sport === "football" && cdnUrl) {
          url = `${cdnUrl}/fixtures/headtohead?h2h=${h2hParam}`;
        } else {
          if (!apiKey) throw new Error("No API Key");
          // Note: "games/h2h" for some sports, "fixtures/headtohead" for football.
          // Adjusting for Football default here based on your main usage.
          const endpoint = sport === "football" ? "fixtures/headtohead" : "games/h2h";
          url = `https://${apiHost}/${endpoint}?h2h=${h2hParam}`;
          headers = { "x-rapidapi-host": apiHost, "x-rapidapi-key": apiKey };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (json.response && Array.isArray(json.response)) {
          // Sort by date desc
          const sorted = json.response.sort((a: any, b: any) => 
            new Date(b.fixture?.date || b.date).getTime() - new Date(a.fixture?.date || a.date).getTime()
          );
          setData(sorted);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("H2H Fetch Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchH2H();
  }, [teamOneId, teamTwoId, sport]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        No head-to-head data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {data.map((match) => {
        // Normalize data structure if different sports use different keys
        // (Football uses 'fixture', others might use 'game')
        const meta = match.fixture || (match as any).game;
        const date = new Date(meta.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        // Styles
        const cardBg = theme === 'dark' ? "bg-slate-900/50" : "bg-slate-50";
        const scoreClass = theme === 'dark' ? "text-white" : "text-slate-900";
        const winnerClass = "font-bold";

        return (
          <div 
            key={meta.id} 
            className={`flex items-center justify-between p-3 rounded-xl border theme-border ${cardBg}`}
          >
            {/* Date & League */}
            <div className="flex flex-col gap-1 w-20 shrink-0 border-r theme-border mr-2">
              <span className="text-[10px] text-secondary font-medium">{date}</span>
              <div className="flex items-center gap-1 opacity-70">
                 {match.league.logo && <img src={match.league.logo} className="w-3 h-3 object-contain"/>}
                 <span className="text-[9px] text-secondary truncate max-w-full">{match.league.name}</span>
              </div>
            </div>

            {/* Teams & Score */}
            <div className="flex-1 flex flex-col gap-2">
              {/* Home */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={match.teams.home.logo} className="w-5 h-5 object-contain" alt="" />
                  <span className={`text-xs ${match.teams.home.winner ? winnerClass : "text-secondary"}`}>
                    {match.teams.home.name}
                  </span>
                </div>
                <span className={`text-xs font-bold ${scoreClass}`}>
                  {match.goals.home ?? (match as any).scores?.home?.total ?? "-"}
                </span>
              </div>

              {/* Away */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={match.teams.away.logo} className="w-5 h-5 object-contain" alt="" />
                  <span className={`text-xs ${match.teams.away.winner ? winnerClass : "text-secondary"}`}>
                    {match.teams.away.name}
                  </span>
                </div>
                <span className={`text-xs font-bold ${scoreClass}`}>
                  {match.goals.away ?? (match as any).scores?.away?.total ?? "-"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";

// Types for Odds Response
type OddValue = {
  value: string;
  odd: string;
};

type Bookmaker = {
  id: number;
  name: string;
  bets: {
    id: number;
    name: string;
    values: OddValue[];
  }[];
};

export default function BaseballOdds({ matchId }: { matchId: string }) {
  const { theme } = useTheme();
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    let isMounted = true;

    async function fetchOdds() {
      if (!matchId) return;

      setLoading(true);
      setError(null);

      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.baseball.api-sports.io";
        
        // API DOCS: https://v1.baseball.api-sports.io/odds?game={game_id}
        const url = `https://${host}/odds?game=${matchId}`;

        const res = await fetch(url, {
          headers: { 
            "x-rapidapi-host": host, 
            "x-rapidapi-key": apiKey || "" 
          }
        });

        if (!res.ok) {
           throw new Error(`API Error: ${res.status}`);
        }

        const json = await res.json();
        
        if (!isMounted) return;

        // Check specifically for the 'bookmakers' array inside the first response item
        const data = json.response?.[0]?.bookmakers || [];
        
        setBookmakers(data);

      } catch (err) {
        console.error("Baseball Odds Error:", err);
        if (isMounted) setError("Failed to load odds.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOdds();

    return () => { isMounted = false; };
  }, [matchId]);

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Handle "No Data" specifically for the 7-day limit
  if (!bookmakers.length) {
    return (
      <div className="p-8 text-center text-secondary text-sm flex flex-col gap-2 items-center">
        <span>No odds available for this match.</span>
        <span className="text-xs opacity-60 max-w-xs">
          Note: Odds history is limited to 7 days after the match ends.
        </span>
        {error && <span className="text-red-500 text-xs mt-2">Error: {error}</span>}
      </div>
    );
  }

  // Use the first available bookmaker (usually the most comprehensive one provided by the API)
  const activeBookmaker = bookmakers[0];

  return (
    <div className="p-4 space-y-6">
      {/* Bookmaker Header */}
      <div className="flex items-center justify-between border-b theme-border pb-2 mb-4">
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold uppercase text-secondary tracking-wider">
             Bookmaker
           </span>
           <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-800"}`}>
             {activeBookmaker.name}
           </span>
        </div>
      </div>

      {/* Bets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeBookmaker.bets.map((bet) => (
          <div 
            key={bet.id} 
            className="theme-bg border theme-border rounded-lg p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <h4 className="text-xs font-bold text-primary mb-3 uppercase tracking-wide">
                {bet.name}
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {bet.values.map((val, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between rounded px-3 py-2 flex-1 min-w-[100px] border theme-border ${
                    isDark ? "bg-slate-800/50" : "bg-slate-50"
                  }`}
                >
                  <span className="text-[11px] text-secondary truncate mr-2 font-medium">
                    {val.value}
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {val.odd}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HockeyOddsSkeleton } from "@/components/match/skeletons/HockeySkeletons";

type SimpleBookmaker = {
  id: number;
  name: string;
  bets: any[];
};

export default function HockeyOdds({ matchId }: { matchId: string }) {
  const { theme } = useTheme();
  const [bookmakers, setBookmakers] = useState<SimpleBookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    async function fetchOdds() {
      if (!matchId) return;
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.hockey.api-sports.io";
        
        const res = await fetch(`https://${host}/odds?game=${matchId}`, { 
            headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" } 
        });
        const json = await res.json();
        
        const data = json.response?.[0]?.bookmakers || [];
        setBookmakers(data);
        
      } catch (e) { 
        console.error("Hockey Odds Error:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchOdds();
  }, [matchId]);

  if (loading) return <HockeyOddsSkeleton />;
  if (!bookmakers.length) return <div className="p-8 text-center text-secondary text-sm">No odds available.</div>;

  const activeBookmaker = bookmakers[0];
  
  // Logic: First 3 or All
  const displayedBets = showAll ? activeBookmaker.bets : activeBookmaker.bets.slice(0, 3);
  const hasMore = activeBookmaker.bets.length > 3;

  return (
    <div className="p-4 space-y-6">
      <div className="border-b theme-border pb-2 mb-4 text-xs font-bold uppercase text-secondary flex justify-between">
        <span>Bookmaker: {activeBookmaker.name}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedBets?.map((bet: any, betIdx: number) => (
          <div 
            key={`bet-${bet.id}-${betIdx}`} 
            className="theme-bg border theme-border rounded-lg p-3 shadow-sm"
          >
            <h4 className="text-xs font-bold text-primary mb-3">{bet.name}</h4>
            <div className="flex flex-wrap gap-2">
              {bet.values?.map((val: any, valIdx: number) => (
                <div 
                  key={`val-${bet.id}-${valIdx}-${val.value}`} 
                  className={`flex items-center justify-between rounded px-3 py-2 flex-1 min-w-[80px] border theme-border ${
                    isDark ? 'bg-slate-800' : 'bg-slate-50'
                  }`}
                >
                  <span className="text-[11px] text-secondary truncate mr-2">{val.value}</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{val.odd}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Show More / Less Toggle */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              isDark 
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {showAll ? (
              <>Show Less <ChevronUp size={14} /></>
            ) : (
              <>See More ({activeBookmaker.bets.length - 3}) <ChevronDown size={14} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
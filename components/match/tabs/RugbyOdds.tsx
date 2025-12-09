"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RugbyOddsSkeleton } from "@/components/match/skeletons/RugbySkeletons";

type OddValue = { value: string; odd: string };
type Bet = { id: number; name: string; values: OddValue[] };
type Bookmaker = { id: number; name: string; bets: Bet[] };

export default function RugbyOdds({ matchId }: { matchId: string }) {
  const { theme } = useTheme();
  const [odds, setOdds] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // Toggle State

  const isDark = theme === 'dark';

  useEffect(() => {
    async function fetchOdds() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.rugby.api-sports.io";
        const res = await fetch(`https://${host}/odds?game=${matchId}`, { headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" } });
        const json = await res.json();
        setOdds(json.response?.[0]?.bookmakers || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    if (matchId) fetchOdds();
  }, [matchId]);

  if (loading) return <RugbyOddsSkeleton />;
  if (!odds.length) return <div className="p-8 text-center text-secondary text-sm">No odds available.</div>;

  const activeBookmaker = odds[0];
  const displayedBets = showAll ? activeBookmaker.bets : activeBookmaker.bets.slice(0, 3);
  const hasMore = activeBookmaker.bets.length > 3;

  return (
    <div className="p-4 space-y-6">
      <div className="border-b theme-border pb-2 mb-4 text-xs font-bold uppercase text-secondary">Bookmaker: {activeBookmaker.name}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedBets.map((bet, betIdx) => (
          <div key={`${bet.id}-${betIdx}`} className="theme-bg border theme-border rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-bold text-primary mb-3">{bet.name}</h4>
            <div className="flex flex-wrap gap-2">
              {bet.values.map((val, valIdx) => (
                <div key={`${val.value}-${valIdx}`} className={`flex items-center justify-between rounded px-3 py-2 flex-1 min-w-[80px] border theme-border ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <span className="text-[11px] text-secondary truncate mr-2">{val.value}</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{val.odd}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
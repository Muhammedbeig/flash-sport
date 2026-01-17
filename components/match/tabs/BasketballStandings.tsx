"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { BasketballStandingsSkeleton } from "@/components/match/skeletons/BasketballSkeletons";

// --- TYPES BASED ON BASKETBALL API ---
type StandingRow = {
  position: number;
  stage: string;
  group: { name: string; points?: number }; 
  team: { id: number; name: string; logo: string };
  games: { 
    played: number; 
    win: { total: number; percentage: string }; 
    lose: { total: number; percentage: string }; 
  };
  points: { for: number; against: number };
  description?: string;
};

type StandingsGroup = {
  name: string; 
  rows: StandingRow[];
};

export default function BasketballStandings({ leagueId, season }: { leagueId: number, season: string | number }) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<StandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<string | number>(season);

  const isDark = theme === "dark";

  useEffect(() => {
    let isMounted = true;

    async function fetchStandings() {
      if (!leagueId || !season) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.basketball.api-sports.io";
        
        // 1. Initial Attempt: Fetch the requested season
        let targetSeason = season;
        let url = `https://${host}/standings?league=${leagueId}&season=${targetSeason}`;
        
        let res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        
        let json = await res.json();
        
        // 2. Fallback Logic for Free Tier restrictions
        if ((!json.response || json.results === 0) && (String(targetSeason).includes("2024") || String(targetSeason).includes("2025"))) {
             console.warn(`Basketball Standings: No data for ${targetSeason}. Falling back to 2021-2022.`);
             targetSeason = "2021-2022";
             url = `https://${host}/standings?league=${leagueId}&season=${targetSeason}`;
             
             res = await fetch(url, {
               headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
             });
             json = await res.json();
             
             if (isMounted) setActiveSeason(targetSeason);
        }
        
        if (!isMounted) return;

        // --- 3. Parse Response ---
        const responseData = json.response || [];
        const parsedGroups: StandingsGroup[] = [];
        
        if (Array.isArray(responseData)) {
            // Check if it's a nested array (Standard API-Sports Basketball format)
            if (responseData.length > 0 && Array.isArray(responseData[0])) {
                responseData.forEach((groupData: any, index: number) => {
                    if (Array.isArray(groupData) && groupData.length > 0) {
                        const firstRow = groupData[0];
                        const groupName = firstRow.group?.name || firstRow.stage || `Group ${index + 1}`;
                        
                        parsedGroups.push({
                            name: groupName,
                            rows: groupData.sort((a: StandingRow, b: StandingRow) => a.position - b.position)
                        });
                    }
                });
            } 
            // Handle Flat Array case
            else if (responseData.length > 0 && responseData[0].team) {
                 parsedGroups.push({
                    name: "League Table",
                    rows: responseData
                 });
            }
        }

        parsedGroups.sort((a, b) => a.name.localeCompare(b.name));
        setGroups(parsedGroups);
      } catch (err) {
        console.error("Basketball Standings Error:", err);
        if (isMounted) setError("Failed to load standings.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchStandings();
    
    return () => { isMounted = false; };
  }, [leagueId, season]);

  // --- LOADING STATE ---
  if (loading) return <BasketballStandingsSkeleton />;
  
  if (error || !groups.length) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        {error || `No standings data found for Season ${season}.`}
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="p-4 space-y-8">
      {String(activeSeason) !== String(season) && (
        <div className="flex justify-end px-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-secondary opacity-60">
             Historical Data ({activeSeason})
           </span>
        </div>
      )}

      {groups.map((group, idx) => (
        <div key={idx} className="space-y-3">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest px-2 border-b theme-border pb-2">
            {group.name}
          </h3>
          
          <div className="overflow-x-auto theme-bg rounded-xl border theme-border">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b theme-border ${isDark ? "bg-slate-900/40 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
                  <th className="p-3 w-10 text-center font-bold">#</th>
                  <th className="p-3 font-bold">Team</th>
                  <th className="p-3 text-center font-bold">GP</th>
                  <th className="p-3 text-center font-bold">W</th>
                  <th className="p-3 text-center font-bold">L</th>
                  <th className="p-3 text-center font-bold">%</th>
                  <th className="p-3 text-center font-bold hidden sm:table-cell">Diff</th>
                </tr>
              </thead>
              <tbody className="font-medium text-primary">
                {/* FIX: Added index 'i' and composed key */}
                {group.rows.map((row, i) => {
                  const diff = (row.points?.for || 0) - (row.points?.against || 0);
                  
                  return (
                    <tr 
                      key={`${row.team.id}-${i}`} // UNIQUE KEY COMPOSITION
                      className={`border-b last:border-0 theme-border transition-colors ${
                        isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="p-3 text-center">{row.position}</td>
                      <td className="p-3 flex items-center gap-3">
                        <img src={row.team.logo} alt="" className="w-5 h-5 object-contain" />
                        <span className="truncate font-semibold">{row.team.name}</span>
                      </td>
                      <td className="p-3 text-center text-secondary">{row.games.played}</td>
                      <td className="p-3 text-center text-green-600 dark:text-green-400 font-bold">{row.games.win.total}</td>
                      <td className="p-3 text-center text-red-500 dark:text-red-400 font-bold">{row.games.lose.total}</td>
                      <td className="p-3 text-center text-secondary">{row.games.win.percentage}</td>
                      <td className={`p-3 text-center font-bold hidden sm:table-cell ${
                          diff > 0 
                            ? "text-green-600 dark:text-green-400" 
                            : diff < 0 
                            ? "text-red-500 dark:text-red-400" 
                            : "text-secondary"
                      }`}>
                          {diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
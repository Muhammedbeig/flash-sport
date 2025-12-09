"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HockeyStandingsSkeleton } from "@/components/match/skeletons/HockeySkeletons";

// --- LOOSE TYPES TO PREVENT ERRORS ---
// We use 'any' for the nested stats because the API is inconsistent
type HockeyRow = {
  position: number;
  team: { id: number; name: string; logo: string };
  games: any; // Relaxed type
  goals: any; // Relaxed type
  points: number;
  groupName: string;
};

type StandingsGroup = { name: string; rows: HockeyRow[] };

export default function HockeyStandings({ leagueId, teamId }: { leagueId: number, teamId?: number }) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<StandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  const activeSeason = 2022; 

  useEffect(() => {
    async function fetchStandings() {
      if (!leagueId) { setLoading(false); return; }
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.hockey.api-sports.io";
        
        const url = `https://${host}/standings?league=${leagueId}&season=${activeSeason}`;
        
        const res = await fetch(url, { headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" } });
        const json = await res.json();
        
        const responseData = json.response || [];
        const parsed: StandingsGroup[] = [];
        
        if (Array.isArray(responseData)) {
           responseData.forEach((groupData: any, idx: number) => {
              // Ensure groupData is an array before mapping
              if (Array.isArray(groupData) && groupData.length > 0) {
                 const first = groupData[0];
                 const name = first.group?.name || first.stage || `Group ${idx + 1}`;
                 
                 // Map raw data to our clean type safely
                 const cleanRows: HockeyRow[] = groupData.map((r: any) => ({
                    position: r.position,
                    team: r.team,
                    games: r.games,
                    goals: r.goals,
                    points: r.points,
                    groupName: name
                 }));

                 parsed.push({ name, rows: cleanRows });
              }
           });
        }
        setGroups(parsed);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchStandings();
  }, [leagueId]);

  // Helper to safely get a number from "5" or "{ total: 5 }"
  const getStat = (obj: any): number => {
      if (typeof obj === 'number') return obj;
      if (typeof obj === 'object' && obj !== null && typeof obj.total === 'number') return obj.total;
      return 0;
  };

  if (loading) return <HockeyStandingsSkeleton />;
  if (!groups.length) return <div className="p-8 text-center text-secondary text-sm">No standings available.</div>;

  return (
    <div className="p-4 space-y-8">
      {groups.map((group, groupIdx) => (
        <div key={`${group.name}-${groupIdx}`} className="space-y-3">
          <h3 className="text-xs font-bold text-secondary uppercase border-b theme-border pb-2 px-1">{group.name}</h3>
          
          <div className="overflow-x-auto theme-bg rounded-xl border theme-border">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b theme-border text-secondary ${isDark ? "bg-slate-900/40" : "bg-slate-50"}`}>
                  <th className="p-3 font-bold w-10 text-center">#</th>
                  <th className="p-3 font-bold">Team</th>
                  <th className="p-3 font-bold text-center">GP</th>
                  <th className="p-3 font-bold text-center">W</th>
                  <th className="p-3 font-bold text-center">L</th>
                  <th className="p-3 font-bold text-center hidden sm:table-cell">GF</th>
                  <th className="p-3 font-bold text-center hidden sm:table-cell">GA</th>
                  <th className="p-3 font-bold text-center hidden sm:table-cell">Diff</th>
                  <th className="p-3 font-bold text-center">PTS</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, rowIdx) => {
                  const goalsFor = getStat(row.goals?.for);
                  const goalsAgainst = getStat(row.goals?.against);
                  const diff = goalsFor - goalsAgainst;
                  const isActive = row.team.id === teamId;
                  
                  return (
                    <tr 
                      // FIX: Safe composite key using index as fallback
                      key={`${group.name}-${row.team.id}-${rowIdx}`} 
                      className={`border-b last:border-0 theme-border transition-colors ${
                        isActive 
                          ? (isDark ? "bg-blue-900/20" : "bg-blue-50") 
                          : (isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50")
                      }`}
                    >
                      <td className="p-3 text-center text-secondary font-medium">{row.position}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                            {row.team.logo && <img src={row.team.logo} className="w-5 h-5 object-contain" alt={row.team.name}/>}
                            <span className={`font-bold ${isActive ? "text-primary" : "text-secondary"}`}>{row.team.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-secondary">{getStat(row.games?.played)}</td>
                      <td className="p-3 text-center text-green-500 font-bold">{getStat(row.games?.win)}</td>
                      <td className="p-3 text-center text-red-500 font-bold">{getStat(row.games?.lose)}</td>
                      
                      <td className="p-3 text-center text-secondary hidden sm:table-cell">{goalsFor}</td>
                      <td className="p-3 text-center text-secondary hidden sm:table-cell">{goalsAgainst}</td>
                      <td className={`p-3 text-center font-bold hidden sm:table-cell ${diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-secondary"}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      
                      <td className="p-3 text-center font-bold text-primary">{row.points}</td>
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
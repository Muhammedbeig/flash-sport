"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { RugbyStandingsSkeleton } from "@/components/match/skeletons/RugbySkeletons";

// --- TYPES ---
type RugbyRow = {
  position: number;
  stage: string;
  group: { name: string };
  team: { id: number; name: string; logo: string };
  games: { played: number; win: { total: number }; lose: { total: number }; draw: { total: number } };
  points: number;
  goals: { for: number; against: number };
  description?: string;
};

type StandingsGroup = { name: string; rows: RugbyRow[] };

export default function RugbyStandings({ leagueId, teamId }: { leagueId: number, teamId?: number }) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<StandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  // Force Historical Season (2022) for Free Tier compliance
  const activeSeason = 2022; 

  useEffect(() => {
    async function fetchStandings() {
      if (!leagueId) { setLoading(false); return; }
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.rugby.api-sports.io";
        
        // Fetching historical data
        const url = `https://${host}/standings?league=${leagueId}&season=${activeSeason}`;
        
        const res = await fetch(url, { headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" } });
        const json = await res.json();
        
        const responseData = json.response || [];
        const parsed: StandingsGroup[] = [];
        
        // Rugby API structure is Array of Arrays
        if (Array.isArray(responseData)) {
           responseData.forEach((groupData: any, idx) => {
              if (Array.isArray(groupData) && groupData.length > 0) {
                 const first = groupData[0];
                 const name = first.group?.name || first.stage || `Group ${idx + 1}`;
                 parsed.push({ name, rows: groupData });
              }
           });
        }
        setGroups(parsed);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchStandings();
  }, [leagueId]);

  if (loading) return <RugbyStandingsSkeleton />;
  if (!groups.length) return <div className="p-8 text-center text-secondary text-sm">No standings available for {activeSeason}.</div>;

  return (
    <div className="p-4 space-y-8">
      {groups.map((group, groupIdx) => (
        <div key={`${group.name}-${groupIdx}`} className="space-y-3">
          <h3 className="text-xs font-bold text-secondary uppercase border-b theme-border pb-2">{group.name}</h3>
          
          <div className="overflow-x-auto theme-bg rounded-xl border theme-border">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b theme-border text-secondary">
                  <th className="p-3">#</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">MP</th>
                  <th className="p-3">W</th>
                  <th className="p-3">D</th>
                  <th className="p-3">L</th>
                  <th className="p-3">PTS</th>
                  <th className="p-3 hidden sm:table-cell">Diff</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, rowIdx) => {
                  const diff = row.goals.for - row.goals.against;
                  
                  return (
                    <tr 
                      // Unique Key to prevent React errors
                      key={`${group.name}-${row.team.id}-${rowIdx}`} 
                      className={`border-b last:border-0 theme-border ${row.team.id === teamId ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    >
                      <td className="p-3 text-center">{row.position}</td>
                      <td className="p-3 flex items-center gap-2">
                        <img src={row.team.logo} className="w-5 h-5 object-contain" alt=""/>
                        <span className="font-bold">{row.team.name}</span>
                      </td>
                      <td className="p-3 text-secondary">{row.games.played}</td>
                      <td className="p-3 text-green-500 font-bold">{row.games.win.total}</td>
                      <td className="p-3 text-secondary">{row.games.draw.total}</td>
                      <td className="p-3 text-red-500 font-bold">{row.games.lose.total}</td>
                      <td className="p-3 font-bold text-primary">{row.points}</td>
                      <td className="p-3 hidden sm:table-cell text-secondary">{diff > 0 ? `+${diff}` : diff}</td>
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
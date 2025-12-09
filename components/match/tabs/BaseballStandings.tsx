"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { BaseballStandingsSkeleton } from "@/components/match/skeletons/BaseballSkeletons";

// --- TYPES FOR BASEBALL API ---
type BaseballTeam = {
  id: number;
  name: string;
  logo: string;
};

type BaseballRow = {
  position: number;
  group: { name: string };
  team: BaseballTeam;
  games: { 
    played: number; 
    win: { total: number; percentage: string }; 
    lose: { total: number; percentage: string }; 
  };
  points: { for: number; against: number };
  form: string;
};

type StandingsGroup = {
  name: string;
  rows: BaseballRow[];
};

export default function BaseballStandings({ leagueId, teamId }: { leagueId: number, teamId?: number }) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<StandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === "dark";

  // FORCE HISTORICAL SEASON (Free Plan Limitation)
  const activeSeason = 2022;

  useEffect(() => {
    let isMounted = true;

    async function fetchStandings() {
      if (!leagueId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        // CRITICAL: Ensure this is the BASEBALL host
        const host = "v1.baseball.api-sports.io"; 
        
        const url = `https://${host}/standings?league=${leagueId}&season=${activeSeason}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        
        if (!res.ok) throw new Error("Failed to fetch baseball standings");

        const json = await res.json();

        if (!isMounted) return;

        // Baseball API returns Array of Arrays (Nested Groups like AL East, AL West)
        const responseData = json.response || [];
        const parsedGroups: StandingsGroup[] = [];

        if (Array.isArray(responseData)) {
            responseData.forEach((groupData: any, idx: number) => {
                if (Array.isArray(groupData) && groupData.length > 0) {
                    const firstRow = groupData[0];
                    const groupName = firstRow.group?.name || `Group ${idx + 1}`;
                    
                    parsedGroups.push({
                        name: groupName,
                        rows: groupData
                    });
                }
            });
        }

        setGroups(parsedGroups);
      } catch (err) {
        console.error("Baseball Standings Error:", err);
        if (isMounted) setError("Failed to load standings.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchStandings();
    
    return () => { isMounted = false; };
  }, [leagueId]);

  if (loading) return <BaseballStandingsSkeleton />;
  
  if (error || !groups.length) return (
      <div className="p-8 text-center text-secondary text-sm">
          {error || `No standings available for Season ${activeSeason}.`}
      </div>
  );

  return (
    <div className="p-4 space-y-8">
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
                  <th className="p-3 text-center font-bold">W</th>
                  <th className="p-3 text-center font-bold">L</th>
                  <th className="p-3 text-center font-bold">PCT</th>
                  <th className="p-3 text-center font-bold hidden sm:table-cell">Diff</th>
                  <th className="p-3 text-center font-bold hidden sm:table-cell">Form</th>
                </tr>
              </thead>
              <tbody className="font-medium text-primary">
                {group.rows.map((row) => {
                  const diff = (row.points?.for || 0) - (row.points?.against || 0);
                  const isHome = teamId && row.team.id === teamId;
                  
                  return (
                    <tr 
                        key={row.team.id} 
                        className={`border-b last:border-0 theme-border transition-colors ${isHome ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    >
                      <td className="p-3 text-center">{row.position}</td>
                      <td className="p-3 flex items-center gap-3">
                        <img src={row.team.logo} alt="" className="w-5 h-5 object-contain" />
                        <span className={cn("truncate font-semibold", isHome ? "text-blue-500" : "")}>{row.team.name}</span>
                      </td>
                      <td className="p-3 text-center text-green-600 dark:text-green-400 font-bold">{row.games.win.total}</td>
                      <td className="p-3 text-center text-red-500 dark:text-red-400 font-bold">{row.games.lose.total}</td>
                      <td className="p-3 text-center text-secondary">{row.games.win.percentage}</td>
                      <td className="p-3 text-center text-secondary hidden sm:table-cell">
                          {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td className="p-3 text-center text-secondary hidden sm:table-cell">{row.form || "-"}</td>
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
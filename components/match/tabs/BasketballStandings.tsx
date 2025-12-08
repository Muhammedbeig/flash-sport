"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";

type StandingRow = {
  position: number;
  stage: string;
  group: { name: string }; 
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
  const isDark = theme === "dark";

  useEffect(() => {
    async function fetchStandings() {
      if (!leagueId || !season) {
        setLoading(false);
        return;
      }

      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.basketball.api-sports.io";
        const url = `https://${host}/standings?league=${leagueId}&season=${season}`;

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        
        const json = await res.json();
        const responseData = json.response || [];
        const parsedGroups: StandingsGroup[] = [];

        // Normalizing nested array structure [[Group1], [Group2]]
        if (Array.isArray(responseData)) {
            responseData.forEach((groupData: any, index: number) => {
                if (Array.isArray(groupData) && groupData.length > 0) {
                    const firstRow = groupData[0];
                    const groupName = firstRow.group?.name || firstRow.stage || `Group ${index + 1}`;
                    
                    parsedGroups.push({
                        name: groupName,
                        rows: groupData
                    });
                }
            });
        }

        setGroups(parsedGroups);

      } catch (err) {
        console.error("Basketball Standings Error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStandings();
  }, [leagueId, season]);

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  
  if (!groups.length) {
    return (
        <div className="p-8 text-center text-secondary text-sm">
            No standings available for Season {season}.
        </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      {groups.map((group, idx) => (
        <div key={idx} className="space-y-3">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest px-2 border-b theme-border pb-2">
            {group.name}
          </h3>
          
          <div className="overflow-x-auto border theme-border rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? "bg-slate-900/50 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-500"}`}>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Team</th>
                  <th className="p-3 text-center">GP</th>
                  <th className="p-3 text-center">W</th>
                  <th className="p-3 text-center">L</th>
                  <th className="p-3 text-center">%</th>
                  <th className="p-3 text-center hidden sm:table-cell">Diff</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {group.rows.map((row) => {
                  const diff = (row.points?.for || 0) - (row.points?.against || 0);
                  return (
                    <tr key={row.team.id} className={`border-b last:border-0 ${isDark ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}>
                      <td className="p-3 text-center">{row.position}</td>
                      <td className="p-3 flex items-center gap-3">
                        <img src={row.team.logo} alt="" className="w-5 h-5 object-contain" />
                        <span className="truncate font-bold text-primary">{row.team.name}</span>
                      </td>
                      <td className="p-3 text-center text-secondary">{row.games.played}</td>
                      <td className="p-3 text-center text-green-600 dark:text-green-400 font-bold">{row.games.win.total}</td>
                      <td className="p-3 text-center text-red-500 dark:text-red-400 font-bold">{row.games.lose.total}</td>
                      <td className="p-3 text-center text-secondary">{row.games.win.percentage}</td>
                      <td className="p-3 text-center text-secondary hidden sm:table-cell">
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
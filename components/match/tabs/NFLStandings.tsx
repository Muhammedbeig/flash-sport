"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";

// Types based on the NFL API response structure
type NFLStandingRow = {
  position: number;
  team: { id: number; name: string; logo: string };
  conference: string;
  division: string;
  won: number;
  lost: number;
  ties: number;
  points: { for: number; against: number; difference: number };
  streak: string;
};

type StandingsGroup = {
  name: string; 
  rows: NFLStandingRow[];
};

export default function NFLStandings({ leagueId, season }: { leagueId: number, season: string | number }) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<StandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    async function fetchStandings() {
      if (!leagueId || !season) {
        setLoading(false);
        return;
      }

      // Reset state
      setLoading(true);
      setError(null);

      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.american-football.api-sports.io";
        const url = `https://${host}/standings?league=${leagueId}&season=${season}`;

        console.log("Fetching NFL Standings:", url);

        const res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        
        if (!res.ok) {
           throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        console.log("NFL Standings Response:", json); // Debug Log

        // PARSING LOGIC
        // NFL API Response is often: response: [ { league: { standings: [ [Array of Teams] ] } } ]
        // OR sometimes flat: response: [ { team:..., conference:... } ]
        
        let flatList: NFLStandingRow[] = [];

        if (json.response && Array.isArray(json.response)) {
            const firstItem = json.response[0];
            
            // Check if nested inside 'league.standings' (V3 style)
            if (firstItem?.league?.standings) {
                 // Flatten the groups if it's an array of arrays
                 flatList = firstItem.league.standings.flat();
            } 
            // Check if flat list directly (V1 style)
            else if (firstItem?.team) {
                 flatList = json.response;
            }
            // Check if directly inside 'standings' property
            else if (firstItem?.standings) {
                flatList = firstItem.standings.flat();
            }
        }

        if (flatList.length === 0) {
            console.warn("NFL Standings: No data found after parsing.");
            setGroups([]);
            return;
        }

        // Group by "Conference - Division"
        const groupedMap: Record<string, NFLStandingRow[]> = {};
        
        flatList.forEach((row) => {
          if (!row.conference || !row.division) return;
          const key = `${row.conference} ${row.division}`;
          if (!groupedMap[key]) groupedMap[key] = [];
          groupedMap[key].push(row);
        });

        // Convert to array and sort
        const parsedGroups = Object.entries(groupedMap).map(([name, rows]) => ({
          name,
          rows: rows.sort((a, b) => a.position - b.position)
        }));

        parsedGroups.sort((a, b) => a.name.localeCompare(b.name));
        setGroups(parsedGroups);

      } catch (err: any) {
        console.error("NFL Standings Exception:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, [leagueId, season]);

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  
  if (error) {
     return <div className="p-8 text-center text-red-500 text-sm">Error: {error}</div>;
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
                  <th className="p-3 text-center">W</th>
                  <th className="p-3 text-center">L</th>
                  <th className="p-3 text-center">T</th>
                  <th className="p-3 text-center">PF</th>
                  <th className="p-3 text-center">PA</th>
                  <th className="p-3 text-center hidden sm:table-cell">Diff</th>
                  <th className="p-3 text-center hidden sm:table-cell">Strk</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {group.rows.map((row) => (
                  <tr key={row.team.id} className={`border-b last:border-0 ${isDark ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}>
                    <td className="p-3 text-center">{row.position}</td>
                    <td className="p-3 flex items-center gap-3">
                      <img src={row.team.logo} alt="" className="w-5 h-5 object-contain" />
                      <span className="truncate font-bold text-primary">{row.team.name}</span>
                    </td>
                    <td className="p-3 text-center text-green-600 dark:text-green-400 font-bold">{row.won}</td>
                    <td className="p-3 text-center text-red-500 dark:text-red-400 font-bold">{row.lost}</td>
                    <td className="p-3 text-center text-secondary">{row.ties}</td>
                    <td className="p-3 text-center text-secondary">{row.points.for}</td>
                    <td className="p-3 text-center text-secondary">{row.points.against}</td>
                    <td className="p-3 text-center text-secondary hidden sm:table-cell">
                        {row.points.difference > 0 ? `+${row.points.difference}` : row.points.difference}
                    </td>
                    <td className="p-3 text-center text-secondary hidden sm:table-cell">{row.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
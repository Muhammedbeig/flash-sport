"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { NFLStandingsSkeleton } from "@/components/match/skeletons/NFLSkeletons";

// --- TYPES (Specific to NFL API structure) ---
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
  records: { home: string; road: string; conference: string; division: string };
};

type StandingsGroup = {
  name: string; // e.g., "AFC East"
  rows: NFLStandingRow[];
};

export default function NFLStandings({ leagueId, season }: { leagueId: number, season: string | number }) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<StandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const host = "v1.american-football.api-sports.io";
        
        // 1. Try fetching the requested season first
        let targetSeason = season;
        let url = `https://${host}/standings?league=${leagueId}&season=${targetSeason}`;

        let res = await fetch(url, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        
        let json = await res.json();

        // 2. Fallback Logic: If 2024/2025 returns 0 results (common for free plans), try 2022
        if (json.results === 0 && (targetSeason === "2024" || targetSeason === "2025")) {
             console.warn(`NFL Standings: No data for ${targetSeason}. Falling back to 2022.`);
             targetSeason = "2022";
             url = `https://${host}/standings?league=${leagueId}&season=${targetSeason}`;
             
             res = await fetch(url, {
               headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
             });
             json = await res.json();
        }

        if (!isMounted) return;

        // 3. Process Data
        // NFL API returns a flat array of teams. We must group them by Conference/Division.
        const flatList: NFLStandingRow[] = json.response || [];
        const groupedMap: Record<string, NFLStandingRow[]> = {};
        
        flatList.forEach((row) => {
          if (!row.conference || !row.division) return;
          // Group Key: "American Football Conference East" -> "AFC East" for display logic if needed
          const key = `${row.conference} ${row.division}`;
          if (!groupedMap[key]) groupedMap[key] = [];
          groupedMap[key].push(row);
        });

        // Convert to array and sort teams by position
        const parsedGroups = Object.entries(groupedMap).map(([name, rows]) => ({
          name,
          rows: rows.sort((a, b) => a.position - b.position)
        }));

        // Sort groups alphabetically to keep Conferences together
        parsedGroups.sort((a, b) => a.name.localeCompare(b.name));

        setGroups(parsedGroups);
      } catch (err) {
        console.error("NFL Standings Error:", err);
        if (isMounted) setError("Failed to load standings.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStandings();

    return () => { isMounted = false; };
  }, [leagueId, season]);

  if (loading) return <NFLStandingsSkeleton />

  if (error || !groups.length) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        {error || `No standings data found for Season ${season}.`}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      {groups.map((group, idx) => (
        <div key={idx} className="space-y-3">
          {/* Group Header - Standardized Style */}
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest px-2 border-b theme-border pb-2">
            {group.name}
          </h3>
          
          {/* Table Container - This gives the "Card" look */}
          <div className="overflow-x-auto theme-bg rounded-xl border theme-border">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b theme-border ${isDark ? "bg-slate-900/40 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
                  <th className="p-3 w-10 text-center font-bold">#</th>
                  <th className="p-3 font-bold">Team</th>
                  <th className="p-3 text-center font-bold">W</th>
                  <th className="p-3 text-center font-bold">L</th>
                  <th className="p-3 text-center font-bold">T</th>
                  <th className="p-3 text-center font-bold hidden sm:table-cell">PF</th>
                  <th className="p-3 text-center font-bold hidden sm:table-cell">PA</th>
                  <th className="p-3 text-center font-bold hidden sm:table-cell">Diff</th>
                  <th className="p-3 text-center font-bold hidden sm:table-cell">Strk</th>
                </tr>
              </thead>
              <tbody className="font-medium text-primary">
                {group.rows.map((row) => (
                  <tr 
                    key={row.team.id} 
                    className={`border-b last:border-0 theme-border transition-colors ${
                      isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 text-center">{row.position}</td>
                    <td className="p-3 flex items-center gap-3">
                      {row.team.logo && (
                        <img 
                          src={row.team.logo} 
                          alt={row.team.name} 
                          className="w-5 h-5 object-contain" 
                        />
                      )}
                      <span className="truncate font-semibold">{row.team.name}</span>
                    </td>
                    <td className="p-3 text-center text-green-600 dark:text-green-400 font-bold">{row.won}</td>
                    <td className="p-3 text-center text-red-500 dark:text-red-400 font-bold">{row.lost}</td>
                    <td className="p-3 text-center text-secondary">{row.ties}</td>
                    <td className="p-3 text-center text-secondary hidden sm:table-cell">{row.points.for}</td>
                    <td className="p-3 text-center text-secondary hidden sm:table-cell">{row.points.against}</td>
                    <td className={`p-3 text-center font-bold hidden sm:table-cell ${
                        row.points.difference > 0 
                          ? "text-green-600 dark:text-green-400" 
                          : row.points.difference < 0 
                          ? "text-red-500 dark:text-red-400" 
                          : "text-secondary"
                    }`}>
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
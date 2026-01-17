"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { FootballStandingsSkeleton } from "@/components/match/skeletons/FootballSkeletons";

type FootballRow = {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: { played: number; win: number; draw: number; lose: number };
};

type StandingsGroup = { name: string; rows: FootballRow[] };

export default function FootballStandings({ leagueId, season, teamId }: { leagueId: number; season: number; teamId?: number }) {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<StandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  useEffect(() => {
    async function fetchStandings() {
      if (!leagueId) { setLoading(false); return; }
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v3.football.api-sports.io";
        
        const url = `https://${host}/standings?league=${leagueId}&season=${season}`;
        
        const res = await fetch(url, { headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" } });
        const json = await res.json();
        
        const leagueData = json.response?.[0]?.league;
        const rawStandings = leagueData?.standings || [];
        const parsed: StandingsGroup[] = [];

        if (Array.isArray(rawStandings)) {
           rawStandings.forEach((groupData: any, idx: number) => {
              if (Array.isArray(groupData) && groupData.length > 0) {
                 const first = groupData[0];
                 const name = first.group || `Group ${idx + 1}`;
                 parsed.push({ name, rows: groupData });
              }
           });
        }
        setGroups(parsed);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchStandings();
  }, [leagueId, season]);

  if (loading) return <FootballStandingsSkeleton />;
  if (!groups.length) return <div className="p-8 text-center text-secondary text-sm">No standings available.</div>;

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
                  <th className="p-3 text-center">MP</th>
                  <th className="p-3 text-center">W</th>
                  <th className="p-3 text-center">D</th>
                  <th className="p-3 text-center">L</th>
                  <th className="p-3 text-center">+/-</th>
                  <th className="p-3 text-center">PTS</th>
                  <th className="p-3 text-center hidden sm:table-cell">Form</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr 
                    key={`${group.name}-${row.team.id}`} 
                    className={`border-b last:border-0 theme-border ${row.team.id === teamId ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    <td className="p-3 text-center">{row.rank}</td>
                    <td className="p-3 flex items-center gap-2">
                        <img src={row.team.logo} className="w-5 h-5 object-contain" alt=""/>
                        <span className="font-bold whitespace-nowrap">{row.team.name}</span>
                    </td>
                    <td className="p-3 text-center text-secondary">{row.all.played}</td>
                    <td className="p-3 text-center text-green-500 font-bold">{row.all.win}</td>
                    <td className="p-3 text-center text-secondary">{row.all.draw}</td>
                    <td className="p-3 text-center text-red-500 font-bold">{row.all.lose}</td>
                    <td className="p-3 text-center text-secondary">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td>
                    <td className="p-3 text-center font-bold text-primary">{row.points}</td>
                    <td className="p-3 text-center hidden sm:table-cell tracking-widest text-[10px]">{row.form}</td>
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
"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

type StatItem = { type: string; value: any };
type TeamStats = { team: { id: number; name: string; logo: string }; statistics: StatItem[] };

export default function FootballStats({ stats }: { stats: TeamStats[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!stats || stats.length < 2) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        Statistics not available.
      </div>
    );
  }

  const home = stats[0];
  const away = stats[1];

  // Helper to safely get value (sometimes null)
  const getVal = (list: StatItem[], type: string) => {
    const item = list.find(i => i.type === type);
    return item?.value ?? 0;
  };

  // List of stats to display
  const statTypes = [
    "Ball Possession", "Total Shots", "Shots on Goal", "Shots off Goal", 
    "Blocked Shots", "Corner Kicks", "Offsides", "Fouls", 
    "Yellow Cards", "Red Cards", "Goalkeeper Saves", "Total passes", 
    "Passes accurate", "Passes %"
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header with Logos */}
      <div className="flex justify-between items-center px-4 mb-2">
        <img src={home.team.logo} className="w-8 h-8 object-contain" alt={home.team.name} />
        <span className="text-xs font-bold uppercase text-secondary">Match Statistics</span>
        <img src={away.team.logo} className="w-8 h-8 object-contain" alt={away.team.name} />
      </div>

      <div className="space-y-5">
        {statTypes.map((type) => {
          let hVal = getVal(home.statistics, type);
          let aVal = getVal(away.statistics, type);

          // Handle "%" strings (e.g. "50%")
          const hNum = typeof hVal === 'string' ? parseInt(hVal) : hVal;
          const aNum = typeof aVal === 'string' ? parseInt(aVal) : aVal;
          const total = hNum + aNum;
          
          // Calculate percentages for bar width
          const hPercent = total === 0 ? 0 : (hNum / total) * 100;
          const aPercent = total === 0 ? 0 : (aNum / total) * 100;

          return (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-primary px-1">
                 <span>{hVal}</span>
                 <span className="text-secondary font-normal uppercase text-[10px] tracking-wide">{type}</span>
                 <span>{aVal}</span>
              </div>
              <div className="flex h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${hPercent}%` }} 
                />
                <div 
                    className="bg-red-500 h-full transition-all duration-500" 
                    style={{ width: `${aPercent}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
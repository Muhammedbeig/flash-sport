"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

type StatItem = {
  type: string;
  value: string | number | null;
};

type TeamStats = {
  team: { id: number; name: string; logo: string };
  statistics: StatItem[];
};

export default function MatchStats({ stats }: { stats: TeamStats[] }) {
  const { theme } = useTheme();

  if (!stats || stats.length < 2) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        No statistics available for this match.
      </div>
    );
  }

  const home = stats[0];
  const away = stats[1];

  // Map stats to ensure we compare the same keys
  const statKeys = home.statistics.map((s) => s.type);

  return (
    <div className="space-y-4 p-4">
      {/* Team Headers */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex flex-col items-center w-24">
          <img src={home.team.logo} alt={home.team.name} className="w-10 h-10 object-contain mb-2" />
          <span className="text-[10px] font-bold text-center leading-tight">{home.team.name}</span>
        </div>
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Full Time Stats</span>
        <div className="flex flex-col items-center w-24">
          <img src={away.team.logo} alt={away.team.name} className="w-10 h-10 object-contain mb-2" />
          <span className="text-[10px] font-bold text-center leading-tight">{away.team.name}</span>
        </div>
      </div>

      {/* Stat Rows */}
      <div className="space-y-5">
        {statKeys.map((type, idx) => {
          const homeValRaw = home.statistics.find((s) => s.type === type)?.value ?? 0;
          const awayValRaw = away.statistics.find((s) => s.type === type)?.value ?? 0;

          // Parse for bar width (handle percentages like "55%")
          const parseVal = (v: string | number) => {
            if (typeof v === "string" && v.includes("%")) return parseFloat(v);
            return Number(v);
          };

          const hNum = parseVal(homeValRaw);
          const aNum = parseVal(awayValRaw);
          const total = hNum + aNum;
          
          // Calculate percentages for the bar (default to 50/50 if total is 0)
          const hPct = total === 0 ? 0 : (hNum / total) * 100;
          const aPct = total === 0 ? 0 : (aNum / total) * 100;

          // Highlight higher value
          const hClass = hNum > aNum ? "font-bold text-primary" : "text-secondary";
          const aClass = aNum > hNum ? "font-bold text-primary" : "text-secondary";

          // Colors
          const barBg = theme === 'dark' ? "bg-slate-800" : "bg-slate-100";
          const homeFill = "bg-blue-500"; 
          const awayFill = "bg-red-500"; 

          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between items-end text-xs mb-1">
                <span className={hClass}>{homeValRaw}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{type}</span>
                <span className={aClass}>{awayValRaw}</span>
              </div>
              
              <div className={`w-full h-2 rounded-full overflow-hidden flex ${barBg}`}>
                <div 
                  className={`h-full ${homeFill} transition-all duration-500`} 
                  style={{ width: `${hPct}%` }}
                />
                <div 
                  className={`h-full ${awayFill} transition-all duration-500`} 
                  style={{ width: `${aPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
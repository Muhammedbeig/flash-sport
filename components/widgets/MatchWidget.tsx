"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ChevronDown, ChevronUp, User } from "lucide-react";

// === CONSTANTS ===
const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  nba: "v1.basketball.api-sports.io", 
  nfl: "v1.american-football.api-sports.io",
  f1: "v1.formula-1.api-sports.io",
  mma: "v1.mma.api-sports.io",
};

// === TYPES ===
type Player = {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
};
type Lineup = {
  team: { id: number; name: string; logo: string };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
};

// === HELPER: Expandable Wrapper ===
function ExpandableWidget({ title, children }: { title: string, children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border flex flex-col">
      <div className="p-4 border-b theme-border font-bold text-sm text-secondary uppercase tracking-wider">
        {title}
      </div>
      
      <div className={`transition-all duration-500 ease-in-out relative ${isExpanded ? "max-h-[3000px]" : "max-h-[400px] overflow-hidden"}`}>
        {children}
        {!isExpanded && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: `linear-gradient(to top, rgb(var(--background)), transparent)` }} 
          />
        )}
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider theme-hover border-t theme-border bg-[rgba(var(--background),0.8)]"
      >
        {isExpanded ? <>Show Less <ChevronUp size={14} /></> : <>Show More <ChevronDown size={14} /></>}
      </button>
    </div>
  );
}

// === CUSTOM COMPONENT: Hybrid Lineups ===
function MatchLineups({ matchId, sport, widgetTheme }: { matchId: string, sport: string, widgetTheme: string }) {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [useWidgetFallback, setUseWidgetFallback] = useState(false);

  useEffect(() => {
    async function fetchLineups() {
      if (sport !== 'football') {
        setUseWidgetFallback(true);
        setLoading(false);
        return;
      }

      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = SPORT_HOSTS.football;
        
        if (!apiKey) throw new Error("No API Key");

        const res = await fetch(`https://${host}/fixtures/lineups?fixture=${matchId}`, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey }
        });
        const json = await res.json();
        
        if (json.response && json.response.length > 0) {
          setLineups(json.response);
        } else {
          setUseWidgetFallback(true);
        }
      } catch (e) {
        console.warn("Lineup fetch failed/empty, falling back to widget", e);
        setUseWidgetFallback(true);
      } finally {
        setLoading(false);
      }
    }
    fetchLineups();
  }, [matchId, sport]);

  const openPlayer = (playerId: number) => {
    const repoName = process.env.NEXT_PUBLIC_REPO_NAME;
    const basePath = repoName ? `/${repoName}` : "";
    window.open(`${basePath}/player?id=${playerId}&sport=${sport}`, '_blank');
  };

  if (loading) return <Skeleton className="h-64 w-full rounded-xl mt-8 bg-skeleton" />;

  // === FALLBACK: Widget View ===
  if (useWidgetFallback) {
    return (
      <div className="theme-bg rounded-xl border theme-border overflow-hidden mt-8 shadow-sm min-h-[400px]">
        <div className="p-4 border-b theme-border font-bold text-sm text-secondary uppercase tracking-wider">
          Lineups (Widget View)
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <api-sports-widget
                data-type="game"
                data-game-id="${matchId}"
                data-sport="${sport}"
                data-theme="${widgetTheme}"
                data-game-tab="lineups"
                data-show-toolbar="false"
                data-show-errors="false"
              ></api-sports-widget>
            `,
          }}
        />
      </div>
    );
  }

  // === STYLE LOGIC (Matches SidebarCountries) ===
  const isDark = widgetTheme === "dark";
  
  const coachBg = isDark ? "bg-slate-800/50" : "bg-slate-50";
  const rowHoverClass = isDark 
    ? "hover:bg-slate-800/50 border-transparent hover:border-slate-700" 
    : "hover:bg-slate-100 border-transparent hover:border-blue-100";
    
  const numberClass = isDark ? "text-slate-400 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-600";
  const nameClass = isDark ? "text-primary group-hover:text-blue-400" : "text-primary group-hover:text-blue-700";

  // === CUSTOM UI: Confirmed Lineups ===
  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden mt-8 shadow-sm">
      <div className="p-4 border-b theme-border font-bold text-sm text-secondary uppercase tracking-wider flex justify-between items-center">
        <span>Starting Lineups</span>
        <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded font-bold uppercase">Confirmed</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x theme-border">
        {lineups.map((teamLineup, idx) => (
          <div key={idx} className="p-4">
            {/* Team Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b theme-border">
              <img src={teamLineup.team.logo} alt={teamLineup.team.name} className="w-10 h-10 object-contain" />
              <div>
                <h3 className="font-bold text-primary">{teamLineup.team.name}</h3>
                <span className={`text-xs text-secondary font-mono px-1.5 py-0.5 rounded ${coachBg}`}>{teamLineup.formation}</span>
              </div>
            </div>

            {/* Coach */}
            {teamLineup.coach?.id && (
              <div className={`mb-6 flex items-center gap-3 p-3 rounded-lg border theme-border ${coachBg}`}>
                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 text-secondary">
                   {teamLineup.coach.photo ? <img src={teamLineup.coach.photo} alt={teamLineup.coach.name} /> : <User size={16} />}
                 </div>
                 <div>
                   <div className="text-[10px] uppercase text-secondary font-bold">Coach</div>
                   <div className="text-sm font-medium text-primary">{teamLineup.coach.name}</div>
                 </div>
              </div>
            )}

            {/* STARTING XI */}
            <div className="space-y-1 mb-6">
              <div className="text-[10px] uppercase text-secondary font-bold mb-2 pl-2 opacity-70">Starting XI</div>
              {teamLineup.startXI?.map(({ player }) => (
                <button
                  key={player.id}
                  onClick={() => openPlayer(player.id)}
                  // Uses the strict Theme-Aware class
                  className={`w-full flex items-center gap-3 p-2 rounded-lg group transition-all duration-200 border ${rowHoverClass}`}
                >
                  <span className={`w-6 text-center font-mono text-sm font-bold ${numberClass}`}>
                    {player.number}
                  </span>
                  <span className={`text-sm font-medium ${nameClass}`}>
                    {player.name}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto uppercase font-mono group-hover:text-slate-500">
                    {player.pos}
                  </span>
                </button>
              ))}
            </div>

            {/* SUBSTITUTES */}
            {teamLineup.substitutes?.length > 0 && (
              <div className="space-y-1 mt-6 pt-4 border-t theme-border">
                <div className="text-[10px] uppercase text-secondary font-bold mb-2 pl-2 opacity-70">Substitutes</div>
                {teamLineup.substitutes?.map(({ player }) => (
                  <button
                    key={player.id}
                    onClick={() => openPlayer(player.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg group transition-all duration-200 border opacity-80 hover:opacity-100 ${rowHoverClass}`}
                  >
                    <span className="w-6 text-center font-mono text-xs font-bold text-slate-400">
                      {player.number}
                    </span>
                    <span className={`text-xs font-medium text-secondary group-hover:text-primary ${nameClass}`}>
                      {player.name}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-auto uppercase font-mono">
                      {player.pos}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// === MAIN MATCH WIDGET ===
export default function MatchWidget({ matchId, sport = "football" }: { matchId: string, sport?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [meta, setMeta] = useState<{ leagueId?: string; season?: string; h2h?: string }>({});
  const { theme } = useTheme();
  
  const widgetTheme = theme === "dark" ? "dark" : "white";

  useEffect(() => {
    async function init() {
      if (sport !== 'football') { setLoaded(true); return; }
      
      const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
      if (!apiKey) { setLoaded(true); return; }

      try {
        const host = SPORT_HOSTS.football;
        const res = await fetch(`https://${host}/fixtures?id=${matchId}`, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey }
        });
        const json = await res.json();
        const data = json.response?.[0];

        if (data) {
          const homeId = data.teams?.home?.id;
          const awayId = data.teams?.away?.id;
          setMeta({
            leagueId: data.league?.id,
            season: data.league?.season,
            h2h: (homeId && awayId) ? `${homeId}-${awayId}` : undefined
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, [matchId, sport]);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      const scriptId = "widget-script-loader";
      if (document.getElementById(scriptId)) document.getElementById(scriptId)?.remove();
      
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://widgets.api-sports.io/3.1.0/widgets.js";
      script.type = "module";
      script.async = true;
      document.body.appendChild(script);
    }, 500);
    return () => clearTimeout(timer);
  }, [loaded, theme]);

  if (!loaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl bg-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Skeleton className="h-96 w-full rounded-xl bg-skeleton" />
           <Skeleton className="h-96 w-full rounded-xl bg-skeleton" />
        </div>
      </div>
    );
  }

  const getType = () => {
    if (sport === "f1") return "race";
    if (sport === "mma") return "fight";
    return "game";
  };
  
  const getIdAttr = () => {
    if (sport === "f1") return `data-race-id="${matchId}"`;
    if (sport === "mma") return `data-fight-id="${matchId}"`;
    return `data-game-id="${matchId}"`;
  };

  return (
    <div key={matchId} className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. MATCH SUMMARY */}
      <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border min-h-[400px]">
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <api-sports-widget
                data-type="${getType()}"
                ${getIdAttr()}
                data-sport="${sport}"
                data-theme="${widgetTheme}"
                data-show-toolbar="false"
                data-show-errors="false"
                data-events="true"
                data-statistics="true"
                data-target-player="modal" 
              ></api-sports-widget>
            `,
          }}
        />
      </div>

      {/* 2. EXPANDABLE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {meta.h2h && (
          <ExpandableWidget title="Head to Head">
            <div dangerouslySetInnerHTML={{
              __html: `<api-sports-widget data-type="h2h" data-h2h="${meta.h2h}" data-sport="${sport}" data-theme="${widgetTheme}" data-show-toolbar="false"></api-sports-widget>`
            }} />
          </ExpandableWidget>
        )}

        {meta.leagueId && meta.season && (
          <ExpandableWidget title="Standings">
            <div dangerouslySetInnerHTML={{
              __html: `<api-sports-widget data-type="standings" data-league="${meta.leagueId}" data-season="${meta.season}" data-sport="${sport}" data-theme="${widgetTheme}" data-show-toolbar="false"></api-sports-widget>`
            }} />
          </ExpandableWidget>
        )}
      </div>

      {/* 3. LINEUPS */}
      <MatchLineups matchId={matchId} sport={sport} widgetTheme={widgetTheme} />

    </div>
  );
}
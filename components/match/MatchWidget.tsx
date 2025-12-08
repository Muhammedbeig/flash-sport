"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import MatchSummary from "./tabs/MatchSummary";
import MatchStats from "./tabs/MatchStats";
import MatchLineups from "./tabs/MatchLineups"; // Your Custom Lineups Component
import MatchH2H from "./tabs/MatchH2H"; // <--- NEW COMPONENT IMPORT

// --- CONSTANTS ---
const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  nba: "v1.basketball.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
};

export default function MatchWidget({
  matchId,
  sport = "football",
}: {
  matchId: string | number;
  sport?: string;
}) {
  const { theme } = useTheme();
  
  // State for raw data
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Added "h2h" to the active tab state type
  const [activeTab, setActiveTab] = useState<"summary" | "stats" | "lineups" | "h2h">("summary");

  const matchIdStr = String(matchId);
  const isDark = theme === "dark";

  // --- FETCHING LOGIC (Pure API, No Widget) ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(false);

      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = SPORT_HOSTS[sport] || SPORT_HOSTS.football;

        let url = "";
        let headers: Record<string, string> = {};

        // Use CDN for football if available
        if (sport === "football" && cdnUrl) {
          // In V3 API, /fixtures?id=X returns events, lineups, stats inside the response
          url = `${cdnUrl}/fixtures?id=${matchIdStr}`;
        } else {
          if (!apiKey) throw new Error("No API Key");
          // Different sports have different endpoints (games vs fixtures)
          const endpoint = sport === "football" ? "fixtures" : "games";
          url = `https://${host}/${endpoint}?id=${matchIdStr}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (json.response && json.response[0]) {
          setData(json.response[0]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Match Data Fetch Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [matchIdStr, sport]);

  // --- TABS DEFINITION ---
  const TABS = [
    { id: "summary", label: "Summary" },
    { id: "stats", label: "Stats" },
    { id: "lineups", label: "Lineups" },
    { id: "h2h", label: "H2H" }, // <--- NEW TAB ADDED
  ] as const;

  const getTabStyle = (id: string) => {
    const isActive = activeTab === id;
    if (isActive) {
      return "bg-[#0f80da] text-white border-transparent shadow-sm";
    }
    return isDark
      ? "bg-slate-800 text-slate-400 hover:bg-slate-700 border-transparent"
      : "bg-gray-100 text-slate-600 hover:bg-gray-200 border-transparent";
  };

  // --- RENDER CONTENT BASED ON TAB ---
  const renderContent = () => {
    if (loading) return <Skeleton className="h-64 w-full" />;
    if (error || !data) return <div className="p-8 text-center text-secondary">Match data unavailable.</div>;

    switch (activeTab) {
      case "summary":
        return (
          <MatchSummary 
            events={data.events} 
            homeId={data.teams.home.id} 
            awayId={data.teams.away.id} 
          />
        );
      case "stats":
        return <MatchStats stats={data.statistics} />;
      case "lineups":
        // Using custom component or passing data
        return <MatchLineups 
          matchId={matchId} 
          sport={sport} 
          widgetTheme={theme === "dark" ? "flash-dark" : "flash-light"} 
        />;
      case "h2h":
        return (
          <MatchH2H 
            teamOneId={data.teams.home.id} 
            teamTwoId={data.teams.away.id} 
            sport={sport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* 1. SCOREBOARD HEADER (Basic Info) */}
      {!loading && data && (
        <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
           <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">
             {data.league?.name} • {data.league?.round}
           </div>
           <div className="flex items-center gap-8 w-full justify-center">
              {/* Home */}
              <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                <img src={data.teams.home.logo} className="w-16 h-16 object-contain" alt={data.teams.home.name}/>
                <span className="font-bold text-primary text-sm md:text-base">{data.teams.home.name}</span>
              </div>
              
              {/* Score */}
              <div className="flex flex-col items-center">
                 <div className="text-3xl md:text-4xl font-black text-primary tracking-tighter">
                    {data.goals.home ?? 0} - {data.goals.away ?? 0}
                 </div>
                 <span className="text-[10px] font-bold text-[#dc2626] uppercase mt-1 animate-pulse">
                    {data.fixture?.status?.long || data.status?.long}
                 </span>
                 <span className="text-[10px] text-secondary mt-1">
                    {data.fixture?.elapsed || data.status?.timer ? `${data.fixture?.elapsed || data.status?.timer}'` : ''}
                 </span>
              </div>

              {/* Away */}
              <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                <img src={data.teams.away.logo} className="w-16 h-16 object-contain" alt={data.teams.away.name}/>
                <span className="font-bold text-primary text-sm md:text-base">{data.teams.away.name}</span>
              </div>
           </div>
        </div>
      )}

      {/* 2. TABS & CONTENT */}
      <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border min-h-[400px]">
        {/* Tabs */}
        <div className="px-4 pt-4 pb-3 border-b theme-border">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-lg border text-[11px] font-semibold uppercase tracking-wide transition-all ${getTabStyle(tab.id)}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-0 md:p-2">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
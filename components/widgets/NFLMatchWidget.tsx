"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import NFLSummary from "@/components/match/tabs/NFLSummary";
// FIX: Import Dedicated Component
import NFLH2H from "@/components/match/tabs/NFLH2H"; 
import NFLStandings from "@/components/match/tabs/NFLStandings";
import NFLOdds from "@/components/match/tabs/NFLOdds";

type NFLMatch = {
  id: number;
  date: string;
  status: { short: string; long: string; elapsed: number | null };
  league: { id: number; name: string; country: string; logo: string; season: string | number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  scores: {
    home: { quarter_1: number; quarter_2: number; quarter_3: number; quarter_4: number; overtime: number; total: number };
    away: { quarter_1: number; quarter_2: number; quarter_3: number; quarter_4: number; overtime: number; total: number };
  };
};

export default function NFLMatchWidget({ matchId, initialTab }: { matchId: string, initialTab?: string }) {
  const { theme } = useTheme();
  const [match, setMatch] = useState<NFLMatch | null>(null);
  const [loading, setLoading] = useState(true);
  
  const validTabs = ["summary", "h2h", "standings", "odds"];
  const defaultTab = (validTabs.includes(initialTab || "")) ? (initialTab as any) : "summary";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const isDark = theme === "dark";

  useEffect(() => {
    if (initialTab && validTabs.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    async function fetchMatch() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_NFL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.american-football.api-sports.io";

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/games?id=${matchId}`;
        } else {
          url = `https://${host}/games?id=${matchId}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers, next: { revalidate: 60 } });
        const json = await res.json();
        const data = json.response?.[0];

        if (data) {
          const game = data.game || data;
          const league = data.league || {};
          const country = league.country || data.country || { name: "USA" };

          setMatch({
            id: game.id,
            date: game.date,
            status: {
              short: game.status?.short,
              long: game.status?.long,
              elapsed: game.status?.timer,
            },
            league: {
              id: league.id,
              name: league.name,
              country: country.name || country,
              logo: league.logo,
              season: league.season, 
            },
            teams: {
              home: { id: data.teams.home.id, name: data.teams.home.name, logo: data.teams.home.logo, winner: null },
              away: { id: data.teams.away.id, name: data.teams.away.name, logo: data.teams.away.logo, winner: null },
            },
            scores: {
               home: { ...data.scores.home, total: data.scores.home?.total },
               away: { ...data.scores.away, total: data.scores.away?.total }
            }, 
          });
        }
      } catch (err) {
        console.error("NFL Match Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [matchId]);

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!match) return <div className="p-8 text-center text-secondary">Match not found.</div>;

  const { teams, scores, league, status } = match;
  const isLive = ["Q1", "Q2", "Q3", "Q4", "OT"].includes(status.short);

  const tabBase = "px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors";
  const activeClass = "border-blue-500 text-blue-600 dark:text-blue-400";
  const inactiveClass = "border-transparent text-secondary hover:text-primary";

  const leagueBadgeStyle = isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-700 border-slate-200 shadow-sm";
  const statusBadgeStyle = isLive ? "bg-red-100 text-red-600 animate-pulse" : (isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600");

  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b theme-border flex flex-col items-center gap-6 relative overflow-hidden">
        <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${leagueBadgeStyle}`}>
          {league.logo && <img src={league.logo} className="w-4 h-4 object-contain" />}
          <span>{league.country}: {league.name}</span>
        </div>
        <div className="flex items-center justify-between w-full max-w-2xl mt-8">
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <img src={teams.home.logo} alt={teams.home.name} className="w-20 h-20 object-contain" />
            <span className="text-lg font-bold text-primary leading-tight">{teams.home.name}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-4xl font-black text-primary tracking-tight font-mono">
              {scores.home.total ?? "-"} : {scores.away.total ?? "-"}
            </div>
            <span className={`text-xs font-bold uppercase px-4 py-1.5 rounded-full border ${statusBadgeStyle}`}>
              {status.elapsed ? `${status.short} - ${status.elapsed}'` : status.short}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <img src={teams.away.logo} alt={teams.away.name} className="w-20 h-20 object-contain" />
            <span className="text-lg font-bold text-primary leading-tight">{teams.away.name}</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 px-4 border-b theme-border">
        {validTabs.map((t) => {
             const label = t.charAt(0).toUpperCase() + t.slice(1);
             const finalLabel = label === "H2h" ? "H2H" : label;
             const isActive = activeTab === t;
             return (
               <Link 
                 key={t}
                 href={`/match?id=${matchId}&sport=nfl/${t}`}
                 replace={true}
                 prefetch={false}
                 className={`${tabBase} ${isActive ? activeClass : inactiveClass}`}
               >
                 {finalLabel}
               </Link>
             );
        })}
      </div>

      {/* CONTENT */}
      <div className="min-h-[300px]">
        {activeTab === "summary" && <NFLSummary match={match} />}
        
        {/* FIX: Use NFLH2H instead of MatchH2H */}
        {activeTab === "h2h" && <NFLH2H teamOneId={teams.home.id} teamTwoId={teams.away.id} />}
        
        {activeTab === "standings" && <NFLStandings leagueId={league.id} season={league.season} />}
        {activeTab === "odds" && <NFLOdds matchId={String(match.id)} />}
      </div>
    </div>
  );
}
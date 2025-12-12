"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import VolleyballSummary from "@/components/match/tabs/VolleyballSummary";
import VolleyballH2H from "@/components/match/tabs/VolleyballH2H";
import VolleyballStandings from "@/components/match/tabs/VolleyballStandings";
import VolleyballOdds from "@/components/match/tabs/VolleyballOdds";
import { VolleyballScoreboardSkeleton } from "@/components/match/skeletons/VolleyballSkeletons";

type VolleyballMatch = {
  id: number;
  date: string;
  status: { short: string; long: string; elapsed: number | null };
  league: { id: number; name: string; country: string; logo: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  scores: { home: number | null; away: number | null };
  periods: any; 
};

export default function VolleyballMatchWidget({ matchId, initialTab }: { matchId: string, initialTab?: string }) {
  const { theme } = useTheme();
  const [match, setMatch] = useState<VolleyballMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const validTabs = ["summary", "h2h", "standings", "odds"];
  const defaultTab = (initialTab && validTabs.includes(initialTab)) ? initialTab : "summary";
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
      setError(null);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_VOLLEYBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.volleyball.api-sports.io";

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
        
        // CHECK FOR ERRORS
        if (json.errors && Object.keys(json.errors).length > 0) {
            const msg = typeof json.errors === 'object' 
                ? Object.values(json.errors).join(', ') 
                : "Error fetching match details.";
            throw new Error(msg);
        }

        const data = json.response?.[0];

        if (data) {
          setMatch({
            id: data.id,
            date: data.date,
            status: { 
                short: data.status.short, 
                long: data.status.long, 
                elapsed: null 
            },
            league: {
              id: data.league.id,
              name: data.league.name,
              country: data.country?.name || data.league.country,
              logo: data.league.logo,
              season: data.league.season, 
            },
            teams: {
              home: { id: data.teams.home.id, name: data.teams.home.name, logo: data.teams.home.logo, winner: data.teams.home.winner },
              away: { id: data.teams.away.id, name: data.teams.away.name, logo: data.teams.away.logo, winner: data.teams.away.winner },
            },
            scores: data.scores,
            periods: data.periods 
          });
        }
      } catch (err: any) { 
        console.error("Volleyball Match Error:", err); 
        setError(err.message || "Match could not be loaded.");
      } finally { 
        setLoading(false); 
      }
    }
    fetchMatch();
  }, [matchId]);

  if (loading) return <VolleyballScoreboardSkeleton />;

  // USER FRIENDLY ERROR
  if (error) {
    return (
      <div className="p-8 text-center text-secondary">
         <span className="block text-red-500 font-bold mb-2">Error Loading Match</span>
         <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!match) return <div className="p-8 text-center text-secondary">Match not found.</div>;

  const { teams, scores, league, status } = match;
  const isLive = ["S1", "S2", "S3", "S4", "S5"].includes(status.short);
  
  const tabBase = "px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors";
  const activeClass = "border-blue-500 text-blue-600 dark:text-blue-400";
  const inactiveClass = "border-transparent text-secondary hover:text-primary";
  const statusBadgeStyle = isLive ? "bg-red-100 text-red-600 animate-pulse" : (isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600");

  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b theme-border flex flex-col items-center gap-6 relative overflow-hidden">
        <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
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
              {scores.home ?? "-"} : {scores.away ?? "-"}
            </div>
            <span className={`text-xs font-bold uppercase px-4 py-1.5 rounded-full border ${statusBadgeStyle}`}>
              {status.short}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <img src={teams.away.logo} alt={teams.away.name} className="w-20 h-20 object-contain" />
            <span className="text-lg font-bold text-primary leading-tight">{teams.away.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 border-b theme-border overflow-x-auto">
        {validTabs.map((t) => {
          const label = t === "h2h" ? "H2H" : t.charAt(0).toUpperCase() + t.slice(1);
          return (
            <Link
              key={t}
              href={`/match/volleyball/${matchId}/${t}`}
              replace
              prefetch={false}
              className={`${tabBase} ${activeTab === t ? activeClass : inactiveClass}`}
            >
              {label}
            </Link>
          );
        })}
      </div>


      {/* CONTENT */}
      <div className="min-h-[300px]">
        {activeTab === "summary" && <VolleyballSummary match={match} />}
        {activeTab === "h2h" && <VolleyballH2H teamOneId={teams.home.id} teamTwoId={teams.away.id} />}
        {activeTab === "standings" && <VolleyballStandings leagueId={league.id} teamId={teams.home.id} />}
        {activeTab === "odds" && <VolleyballOdds matchId={String(match.id)} />}
      </div>
    </div>
  );
}
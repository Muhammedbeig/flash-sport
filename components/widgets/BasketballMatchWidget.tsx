"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import BasketballSummary from "@/components/match/tabs/BasketballSummary";
import MatchH2H from "@/components/match/tabs/MatchH2H";

type BasketballMatch = {
  id: number;
  date: string;
  status: { short: string; long: string; elapsed: number | null };
  league: { id: number; name: string; country: string; logo: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  scores: {
    home: { quarter_1: number; quarter_2: number; quarter_3: number; quarter_4: number; over_time: number; total: number };
    away: { quarter_1: number; quarter_2: number; quarter_3: number; quarter_4: number; over_time: number; total: number };
  };
};

// Added initialTab prop
export default function BasketballMatchWidget({ matchId, initialTab }: { matchId: string, initialTab?: string }) {
  const { theme } = useTheme();
  const [match, setMatch] = useState<BasketballMatch | null>(null);
  const [loading, setLoading] = useState(true);
  
  const defaultTab = initialTab === "h2h" ? "h2h" : "summary";
  const [activeTab, setActiveTab] = useState<"summary" | "h2h">(defaultTab);

  const isDark = theme === "dark";

  // Sync URL tab
  useEffect(() => {
    if (initialTab && (initialTab === "summary" || initialTab === "h2h")) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    async function fetchMatch() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_BASKETBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.basketball.api-sports.io";

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/games?id=${matchId}`;
        } else {
          url = `https://${host}/games?id=${matchId}`;
          headers = {
            "x-rapidapi-host": host,
            "x-rapidapi-key": apiKey || "",
          };
        }

        const res = await fetch(url, { headers, next: { revalidate: 60 } });
        const json = await res.json();
        const data = json.response?.[0];

        if (data) {
          setMatch({
            id: data.id,
            date: data.date,
            status: {
              short: data.status.short,
              long: data.status.long,
              elapsed: data.status.timer,
            },
            league: {
              id: data.league.id,
              name: data.league.name,
              country: data.country?.name || data.league.country,
              logo: data.league.logo,
              season: data.league.season, 
            },
            teams: {
              home: {
                id: data.teams.home.id,
                name: data.teams.home.name,
                logo: data.teams.home.logo,
                winner: data.teams.home.winner,
              },
              away: {
                id: data.teams.away.id,
                name: data.teams.away.name,
                logo: data.teams.away.logo,
                winner: data.teams.away.winner,
              },
            },
            scores: data.scores, 
          });
        }
      } catch (err) {
        console.error("Basketball Match Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="theme-bg rounded-xl border theme-border p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex flex-col items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!match) {
    return <div className="p-8 text-center text-secondary">Match details not found.</div>;
  }

  const { teams, scores, league, status } = match;
  const isLive = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"].includes(status.short);

  const tabBase = "px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors";
  const activeClass = "border-blue-500 text-blue-600 dark:text-blue-400";
  const inactiveClass = "border-transparent text-secondary hover:text-primary";

  const leagueBadgeStyle = isDark
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : "bg-white text-slate-700 border-slate-200 shadow-sm";

  const statusBadgeStyle = isLive 
    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse border-red-200" 
    : (isDark 
        ? "bg-slate-800 text-slate-400 border-slate-700" 
        : "bg-slate-100 text-slate-600 border-slate-200");

  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b theme-border flex flex-col items-center gap-6 relative overflow-hidden">
        
        {/* League Badge */}
        <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${leagueBadgeStyle}`}>
          {league.logo && <img src={league.logo} className="w-4 h-4 object-contain" />}
          <span>{league.country}: {league.name}</span>
        </div>

        {/* Scoreboard */}
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
              {status.elapsed ? `${status.short} - ${status.elapsed}'` : status.long}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <img src={teams.away.logo} alt={teams.away.name} className="w-20 h-20 object-contain" />
            <span className="text-lg font-bold text-primary leading-tight">{teams.away.name}</span>
          </div>
        </div>
      </div>

      {/* TABS (Using Links) */}
      <div className="flex items-center gap-1 px-4 border-b theme-border">
        <Link 
          href={`/match?id=${matchId}&sport=basketball/summary`}
          replace={true}
          prefetch={false}
          className={`${tabBase} ${activeTab === "summary" ? activeClass : inactiveClass}`}
        >
          Summary
        </Link>
        <Link 
          href={`/match?id=${matchId}&sport=basketball/h2h`}
          replace={true}
          prefetch={false}
          className={`${tabBase} ${activeTab === "h2h" ? activeClass : inactiveClass}`}
        >
          H2H
        </Link>
      </div>

      {/* CONTENT */}
      <div className="min-h-[300px]">
        {activeTab === "summary" && <BasketballSummary match={match} />}
        {activeTab === "h2h" && <MatchH2H teamOneId={teams.home.id} teamTwoId={teams.away.id} sport="basketball" />}
      </div>
    </div>
  );
}
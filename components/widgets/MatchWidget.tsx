"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import MatchSummary from "@/components/match/tabs/MatchSummary";
import MatchStats from "@/components/match/tabs/MatchStats";
import MatchLineups from "@/components/match/tabs/MatchLineups";
import MatchH2H from "@/components/match/tabs/MatchH2H";
import BasketballMatchWidget from "./BasketballMatchWidget"; 
import NFLMatchWidget from "./NFLMatchWidget";
import BaseballMatchWidget from "./BaseballMatchWidget";
import HockeyMatchWidget from "./HockeyMatchWidget";
import RugbyMatchWidget from "./RugbyMatchWidget";
import VolleyballMatchWidget from "./VolleyballMatchWidget";

type MatchWidgetProps = {
  matchId: string | number;
  sport: string;
  initialTab?: string; // Added prop
};

type TabId = "summary" | "stats" | "lineups" | "h2h";

export default function MatchWidget({ matchId, sport, initialTab }: MatchWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const widgetTheme = isDark ? "flash-dark" : "flash-light";

  // 1. BASKETBALL HANDLER
  if (sport === "basketball") {
    // Pass initialTab to the basketball widget
    return <BasketballMatchWidget matchId={String(matchId)} initialTab={initialTab} />;
  }

  if (sport === "nfl") {
   return <NFLMatchWidget matchId={String(matchId)} initialTab={initialTab} />;
  }

  if (sport === "baseball") {
    return <BaseballMatchWidget matchId={String(matchId)} initialTab={initialTab} />;
  }

  if (sport === "hockey") {
  return <HockeyMatchWidget matchId={String(matchId)} initialTab={initialTab} />;
  }

  if (sport === "rugby") {
    return <RugbyMatchWidget matchId={String(matchId)} initialTab={initialTab} />;
  }

  if (sport === "volleyball") {
     return <VolleyballMatchWidget matchId={String(matchId)} initialTab={initialTab} />;
  }
  // 2. FALLBACK FOR OTHER SPORTS
  if (sport !== "football") {
    return (
      <div className="theme-bg rounded-xl border theme-border overflow-hidden min-h-[500px] p-4">
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <api-sports-widget
                data-type="game"
                data-game-id="${matchId}"
                data-sport="${sport}"
                data-theme="${widgetTheme}"
                data-show-toolbar="true"
                data-refresh="60"
              ></api-sports-widget>
            `,
          }}
        />
      </div>
    );
  }

  // 3. FOOTBALL LOGIC
  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize state from URL if present, otherwise default to summary
  const validTabs = ["summary", "stats", "lineups", "h2h"];
  const defaultTab = validTabs.includes(initialTab || "") ? (initialTab as TabId) : "summary";
  const [tab, setTab] = useState<TabId>(defaultTab);

  // Sync state if prop changes (e.g. user clicks Link)
  useEffect(() => {
    if (initialTab && validTabs.includes(initialTab)) {
      setTab(initialTab as TabId);
    }
  }, [initialTab]);

  useEffect(() => {
    async function loadFootball() {
      setLoading(true);
      try {
        const cdnFootball = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v3.football.api-sports.io";

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnFootball) {
          url = `${cdnFootball}/fixtures?id=${matchId}`;
        } else {
          url = `https://${host}/fixtures?id=${matchId}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();
        const raw = json.response?.[0];

        if (raw) {
          setMatch({
            id: raw.fixture.id,
            date: raw.fixture.date,
            status: raw.fixture.status,
            league: raw.league,
            teams: raw.teams,
            goals: raw.goals,
            score: raw.score,
            events: raw.events || [],
            lineups: raw.lineups || [],
            statistics: raw.statistics || [],
          });
        }
      } catch (err) {
        console.error("Football Match Error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (matchId) loadFootball();
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

  const { teams, goals, league, status } = match;
  const isLive = ["1H", "HT", "2H", "ET", "P", "BT"].includes(status.short);
  
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
              {goals.home ?? "-"} : {goals.away ?? "-"}
            </div>
            <span className={`text-xs font-bold uppercase px-4 py-1.5 rounded-full border ${statusBadgeStyle}`}>
              {status.elapsed ? `${status.elapsed}'` : status.short}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <img src={teams.away.logo} alt={teams.away.name} className="w-20 h-20 object-contain" />
            <span className="text-lg font-bold text-primary leading-tight">{teams.away.name}</span>
          </div>
        </div>
      </div>

      {/* TABS (Using Links) */}
      <div className="flex items-center gap-1 px-4 border-b theme-border overflow-x-auto no-scrollbar">
        {[
          { id: "summary", label: "Summary" },
          { id: "stats", label: "Stats" },
          { id: "lineups", label: "Lineups" },
          { id: "h2h", label: "H2H" },
        ].map((t) => {
          const isActive = tab === t.id;
          return (
            <Link
              key={t.id}
              href={`/match?id=${matchId}&sport=football/${t.id}`}
              replace={true}
              prefetch={false}
              className={`${tabBase} ${isActive ? activeClass : inactiveClass}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="min-h-[300px]">
        {tab === "summary" && <MatchSummary events={match.events} homeId={teams.home.id} awayId={teams.away.id} sport="football" />}
        {tab === "stats" && <MatchStats stats={match.statistics} />}
        {tab === "lineups" && (
          <MatchLineups matchId={matchId} sport="football" widgetTheme={widgetTheme} />
        )}
        {tab === "h2h" && <MatchH2H teamOneId={teams.home.id} teamTwoId={teams.away.id} sport="football" />}
      </div>
    </div>
  );
}
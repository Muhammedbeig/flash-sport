"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import FootballSummary from "@/components/match/tabs/FootballSummary";
import FootballH2H from "@/components/match/tabs/FootballH2H";
import FootballStandings from "@/components/match/tabs/FootballStandings";
import FootballOdds from "@/components/match/tabs/FootballOdds";
import FootballLineups from "@/components/match/tabs/FootballLineups";
import FootballStats from "@/components/match/tabs/FootballStats";
import { FootballScoreboardSkeleton } from "@/components/match/skeletons/FootballSkeletons";

export default function FootballMatchWidget({ matchId, initialTab }: { matchId: string; initialTab?: string }) {
  const { theme } = useTheme();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const validTabs = ["summary", "stats", "lineups", "h2h", "standings", "odds"];
  const defaultTab = initialTab && validTabs.includes(initialTab) ? initialTab : "summary";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const isDark = theme === "dark";
  const encodedId = encodeURIComponent(String(matchId));

  useEffect(() => {
    if (initialTab && validTabs.includes(initialTab)) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    async function fetchMatch() {
      setLoading(true);
      setApiError(null);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v3.football.api-sports.io";

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/fixtures?id=${matchId}`;
        } else {
          url = `https://${host}/fixtures?id=${matchId}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers, next: { revalidate: 60 } });
        const json = await res.json();

        if (json.errors && Object.keys(json.errors).length > 0) {
          const msg =
            typeof json.errors === "object" ? Object.values(json.errors).join(", ") : JSON.stringify(json.errors);
          setApiError(msg);
        }

        if (json.response && json.response[0]) {
          setMatch(json.response[0]);
        }
      } catch (err: any) {
        console.error(err);
        setApiError(err.message || "Failed to load match data");
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [matchId]);

  if (loading) return <FootballScoreboardSkeleton />;

  const teams = match?.teams || { home: {}, away: {} };
  const goals = match?.goals || { home: 0, away: 0 };
  const league = match?.league || {};
  const fixture = match?.fixture || {};
  const lineups = match?.lineups || [];
  const statistics = match?.statistics || [];

  const isLive = ["1H", "2H", "HT", "ET", "P"].includes(fixture?.status?.short);
  const statusBadgeStyle = isLive
    ? "bg-red-100 text-red-600 animate-pulse"
    : isDark
      ? "bg-slate-800 text-slate-400"
      : "bg-slate-100 text-slate-600";

  const tabBase = "px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap";
  const activeClass = "border-blue-500 text-blue-600 dark:text-blue-400";
  const inactiveClass = "border-transparent text-secondary hover:text-primary";

  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b theme-border flex flex-col items-center gap-6 relative overflow-hidden">
        {league.name && (
          <div
            className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
              isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
            }`}
          >
            {league.logo && <img src={league.logo} className="w-4 h-4 object-contain" />}
            <span>
              {league.country}: {league.name}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between w-full max-w-2xl mt-8">
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            {teams.home.logo && <img src={teams.home.logo} alt={teams.home.name} className="w-20 h-20 object-contain" />}
            <span className="text-lg font-bold text-primary leading-tight">{teams.home.name ?? "Home Team"}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-4xl font-black text-primary tracking-tight font-mono">
              {goals.home ?? "-"} : {goals.away ?? "-"}
            </div>
            <span className={`text-xs font-bold uppercase px-4 py-1.5 rounded-full border ${statusBadgeStyle}`}>
              {fixture?.status?.elapsed ? `${fixture.status.short} ${fixture.status.elapsed}'` : fixture?.status?.short ?? "NS"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            {teams.away.logo && <img src={teams.away.logo} alt={teams.away.name} className="w-20 h-20 object-contain" />}
            <span className="text-lg font-bold text-primary leading-tight">{teams.away.name ?? "Away Team"}</span>
          </div>
        </div>
      </div>

      {/* TABS (Path-based) */}
      <div className="flex items-center gap-1 px-4 border-b theme-border overflow-x-auto no-scrollbar">
        {validTabs.map((t) => {
          const label = t === "h2h" ? "H2H" : t.charAt(0).toUpperCase() + t.slice(1);
          return (
            <Link
              key={t}
              href={`/match/football/${encodedId}/${t}`}
              replace={true}
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
        {activeTab === "summary" && <FootballSummary match={match} error={apiError} />}
        {activeTab === "stats" && <FootballStats stats={statistics} />}
        {activeTab === "lineups" && <FootballLineups lineups={lineups} />}
        {activeTab === "h2h" && teams.home?.id && teams.away?.id && <FootballH2H teamOneId={teams.home.id} teamTwoId={teams.away.id} />}
        {activeTab === "standings" && league.id && <FootballStandings leagueId={league.id} season={league.season} teamId={teams.home.id} />}
        {activeTab === "odds" && fixture.id && <FootballOdds matchId={String(fixture.id)} />}
      </div>
    </div>
  );
}

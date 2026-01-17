"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

import RugbySummary from "@/components/match/tabs/RugbySummary";
import RugbyH2H from "@/components/match/tabs/RugbyH2H";
import RugbyStandings from "@/components/match/tabs/RugbyStandings";
import RugbyOdds from "@/components/match/tabs/RugbyOdds";
import { RugbyScoreboardSkeleton } from "@/components/match/skeletons/RugbySkeletons";

type RugbyMatch = {
  id: number;
  date: string;
  status: { short: string; long: string; elapsed: number | null };
  league: { id: number; name: string; country: string; logo: string; season?: string | number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  scores: { home: number | null; away: number | null };
  periods: any;
};

const VALID_TABS = ["summary", "h2h", "standings", "odds"] as const;
type ValidTab = (typeof VALID_TABS)[number];

function safeTab(tab?: string): ValidTab {
  const t = (tab || "").toLowerCase();
  return (VALID_TABS as readonly string[]).includes(t) ? (t as ValidTab) : "summary";
}

function safePositiveId(n: unknown): number | undefined {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

export default function RugbyMatchWidget({
  matchId,
  initialTab,
}: {
  matchId: string;
  initialTab?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const activeTab = useMemo(() => safeTab(initialTab), [initialTab]);

  const [match, setMatch] = useState<RugbyMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_RUGBY_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.rugby.api-sports.io";

        const cleanId = String(matchId ?? "").trim();
        if (!cleanId) {
          setMatch(null);
          return;
        }

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/games?id=${encodeURIComponent(cleanId)}`;
        } else {
          url = `https://${host}/games?id=${encodeURIComponent(cleanId)}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers } as RequestInit);
        const json = await res.json();
        const data = json?.response?.[0];

        if (!data) {
          setMatch(null);
          return;
        }

        setMatch({
          id: Number(data.id),
          date: String(data.date || ""),
          status: {
            short: String(data.status?.short || "NS"),
            long: String(data.status?.long || "Not Started"),
            elapsed: data.status?.timer ?? null,
          },
          league: {
            id: Number(data.league?.id),
            name: String(data.league?.name || ""),
            country: String(data.country?.name || data.league?.country || "World"),
            logo: String(data.league?.logo || ""),
            season: data.league?.season,
          },
          teams: {
            home: {
              id: Number(data.teams?.home?.id),
              name: String(data.teams?.home?.name || ""),
              logo: String(data.teams?.home?.logo || ""),
              winner: data.teams?.home?.winner ?? null,
            },
            away: {
              id: Number(data.teams?.away?.id),
              name: String(data.teams?.away?.name || ""),
              logo: String(data.teams?.away?.logo || ""),
              winner: data.teams?.away?.winner ?? null,
            },
          },
          scores: {
            home: data.scores?.home ?? null,
            away: data.scores?.away ?? null,
          },
          periods: data.periods,
        });
      } catch (err) {
        console.error("Rugby Match Error:", err);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [matchId]);

  if (loading) return <RugbyScoreboardSkeleton />;
  if (!match) return <div className="p-8 text-center text-secondary">Match not found.</div>;

  const { teams, scores, league, status } = match;
  const isLive = ["H1", "H2", "HT", "ET"].includes(status.short);

  const tabBase =
    "px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap";
  const activeClass = "border-blue-500 text-blue-600 dark:text-blue-400";
  const inactiveClass = "border-transparent text-secondary hover:text-primary";

  const statusBadgeStyle = isLive
    ? "bg-red-100 text-red-600 animate-pulse"
    : isDark
      ? "bg-slate-800 text-slate-400"
      : "bg-slate-100 text-slate-600";

  const leagueBadgeStyle = isDark
    ? "bg-slate-800 border-slate-700 text-slate-300"
    : "bg-white border-slate-200 text-slate-700";

  const safeMatchId = encodeURIComponent(String(matchId).trim());

  const teamHighlightId = safePositiveId(teams.home.id);

  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b theme-border flex flex-col items-center gap-6 relative overflow-hidden">
        <div
          className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${leagueBadgeStyle}`}
        >
          {league.logo && <img src={league.logo} className="w-4 h-4 object-contain" alt="" />}
          <span>
            {league.country}: {league.name}
          </span>
        </div>

        <div className="flex items-center justify-between w-full max-w-2xl mt-8">
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            {teams.home.logo && (
              <img src={teams.home.logo} alt={teams.home.name} className="w-20 h-20 object-contain" />
            )}
            <span className="text-lg font-bold text-primary leading-tight">{teams.home.name}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-4xl font-black text-primary tracking-tight font-mono">
              {scores.home ?? "-"} : {scores.away ?? "-"}
            </div>
            <span className={`text-xs font-bold uppercase px-4 py-1.5 rounded-full border ${statusBadgeStyle}`}>
              {status.elapsed ? `${status.short} - ${status.elapsed}'` : status.short}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            {teams.away.logo && (
              <img src={teams.away.logo} alt={teams.away.name} className="w-20 h-20 object-contain" />
            )}
            <span className="text-lg font-bold text-primary leading-tight">{teams.away.name}</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 px-4 border-b theme-border overflow-x-auto no-scrollbar">
        {VALID_TABS.map((t) => (
          <Link
            key={t}
            href={`/match/rugby/${safeMatchId}/${t}`}
            prefetch={false}
            className={`${tabBase} ${activeTab === t ? activeClass : inactiveClass}`}
          >
            {t === "h2h" ? "H2H" : t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </div>

      {/* CONTENT */}
      <div className="min-h-[300px] w-full p-4" key={activeTab}>
        {activeTab === "summary" && <RugbySummary match={match} />}

        {activeTab === "h2h" && safePositiveId(teams.home.id) && safePositiveId(teams.away.id) && (
          <RugbyH2H teamOneId={teams.home.id} teamTwoId={teams.away.id} />
        )}

        {activeTab === "standings" && league.id ? (
          <RugbyStandings leagueId={league.id} teamId={teamHighlightId} />
        ) : null}

        {activeTab === "odds" && <RugbyOdds matchId={String(match.id)} />}
      </div>
    </div>
  );
}

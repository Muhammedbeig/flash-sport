"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

import NFLSummary from "@/components/match/tabs/NFLSummary";
import NFLH2H from "@/components/match/tabs/NFLH2H";
import NFLStandings from "@/components/match/tabs/NFLStandings";
import NFLOdds from "@/components/match/tabs/NFLOdds";
import { NFLScoreboardSkeleton } from "@/components/match/skeletons/NFLSkeletons";

type NFLScore = {
  quarter_1?: number | null;
  quarter_2?: number | null;
  quarter_3?: number | null;
  quarter_4?: number | null;
  overtime?: number | null;
  total?: number | null;
};

type NFLMatch = {
  id: number;
  date: string;
  status: { short: string; long: string; elapsed: number | null };
  league: { id: number; name: string; country: string; logo: string; season?: string | number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  scores: {
    home: NFLScore;
    away: NFLScore;
  };
};

const VALID_TABS = ["summary", "h2h", "standings", "odds"] as const;
type ValidTab = (typeof VALID_TABS)[number];

function safeTab(tab?: string): ValidTab {
  const t = (tab || "").toLowerCase();
  return (VALID_TABS as readonly string[]).includes(t) ? (t as ValidTab) : "summary";
}

function seasonFromDateISO(dateISO?: string): string | undefined {
  if (!dateISO || typeof dateISO !== "string" || dateISO.length < 4) return undefined;
  const y = dateISO.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : undefined;
}

function currentYearString(): string {
  return String(new Date().getUTCFullYear());
}

export default function NFLMatchWidget({
  matchId,
  initialTab,
}: {
  matchId: string;
  initialTab?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const activeTab = useMemo(() => safeTab(initialTab), [initialTab]);

  const [match, setMatch] = useState<NFLMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_NFL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.american-football.api-sports.io";

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

        const res = await fetch(url, { headers });
        const json = await res.json();
        const data = json?.response?.[0];

        if (!data) {
          setMatch(null);
          return;
        }

        const game = data.game || data;
        const league = data.league || {};
        const teams = data.teams || {};
        const scores = data.scores || {};

        const homeScore =
          typeof scores?.home === "object"
            ? { ...scores.home, total: scores.home?.total ?? null }
            : { total: scores?.home ?? null };

        const awayScore =
          typeof scores?.away === "object"
            ? { ...scores.away, total: scores.away?.total ?? null }
            : { total: scores?.away ?? null };

        const leagueCountry =
          league?.country?.name || league?.country || data?.country?.name || data?.country || "USA";

        const mapped: NFLMatch = {
          id: Number(game.id),
          date: String(game.date || ""),
          status: {
            short: String(game.status?.short || "NS"),
            long: String(game.status?.long || "Not Started"),
            elapsed: game.status?.timer ?? null,
          },
          league: {
            id: Number(league.id),
            name: String(league.name || ""),
            country: String(leagueCountry),
            logo: String(league.logo || ""),
            season: league.season ?? seasonFromDateISO(game.date),
          },
          teams: {
            home: {
              id: Number(teams?.home?.id),
              name: String(teams?.home?.name || ""),
              logo: String(teams?.home?.logo || ""),
              winner: teams?.home?.winner ?? null,
            },
            away: {
              id: Number(teams?.away?.id),
              name: String(teams?.away?.name || ""),
              logo: String(teams?.away?.logo || ""),
              winner: teams?.away?.winner ?? null,
            },
          },
          scores: {
            home: homeScore,
            away: awayScore,
          },
        };

        setMatch(mapped);
      } catch (err) {
        console.error("NFL Match Error:", err);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [matchId]);

  if (loading) return <NFLScoreboardSkeleton />;
  if (!match) return <div className="p-8 text-center text-secondary">Match not found.</div>;

  const { teams, scores, league, status } = match;
  const isLive = ["Q1", "Q2", "Q3", "Q4", "OT"].includes(status.short);

  const tabBase =
    "px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap";
  const activeClass = "border-blue-500 text-blue-600 dark:text-blue-400";
  const inactiveClass = "border-transparent text-secondary hover:text-primary";

  const leagueBadgeStyle = isDark
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : "bg-white text-slate-700 border-slate-200 shadow-sm";

  const statusBadgeStyle = isLive
    ? "bg-red-100 text-red-600 animate-pulse"
    : isDark
      ? "bg-slate-800 text-slate-400"
      : "bg-slate-100 text-slate-600";

  const safeMatchId = encodeURIComponent(String(matchId).trim());

  // ✅ FIX: must be string|number always (never undefined)
  const seasonSafe: string | number =
    (league.season ?? seasonFromDateISO(match.date) ?? currentYearString());

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
              {scores.home?.total ?? "-"} : {scores.away?.total ?? "-"}
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

      {/* TABS (SEO PATH ROUTES) */}
      <div className="flex items-center gap-1 px-4 border-b theme-border overflow-x-auto no-scrollbar">
        {VALID_TABS.map((t) => {
          const label = t === "h2h" ? "H2H" : t.charAt(0).toUpperCase() + t.slice(1);
          return (
            <Link
              key={t}
              href={`/match/nfl/${safeMatchId}/${t}`}
              prefetch={false}
              className={`${tabBase} ${activeTab === t ? activeClass : inactiveClass}`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="min-h-[300px] w-full p-4">
        {activeTab === "summary" && <NFLSummary match={match} />}

        {activeTab === "h2h" && teams.home.id && teams.away.id && (
          <NFLH2H teamOneId={teams.home.id} teamTwoId={teams.away.id} />
        )}

        {activeTab === "standings" && league.id ? (
          <NFLStandings leagueId={league.id} season={seasonSafe} />
        ) : null}

        {activeTab === "odds" && <NFLOdds matchId={String(match.id)} />}
      </div>
    </div>
  );
}

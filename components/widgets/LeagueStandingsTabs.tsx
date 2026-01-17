"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";

// ---- TYPES FROM API-FOOTBALL ----
type ApiTeam = {
  id: number;
  name: string;
  logo: string;
};

type ApiAllStats = {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: { for: number; against: number };
};

type ApiStandingRow = {
  rank: number;
  team: ApiTeam;
  points: number;
  goalsDiff: number;
  form: string | null;
  all: ApiAllStats;
};

type ApiStandingsResponse = {
  league: {
    id: number;
    name: string;
    season: number;
    standings: ApiStandingRow[][];
  };
};

type StandingsTabsProps = {
  leagueId: number | string;
  season?: number;
  sport?: string; // mainly football, but kept for future
};

type InnerTab = "table" | "form";

export default function LeagueStandingsTabs({
  leagueId,
  season,
  sport = "football",
}: StandingsTabsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<InnerTab>("table");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ApiStandingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericSeason = season || new Date().getFullYear();

  useEffect(() => {
    async function loadStandings() {
      if (!leagueId) return;
      setLoading(true);
      setError(null);

      try {
        const cdnFootball = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

        const hostMap: Record<string, string> = {
          football: "v3.football.api-sports.io",
        };
        const apiHost = hostMap[sport] || hostMap.football;

        let url = "";
        let headers: Record<string, string> = {};

        if (sport === "football" && cdnFootball) {
          url = `${cdnFootball}/standings?league=${leagueId}&season=${numericSeason}`;
        } else {
          if (!apiKey) throw new Error("Missing API key");
          url = `https://${apiHost}/standings?league=${leagueId}&season=${numericSeason}`;
          headers = {
            "x-rapidapi-host": apiHost,
            "x-rapidapi-key": apiKey,
          };
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        const first: ApiStandingsResponse | undefined = json.response?.[0];
        const group = first?.league?.standings?.[0];

        if (!group || !Array.isArray(group) || group.length === 0) {
          setRows(null);
        } else {
          setRows(group);
        }
      } catch (err: any) {
        console.error("Standings fetch error:", err);
        setError("Standings not available for this league.");
        setRows(null);
      } finally {
        setLoading(false);
      }
    }

    loadStandings();
  }, [leagueId, numericSeason, sport]);

  const tabBase =
    "px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors";
  const activeTabClass = isDark
    ? "bg-slate-900 border-slate-700 text-blue-400"
    : "bg-blue-50 border-blue-500 text-blue-700";
  const inactiveTabClass = isDark
    ? "bg-transparent border-transparent text-secondary hover:bg-slate-900/60"
    : "bg-transparent border-transparent text-secondary hover:bg-slate-100";

  // ---------- TABLE RENDER ----------

  const renderTable = () => {
    if (loading) {
      return (
        <div className="p-4 space-y-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (error || !rows || rows.length === 0) {
      return (
        <div className="p-8 text-center text-secondary text-sm">
          {error || "Standings not available for this league."}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className={isDark ? "bg-slate-900/70" : "bg-slate-50"}>
              <th className="text-left px-3 py-2 font-semibold text-secondary w-10">
                #
              </th>
              <th className="text-left px-3 py-2 font-semibold text-secondary">
                Team
              </th>
              <th className="text-center px-2 py-2 font-semibold text-secondary">
                MP
              </th>
              <th className="text-center px-2 py-2 font-semibold text-secondary">
                W
              </th>
              <th className="text-center px-2 py-2 font-semibold text-secondary">
                D
              </th>
              <th className="text-center px-2 py-2 font-semibold text-secondary">
                L
              </th>
              <th className="text-center px-2 py-2 font-semibold text-secondary">
                GF
              </th>
              <th className="text-center px-2 py-2 font-semibold text-secondary">
                GA
              </th>
              <th className="text-center px-2 py-2 font-semibold text-secondary">
                GD
              </th>
              <th className="text-center px-3 py-2 font-semibold text-secondary">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.team.id}
                className={
                  isDark
                    ? "border-t border-slate-800 hover:bg-slate-900"
                    : "border-t border-slate-100 hover:bg-slate-50"
                }
              >
                <td className="px-3 py-2 text-[11px] text-secondary">
                  {row.rank}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={row.team.logo}
                      alt={row.team.name}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-xs font-medium text-primary">
                      {row.team.name}
                    </span>
                  </div>
                </td>
                <td className="text-center px-2 py-2 text-[11px]">
                  {row.all.played}
                </td>
                <td className="text-center px-2 py-2 text-[11px]">
                  {row.all.win}
                </td>
                <td className="text-center px-2 py-2 text-[11px]">
                  {row.all.draw}
                </td>
                <td className="text-center px-2 py-2 text-[11px]">
                  {row.all.lose}
                </td>
                <td className="text-center px-2 py-2 text-[11px]">
                  {row.all.goals.for}
                </td>
                <td className="text-center px-2 py-2 text-[11px]">
                  {row.all.goals.against}
                </td>
                <td className="text-center px-2 py-2 text-[11px]">
                  {row.goalsDiff}
                </td>
                <td className="text-center px-3 py-2 text-[11px] font-bold text-primary">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ---------- FORM RENDER ----------

  const formRows = useMemo(() => {
    if (!rows) return [];
    return rows.map((row) => {
      const form = (row.form || "").replace(/[^WDL]/g, "");
      const last5 = form.slice(-5);
      return { ...row, formString: last5 };
    });
  }, [rows]);

  const renderForm = () => {
    if (loading) {
      return (
        <div className="p-4 space-y-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (error || !rows || rows.length === 0) {
      return (
        <div className="p-8 text-center text-secondary text-sm">
          {error || "Form data not available for this league."}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className={isDark ? "bg-slate-900/70" : "bg-slate-50"}>
              <th className="text-left px-3 py-2 font-semibold text-secondary w-10">
                #
              </th>
              <th className="text-left px-3 py-2 font-semibold text-secondary">
                Team
              </th>
              <th className="text-center px-3 py-2 font-semibold text-secondary">
                Last 5
              </th>
              <th className="text-center px-3 py-2 font-semibold text-secondary">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {formRows.map((row) => (
              <tr
                key={row.team.id}
                className={
                  isDark
                    ? "border-t border-slate-800 hover:bg-slate-900"
                    : "border-t border-slate-100 hover:bg-slate-50"
                }
              >
                <td className="px-3 py-2 text-[11px] text-secondary">
                  {row.rank}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={row.team.logo}
                      alt={row.team.name}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-xs font-medium text-primary">
                      {row.team.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 justify-center">
                    {row.formString.split("").map((c, idx) => {
                      const label =
                        c === "W" ? "Win" : c === "D" ? "Draw" : "Loss";
                      const bg =
                        c === "W"
                          ? "bg-emerald-500"
                          : c === "D"
                          ? "bg-amber-400"
                          : "bg-rose-500";
                      return (
                        <span
                          key={idx}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${bg}`}
                          title={label}
                        >
                          {c}
                        </span>
                      );
                    })}
                    {row.formString.length === 0 && (
                      <span className="text-[11px] text-secondary">
                        No data
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-center px-3 py-2 text-[11px] font-bold text-primary">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ---------- RENDER ----------

  return (
    <div className="theme-bg border theme-border rounded-xl overflow-hidden">
      {/* HEADER TABS */}
      <div
        className={
          isDark
            ? "px-4 py-3 border-b border-slate-800 flex items-center justify-between"
            : "px-4 py-3 border-b border-slate-200 flex items-center justify-between"
        }
      >
        <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest">
          <span>Standings</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`${tabBase} ${
              activeTab === "table" ? activeTabClass : inactiveTabClass
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`${tabBase} ${
              activeTab === "form" ? activeTabClass : inactiveTabClass
            }`}
          >
            Form
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3 pt-2">
        {activeTab === "table" && renderTable()}
        {activeTab === "form" && renderForm()}
      </div>
    </div>
  );
}

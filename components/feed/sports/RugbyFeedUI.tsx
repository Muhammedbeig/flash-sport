"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import DateDropdown from "@/components/feed/DateDropdown";
import { NormalizedGame, NormalizedLeague } from "../utils";

// --- RUGBY STATUS CODES ---
const FINISHED_CODES = ["FT", "AET", "POST", "CANC", "SUSP", "AWD", "ABD", "Final"];
const SCHEDULED_CODES = ["NS", "TBD"];
const LIVE_CODES = ["1H", "HT", "2H", "ET", "BT", "PT", "AW"];

function utcTodayYMD() {
  return new Date().toISOString().split("T")[0];
}
function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}
function gameYMD(d: unknown) {
  if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
  try {
    return new Date(d as any).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

type RugbyFeedUIProps = {
  games: NormalizedGame[];
  loading: boolean;
  leagueId?: string;
  initialTab?: string;
};

function safeMatchHref(gameId: unknown) {
  if (gameId === null || gameId === undefined) return null;
  const id = String(gameId).trim();
  if (!id) return null;
  return `/match/rugby/${encodeURIComponent(id)}/summary`;
}

const RugbyLeagueGroup = ({
  meta,
  games,
  matchRowBase,
  matchRowInactive,
  isDark,
}: {
  meta: NormalizedLeague;
  games: NormalizedGame[];
  matchRowBase: string;
  matchRowInactive: string;
  isDark: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    // FIX 1: Explicit flex-col for the wrapper
    <div className="flex flex-col border-b theme-border last:border-0">
      <div
        onClick={() => setIsOpen((v) => !v)}
        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
          isDark ? "bg-slate-900/50 hover:bg-slate-900" : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          {meta.flag && <img src={meta.flag} alt={meta.country} className="w-4 h-4 object-contain" />}
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            {meta.country} : {meta.name}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* FIX 2: Explicit flex-col for the list container instead of 'block' */}
      <div className={`divide-y theme-border ${isOpen ? "flex flex-col" : "hidden"}`}>
        {games.map((game) => {
          const href = safeMatchHref(game?.id);
          if (!href) return null;

          const isLive = LIVE_CODES.includes(game.status.short);
          const statusColor = isLive ? "text-[#dc2626]" : "text-secondary";

          const dateObj = new Date(game.date);
          const time = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

          const displayStatus = isLive
            ? game.status.elapsed
              ? `${game.status.short} ${game.status.elapsed}'`
              : game.status.short
            : SCHEDULED_CODES.includes(game.status.short)
              ? time
              : game.status.short;

          return (
            <Link
              key={game.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className={`${matchRowBase} ${matchRowInactive}`}
            >
              <div className={`w-14 text-center text-xs font-bold ${statusColor} shrink-0`}>{displayStatus}</div>

              {/* FIX 3: Explicit flex-col and gap for the teams container instead of space-y */}
              <div className="flex-1 px-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {game.teams.home.logo && (
                      <img src={game.teams.home.logo} className="w-5 h-5 object-contain" alt="" />
                    )}
                    <span
                      className={`text-sm ${
                        game.teams.home.winner ? "font-bold text-primary" : "font-medium text-secondary"
                      }`}
                    >
                      {game.teams.home.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">{game.scores.home ?? "-"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {game.teams.away.logo && (
                      <img src={game.teams.away.logo} className="w-5 h-5 object-contain" alt="" />
                    )}
                    <span
                      className={`text-sm ${
                        game.teams.away.winner ? "font-bold text-primary" : "font-medium text-secondary"
                      }`}
                    >
                      {game.teams.away.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">{game.scores.away ?? "-"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default function RugbyFeedUI({ games, loading, leagueId, initialTab }: RugbyFeedUIProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const router = useRouter();
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const activeTab = (initialTab || "all").toLowerCase();

  const rawUrlDate = searchParams.get("date");
  const urlDate = isValidYMD(rawUrlDate) ? (rawUrlDate as string) : null;
  const urlHasFilterDate = !!urlDate;

  const pickerDate = activeTab === "today" ? today : urlHasFilterDate ? (urlDate as string) : today;

  const matchRowBase =
    "flex items-center justify-between px-3 py-3 rounded-lg text-sm border-l-4 transition-all duration-200 group cursor-pointer";
  const matchRowInactive = isDark
    ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
    : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

  const getTabStyle = (tab: string) => {
    const isActive = activeTab === tab;
    if (isActive && tab === "live") return "bg-[#dc2626] text-white shadow-sm";
    if (isActive) return "bg-[#0f80da] text-white shadow-sm";
    return isDark
      ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
      : "bg-gray-100 text-slate-600 hover:bg-gray-200";
  };

  const basePathForTab = (tabId: string) =>
    leagueId ? `/sports/rugby/${tabId}/league/${leagueId}` : `/sports/rugby/${tabId}`;

  const getTabUrl = (tabId: string) => {
    const base = basePathForTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sport");
    params.delete("league");

    if (tabId === "today") {
      params.delete("date");
    } else {
      if (urlHasFilterDate) params.set("date", urlDate as string);
      else params.delete("date");
    }

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const applyCalendarDate = (pickedYMD: string) => {
    if (!isValidYMD(pickedYMD)) return;

    if (activeTab === "today") {
      if (pickedYMD === today) {
        router.push(basePathForTab("today"));
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete("sport");
      params.delete("league");
      params.set("date", pickedYMD);
      router.push(`${basePathForTab("all")}?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("sport");
    params.delete("league");
    params.set("date", pickedYMD);
    router.push(`${basePathForTab(activeTab)}?${params.toString()}`);
  };

  const dateFilteredGames = useMemo(() => {
    if (activeTab === "today") return games.filter((g) => gameYMD(g.date) === today);
    if (urlHasFilterDate) return games.filter((g) => gameYMD(g.date) === (urlDate as string));
    return games;
  }, [activeTab, games, today, urlHasFilterDate, urlDate]);

  const filteredGames = dateFilteredGames.filter((g) => {
    const s = g.status.short;

    if (activeTab === "today") return LIVE_CODES.includes(s) || FINISHED_CODES.includes(s);
    if (activeTab === "finished") return FINISHED_CODES.includes(s);
    if (activeTab === "scheduled") return SCHEDULED_CODES.includes(s);
    if (activeTab === "live") return LIVE_CODES.includes(s);

    return true;
  });

  const grouped = filteredGames.reduce<Record<string, { meta: NormalizedLeague; games: NormalizedGame[] }>>(
    (groups, game) => {
      const key = `${game.league.country || "World"}-${game.league.name}`;
      if (!groups[key]) groups[key] = { meta: game.league, games: [] };
      groups[key].games.push(game);
      return groups;
    },
    {}
  );

  const liveCount = games.filter((g) => LIVE_CODES.includes(g.status.short)).length;

  if (loading) return <Skeleton className="w-full h-96 rounded-xl bg-skeleton" />;

  return (
    // FIX 4: Explicit flex-col for the root container
    <div className="w-full flex flex-col gap-4">
      {/* FIX 5: Explicit flex-col for the filter section */}
      <div className="pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All" },
              { id: "live", label: `Live (${liveCount})`, hasDot: true },
              { id: "today", label: "Today" },
              { id: "finished", label: "Finished" },
              { id: "scheduled", label: "Scheduled" },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={getTabUrl(tab.id)}
                prefetch={false}
                className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${getTabStyle(
                  tab.id
                )}`}
              >
                {tab.hasDot && activeTab === "live" && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block shrink-0">
            <DateDropdown valueYMD={pickerDate} todayYMD={today} onSelect={applyCalendarDate} />
          </div>
        </div>

        <div className="md:hidden w-full">
          <DateDropdown valueYMD={pickerDate} todayYMD={today} onSelect={applyCalendarDate} fullWidth />
        </div>
      </div>

      <div className="theme-bg rounded-xl border theme-border overflow-hidden shadow-sm flex flex-col">
        {Object.values(grouped).map(({ meta, games: leagueGames }) => (
          <RugbyLeagueGroup
            key={`${meta.country}-${meta.name}`}
            meta={meta}
            games={leagueGames}
            matchRowBase={matchRowBase}
            matchRowInactive={matchRowInactive}
            isDark={isDark}
          />
        ))}

        {filteredGames.length === 0 && (
          <div className="p-8 text-center text-secondary">No matches found for this category today.</div>
        )}
      </div>
    </div>
  );
}
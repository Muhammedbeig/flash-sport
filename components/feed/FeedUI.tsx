"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import LeagueTabs from "@/components/widgets/LeagueTabs";
import { NormalizedGame, NormalizedLeague } from "./utils";

const LEAGUE_WIDGET_SPORTS = [
  "football",
  "afl",
  "baseball",
  "basketball",
  "handball",
  "hockey",
  "nfl",
  "rugby",
  "volleyball",
];

const finishedCodes = [
  "FT",
  "AET",
  "PEN",
  "POST",
  "CANC",
  "ABD",
  "AWD",
  "WO",
  "FO",
  "Ended",
  "Final",
];

const scheduledCodes = ["NS", "TBD", "Not Started", "Scheduled", "Pre-game"];

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

// --- COLLAPSIBLE LEAGUE GROUP ---
const LeagueGroup = ({
  meta,
  games,
  sport,
  matchRowBase,
  matchRowInactive,
  isDark,
}: {
  meta: NormalizedLeague;
  games: NormalizedGame[];
  sport: string;
  matchRowBase: string;
  matchRowInactive: string;
  isDark: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const safeSport = encodeURIComponent(String(sport || "football"));
  const makeMatchHref = (id: unknown) => {
    const raw = typeof id === "number" ? String(id) : String(id ?? "").trim();
    if (!raw) return null;
    return `/match/${safeSport}/${encodeURIComponent(raw)}/summary`;
  };

  return (
    <div className="border-b theme-border last:border-0">
      <div
        onClick={() => setIsOpen(!isOpen)}
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

      <div className={`divide-y theme-border ${isOpen ? "block" : "hidden"}`}>
        {games.map((game) => {
          const isLive =
            !finishedCodes.includes(game.status.short) && !scheduledCodes.includes(game.status.short);

          const statusColor = isLive ? "text-[#dc2626]" : "text-secondary";
          const dateObj = new Date(game.date);
          const time = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

          const displayStatus = isLive
            ? game.status.elapsed
              ? `${game.status.elapsed}'`
              : "LIVE"
            : scheduledCodes.includes(game.status.short)
                ? time
                : game.status.short;

          const href = makeMatchHref(game.id);

          const RowInner = (
            <>
              <div className={`w-12 text-center text-xs font-bold ${statusColor} shrink-0`}>{displayStatus}</div>

              <div className="flex-1 px-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {game.teams.home.logo && <img src={game.teams.home.logo} className="w-5 h-5 object-contain" />}
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
                    {game.teams.away.logo && <img src={game.teams.away.logo} className="w-5 h-5 object-contain" />}
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

              <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
            </>
          );

          if (!href) {
            return (
              <div key={String(game.id)} className={`${matchRowBase} ${matchRowInactive}`} aria-disabled>
                {RowInner}
              </div>
            );
          }

          return (
            <Link
              key={game.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className={`${matchRowBase} ${matchRowInactive}`}
            >
              {RowInner}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

type FeedUIProps = {
  games: NormalizedGame[];
  loading: boolean;
  sport: string;
  leagueId?: string;
  initialTab?: string;
};

export default function FeedUI({ games, loading, sport, leagueId, initialTab }: FeedUIProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const router = useRouter();
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const urlDate = searchParams.get("date");
  const hasUrlDate = isValidYMD(urlDate);

  const activeTab = (initialTab || "all").toLowerCase();

  // IMPORTANT RULE:
  // - Today tab ALWAYS means real today and ignores url date
  // - other tabs use url date only when calendar applied
  const effectiveDate = activeTab === "today" ? today : hasUrlDate ? (urlDate as string) : today;

  // Use a pending date so month navigation doesn't instantly refresh.
  const [pendingDate, setPendingDate] = useState(effectiveDate);

  const safeSport = encodeURIComponent(String(sport || "football"));
  const safeLeague = leagueId ? encodeURIComponent(String(leagueId)) : undefined;

  const canShowLeagueTabs = !!leagueId && LEAGUE_WIDGET_SPORTS.includes(String(sport).toLowerCase());

  const getTabPath = (tabId: string) => {
    if (safeLeague) return `/sports/${safeSport}/${tabId}/league/${safeLeague}`;
    return `/sports/${safeSport}/${tabId}`;
  };

  // Keep ?date only if it already exists in the URL (i.e. user applied calendar before)
  const maybeWithDate = (basePath: string) => {
    if (!hasUrlDate) return basePath;
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", effectiveDate);
    return `${basePath}?${params.toString()}`;
  };

  const applyDateFilter = () => {
    if (!pendingDate) return;

    // If user picks today => REMOVE date param (clean URL)
    if (pendingDate === today) {
      if (activeTab === "today") {
        router.push(getTabPath("today")); // no ?date
      } else {
        router.push(getTabPath(activeTab)); // no ?date
      }
      return;
    }

    // If user is on Today and applies some other date => switch to ALL + ?date
    const nextTab = activeTab === "today" ? "all" : activeTab;

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", pendingDate);
    router.push(`${getTabPath(nextTab)}?${params.toString()}`);
  };

  // FIRST apply date filtering (this makes calendar actually work)
  const dateFilteredGames = useMemo(() => {
    // Today tab must show ONLY current date
    if (activeTab === "today") return games.filter((g) => gameYMD(g.date) === today);

    // If url has date => filter to that date
    if (hasUrlDate) return games.filter((g) => gameYMD(g.date) === (urlDate as string));

    // no url date => don't force filter here (keep existing behavior)
    return games;
  }, [activeTab, games, hasUrlDate, today, urlDate]);

  // THEN apply tab filtering
  const filteredGames = dateFilteredGames.filter((g) => {
    const s = g.status.short;

    if (activeTab === "today") {
      // Today must show ONLY live + finished -> exclude scheduled
      return !scheduledCodes.includes(s);
    }

    if (activeTab === "finished") return finishedCodes.includes(s);
    if (activeTab === "scheduled") return scheduledCodes.includes(s);
    if (activeTab === "live") return !finishedCodes.includes(s) && !scheduledCodes.includes(s);

    return true; // all
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

  const liveCount = games.filter(
    (g) => !finishedCodes.includes(g.status.short) && !scheduledCodes.includes(g.status.short)
  ).length;

  if (loading) return <Skeleton className="w-full h-96 rounded-xl bg-skeleton" />;

  const getTabStyle = (isActive: boolean, tabId?: string) => {
    if (isActive && tabId === "live") return "bg-[#dc2626] text-white shadow-sm";
    if (isActive) return "bg-[#0f80da] text-white shadow-sm";
    return isDark
      ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
      : "bg-gray-100 text-slate-600 hover:bg-gray-200";
  };

  const matchRowBase =
    "flex items-center justify-between px-3 py-3 rounded-lg text-sm border-l-4 transition-all duration-200 group cursor-pointer";
  const matchRowInactive = isDark
    ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
    : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

  const dateInputClass = isDark
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : "bg-gray-100 text-slate-600 border-gray-200";

  const showApply = pendingDate !== effectiveDate;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Order required: All / Live / Today / Finished / Scheduled */}
          <Link
            href={maybeWithDate(getTabPath("all"))}
            prefetch={false}
            className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${getTabStyle(
              activeTab === "all",
              "all"
            )}`}
          >
            All
          </Link>

          <Link
            href={maybeWithDate(getTabPath("live"))}
            prefetch={false}
            className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${getTabStyle(
              activeTab === "live",
              "live"
            )}`}
          >
            {activeTab === "live" && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            Live ({liveCount})
          </Link>

          {/* Today must NEVER carry ?date */}
          <Link
            href={getTabPath("today")}
            prefetch={false}
            className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${getTabStyle(
              activeTab === "today",
              "today"
            )}`}
          >
            Today
          </Link>

          <Link
            href={maybeWithDate(getTabPath("finished"))}
            prefetch={false}
            className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${getTabStyle(
              activeTab === "finished",
              "finished"
            )}`}
          >
            Finished
          </Link>

          <Link
            href={maybeWithDate(getTabPath("scheduled"))}
            prefetch={false}
            className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${getTabStyle(
              activeTab === "scheduled",
              "scheduled"
            )}`}
          >
            Scheduled
          </Link>
        </div>

        {/* Calendar + Apply (same style, minimal) */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="date"
            value={pendingDate}
            onChange={(e) => setPendingDate(e.target.value)}
            className={`h-9 px-3 rounded-md text-xs font-bold border transition-colors focus:outline-none ${dateInputClass}`}
          />

          {showApply && (
            <button
              type="button"
              onClick={applyDateFilter}
              className={`h-9 px-4 rounded-md text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${getTabStyle(
                false
              )}`}
            >
              Apply
            </button>
          )}
        </div>
      </div>

      <div className="theme-bg rounded-xl border theme-border overflow-hidden shadow-sm">
        {Object.values(grouped).map(({ meta, games: leagueGames }) => (
          <LeagueGroup
            key={`${meta.country}-${meta.name}`}
            meta={meta}
            games={leagueGames}
            sport={sport}
            matchRowBase={matchRowBase}
            matchRowInactive={matchRowInactive}
            isDark={isDark}
          />
        ))}

        {filteredGames.length === 0 && (
          <div className="p-4">
            {canShowLeagueTabs ? (
              <LeagueTabs sport={sport} leagueId={leagueId!} />
            ) : (
              <div className="p-8 text-center text-secondary">No matches found for this category.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

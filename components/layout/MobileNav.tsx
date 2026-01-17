"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Clock, Activity, Search } from "lucide-react";

import MobileSearch from "../search/MobileSearch";

type SportKey = string;

function getSportFromPathname(pathname: string | null | undefined): SportKey | null {
  if (!pathname) return null;

  const sportsMatch = pathname.match(/^\/sports\/([^/]+)(\/|$)/);
  if (sportsMatch?.[1]) return sportsMatch[1].toLowerCase();

  const matchMatch = pathname.match(/^\/match\/([^/]+)(\/|$)/);
  if (matchMatch?.[1]) return matchMatch[1].toLowerCase();

  return null;
}

function getTabFromPathname(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("sports");
  if (idx !== -1 && parts[idx + 2]) return parts[idx + 2].toLowerCase();
  return null;
}

function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export default function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchOpen, setSearchOpen] = useState(false);

  // Legacy query fallback: ?sport=football/live
  const rawSport = searchParams.get("sport") || "football";
  const [sportFromQuery, tabFromQuery] = rawSport.split("/");

  const sportFromPath = useMemo(() => getSportFromPathname(pathname), [pathname]);
  const tabFromPath = useMemo(() => getTabFromPathname(pathname), [pathname]);

  const currentSport = (sportFromPath || sportFromQuery || "football").toLowerCase();
  const currentTab = (tabFromPath || tabFromQuery || "all").toLowerCase();

  const inSportsRoutes = pathname.startsWith("/sports/");

  // Keep today's value (used for other parts / consistency)
  const todayYMD = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // ✅ Match web behavior:
  // - Only preserve ?date when it already exists in URL (and is valid)
  // - "Today" tab must NEVER include ?date
  const urlDate = isValidYMD(searchParams.get("date")) ? (searchParams.get("date") as string) : null;
  const urlHasDate = !!urlDate;

  const buildHref = (tab: "all" | "live" | "today") => {
    const params = new URLSearchParams(searchParams.toString());

    // Prevent legacy mixing when navigating
    params.delete("sport");
    params.delete("league");

    if (tab === "today") {
      // Web: Today tab never carries date in URL
      params.delete("date");
    } else {
      // Web: All/Live keep date only if already present
      if (urlHasDate) params.set("date", urlDate as string);
      else params.delete("date");
    }

    // ✅ FIX ONLY: Always use /sports/{sport}/{tab}/ (no legacy /?sport= fallback)
    const qs = params.toString();
    return qs ? `/sports/${currentSport}/${tab}/?${qs}` : `/sports/${currentSport}/${tab}/`;
  };

  const allHref = buildHref("all");
  const liveHref = buildHref("live");
  const todayHref = buildHref("today");

  const isAllActive =
    currentTab === "all" || (!["live", "today"].includes(currentTab) && inSportsRoutes);
  const isLiveActive = currentTab === "live";
  const isTodayActive = currentTab === "today";

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 theme-bg theme-border border-t">
        <div className="mx-auto max-w-7xl px-2 pb-[env(safe-area-inset-bottom)]">
          {/* Bottom Nav ONLY (NO DateDropdown here) */}
          <nav className="grid grid-cols-4 py-2">
            <Link
              href={allHref}
              prefetch={false}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 ${
                isAllActive ? "theme-accent" : "opacity-90"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-[11px] font-medium">All</span>
            </Link>

            <Link
              href={liveHref}
              prefetch={false}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 ${
                isLiveActive ? "theme-accent" : "opacity-90"
              }`}
            >
              <Activity className="h-5 w-5" />
              <span className="text-[11px] font-medium">Live</span>
            </Link>

            <Link
              href={todayHref}
              prefetch={false}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 ${
                isTodayActive ? "theme-accent" : "opacity-90"
              }`}
            >
              <Clock className="h-5 w-5" />
              <span className="text-[11px] font-medium">Today</span>
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 opacity-90"
            >
              <Search className="h-5 w-5" />
              <span className="text-[11px] font-medium">Search</span>
            </button>
          </nav>
        </div>
      </div>

      <MobileSearch open={searchOpen} onClose={() => setSearchOpen(false)} initialSport={currentSport} />
    </>
  );
}

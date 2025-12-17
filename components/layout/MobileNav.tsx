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

  const todayYMD = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentDateYMD = searchParams.get("date") || todayYMD;

  const buildHref = (tab: "all" | "live" | "today", dateYMD?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (dateYMD) params.set("date", dateYMD);

    if (inSportsRoutes) {
      const qs = params.toString();
      return qs ? `/sports/${currentSport}/${tab}/?${qs}` : `/sports/${currentSport}/${tab}/`;
    }

    const sportParam = tab === "all" ? currentSport : `${currentSport}/${tab}`;
    params.set("sport", sportParam);

    const qs = params.toString();
    return `/?${qs}`;
  };

  // All keeps selected date
  const allHref = buildHref("all", currentDateYMD);

  // Live behaves like Today -> force today's date
  const liveHref = buildHref("live", todayYMD);

  // Today forces today's date
  const todayHref = buildHref("today", todayYMD);

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

      {/* ✅ FIX: pass required prop */}
      <MobileSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        initialSport={currentSport}
      />
    </>
  );
}

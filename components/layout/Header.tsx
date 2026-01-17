"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, Moon, Sun, Search, User } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { CSSProperties } from "react";
import { SEO_CONTENT } from "@/lib/seo/seo-central";
import MobileSearch from "@/components/search/MobileSearch";

const brandFallback =
  SEO_CONTENT?.brand || { siteName: "LiveSocceRR", logoTitle: "LiveSocceRR Scores" };

// ✅ fallback stays exactly as your current list (no behavior change if API doesn't return header.nav)
const FALLBACK_ALL_SPORTS = [
  { name: "Football", id: "football", icon: "⚽" },
  { name: "Basketball", id: "basketball", icon: "🏀" },
  { name: "NFL", id: "nfl", icon: "🏈" },
  { name: "Baseball", id: "baseball", icon: "⚾" },
  { name: "Hockey", id: "hockey", icon: "🏒" },
  { name: "Rugby", id: "rugby", icon: "🏉" },
  { name: "Volleyball", id: "volleyball", icon: "🏐" },
];

// ✅ fallback stays exactly as your current top 3
const FALLBACK_MOBILE_TOP_IDS = ["football", "basketball", "nfl"] as const;

type HeaderProps = {
  onMenuClick: () => void;
};

type NavSport = { id: string; icon: string };
type SeoBrandPublic = {
  siteName?: string;
  logoTitle?: string;
  logoUrl?: string;
  sportLabels?: Record<string, string>;
  header?: {
    nav?: {
      desktopVisibleCount?: number;
      mobileTop?: string[];
      allSports?: NavSport[];
    };
  };
};

function getSportFromPathname(pathname: string | null | undefined): string | null {
  if (!pathname) return null;

  const sportsMatch = pathname.match(/^\/sports\/([^/]+)(\/|$)/);
  if (sportsMatch?.[1]) return sportsMatch[1].toLowerCase();

  const matchMatch = pathname.match(/^\/match\/([^/]+)(\/|$)/);
  if (matchMatch?.[1]) return matchMatch[1].toLowerCase();

  if (pathname.startsWith("/football")) return "football";

  return null;
}

function titleFromId(id: string) {
  return id
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function uniqueById<T extends { id: string }>(arr: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = String(x.id || "").toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sportFromPath = getSportFromPathname(pathname);
  const sportFromQuery = (searchParams.get("sport") || "").split("/")[0]?.toLowerCase();

  const currentSport =
    sportFromPath || (pathname === "/" && sportFromQuery ? sportFromQuery : null) || "football";

  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // ✅ Desktop search modal state
  const [searchOpen, setSearchOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // ✅ Brand (from global JSON via API). Defaults preserve current behavior.
  const [brandLogo, setBrandLogo] = useState<string>("/brand/logo.svg");
  const [brandName, setBrandName] = useState<string>(brandFallback.siteName || "LiveSocceRR");
  const [brandLogoTitle, setBrandLogoTitle] = useState<string>(
    (brandFallback as any).logoTitle || brandFallback.siteName || "Live Score"
  );

  // ✅ labels (already supported)
  const [sportLabels, setSportLabels] = useState<Record<string, string>>({});

  // ✅ nav config driven by global header.nav (fallback to old behavior)
  const [navDesktopVisibleCount, setNavDesktopVisibleCount] = useState<number>(6);
  const [navMobileTopIds, setNavMobileTopIds] = useState<string[]>([...FALLBACK_MOBILE_TOP_IDS]);
  const [navAllSports, setNavAllSports] = useState<Array<{ name: string; id: string; icon: string }>>(
    FALLBACK_ALL_SPORTS
  );

  useEffect(() => {
    let alive = true;

    fetch("/api/public/seo-brand", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: SeoBrandPublic | null) => {
        if (!alive || !j) return;

        if (typeof j.logoUrl === "string" && j.logoUrl) setBrandLogo(j.logoUrl);
        if (typeof j.siteName === "string" && j.siteName) setBrandName(j.siteName);
        if (typeof j.logoTitle === "string" && j.logoTitle) setBrandLogoTitle(j.logoTitle);
        if (j.sportLabels && typeof j.sportLabels === "object") setSportLabels(j.sportLabels);

        const nav = j.header?.nav;

        if (typeof nav?.desktopVisibleCount === "number" && nav.desktopVisibleCount > 0) {
          setNavDesktopVisibleCount(Math.floor(nav.desktopVisibleCount));
        }

        if (Array.isArray(nav?.mobileTop) && nav.mobileTop.length > 0) {
          setNavMobileTopIds(nav.mobileTop.map((x) => String(x).toLowerCase()).filter(Boolean));
        }

        if (Array.isArray(nav?.allSports) && nav.allSports.length > 0) {
          const list = uniqueById(
            nav.allSports
              .map((s) => ({
                id: String(s.id || "").toLowerCase(),
                icon: String(s.icon || ""),
              }))
              .filter((s) => s.id && s.icon)
          );

          const next = list.map((s) => ({
            id: s.id,
            icon: s.icon,
            name: titleFromId(s.id),
          }));

          setNavAllSports(next);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const desktopVisible = useMemo(() => {
    const count = Math.max(0, Math.min(navAllSports.length, navDesktopVisibleCount || 6));
    return navAllSports.slice(0, count);
  }, [navAllSports, navDesktopVisibleCount]);

  const desktopHidden = useMemo(() => {
    const count = Math.max(0, Math.min(navAllSports.length, navDesktopVisibleCount || 6));
    return navAllSports.slice(count);
  }, [navAllSports, navDesktopVisibleCount]);

  const isDesktopHiddenActive = desktopHidden.some((s) => s.id === currentSport);

  const mobileTopSports = useMemo(() => {
    const byId = new Map(navAllSports.map((s) => [s.id, s]));
    const list = navMobileTopIds.length ? navMobileTopIds : [...FALLBACK_MOBILE_TOP_IDS];

    const result = list
      .map((id) => {
        const key = String(id).toLowerCase();
        const found = byId.get(key);
        if (found) return found;

        const fromFallback = FALLBACK_ALL_SPORTS.find((x) => x.id === key);
        if (fromFallback) return fromFallback;

        return { id: key, name: titleFromId(key), icon: "•" };
      })
      .filter(Boolean);

    return uniqueById(result);
  }, [navAllSports, navMobileTopIds]);

  const mobileHidden = useMemo(() => {
    const topIds = new Set(mobileTopSports.map((s) => s.id));
    return navAllSports.filter((s) => !topIds.has(s.id));
  }, [navAllSports, mobileTopSports]);

  const isMobileHiddenActive = mobileHidden.some((s) => s.id === currentSport);

  const headerClass = isDark ? "theme-bg theme-border border-b" : "bg-[#0f80da] border-none";

  const logoTextClass = isDark ? "text-primary" : "text-white";
  const logoBgClass = isDark ? "bg-[#0f80da] text-white" : "bg-white text-[#0f80da]";

  const getDesktopNavItemClass = (isActive: boolean) => {
    if (isDark) {
      return isActive
        ? "text-blue-400 border-b-[3px] border-blue-400 bg-slate-900/60"
        : "text-slate-200 border-b-[3px] border-transparent hover:bg-slate-800/70";
    }
    return isActive ? "bg-[#f1f5f9] text-[#0f80da]" : "text-white/90 hover:bg-white/10";
  };

  // ✅ Mobile selector: best-practice “segmented-pill” styling (light/dark), strong active, subtle inactive
  const getMobileNavItemClass = (isActive: boolean) => {
    const base =
      "outline-none focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-200 active:scale-[0.99]";

    if (isDark) {
      return isActive
        ? `${base} bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/30 shadow-sm`
        : `${base} text-slate-200/90 hover:text-slate-100 hover:bg-slate-800/60`;
    }

    // light (blue header background)
    return isActive
      ? `${base} bg-white text-[#0f80da] shadow-sm`
      : `${base} text-white/90 hover:text-white hover:bg-white/10`;
  };

  const getIconStyle = (isActive: boolean, isMobile = false): CSSProperties => {
    if (isActive) return { filter: "none" };
    const strokeColor = !isDark && isMobile ? "#ffffff" : isDark ? "#e2e8f0" : "#ffffff";
    return {
      color: "transparent",
      WebkitTextStroke: `1px ${strokeColor}`,
      textStroke: `1px ${strokeColor}`,
    } as CSSProperties;
  };

  const sportHref = (sportId: string) => `/sports/${sportId}/all`;

  const getSportLabel = (sportId: string, fallbackName: string) =>
    (sportLabels && typeof sportLabels[sportId] === "string" && sportLabels[sportId]) || fallbackName;

  // ✅ Mobile container “track” (only styling)
  const mobileTrackClass = isDark
    ? "bg-slate-900/60 border border-slate-800/80 shadow-inner"
    : "bg-white/15 border border-white/20";

  const mobileDropdownShellClass = isDark
    ? "bg-slate-950/95 border-slate-800"
    : "bg-white border-white/60";

  return (
    <>
      <header className={`${headerClass} sticky top-0 z-30 shadow-sm transition-colors duration-200`}>
        {/* DESKTOP HEADER */}
        <div className="hidden lg:flex h-16 px-6 justify-between w-full max-w-7xl mx-auto">
          {/* LEFT: logo (no wrap / no contraction) */}
          <div className="flex items-center h-full mr-6 shrink-0">
            <Link href="/" className="flex items-center gap-3 whitespace-nowrap">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${logoBgClass}`}
              >
                <img
                  src={brandLogo}
                  alt={brandLogoTitle || brandName || "Live Score"}
                  title={brandLogoTitle || brandName || "Live Score"}
                  className="w-6 h-6"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <h1 className={`text-2xl font-bold tracking-tight leading-none whitespace-nowrap ${logoTextClass}`}>
                {brandName}
              </h1>
            </Link>

            <div className={`h-8 w-px mx-6 ${isDark ? "bg-slate-800" : "bg-white/20"}`} />
          </div>

          {/* MIDDLE: Nav */}
          <nav className="flex items-end h-full flex-1 gap-1">
            {desktopVisible.map((sport) => {
              const isActive = currentSport === sport.id;
              return (
                <Link
                  key={sport.id}
                  href={sportHref(sport.id)}
                  className={`
                    relative flex items-center justify-center gap-2
                    h-full px-5 text-sm font-bold uppercase tracking-wide
                    transition-all duration-150
                    ${getDesktopNavItemClass(isActive)}
                  `}
                >
                  <span className="text-lg leading-none" style={getIconStyle(isActive)}>
                    {sport.icon}
                  </span>
                  <span>{getSportLabel(sport.id, sport.name)}</span>
                </Link>
              );
            })}

            {desktopHidden.length > 0 && (
              <div
                className="relative h-full"
                onMouseEnter={() => setDesktopMoreOpen(true)}
                onMouseLeave={() => setDesktopMoreOpen(false)}
              >
                <button
                  type="button"
                  className={`
                    flex items-center justify-center gap-1
                    h-full px-4 text-sm font-bold uppercase tracking-wide
                    transition-all duration-150
                    ${getDesktopNavItemClass(desktopMoreOpen || isDesktopHiddenActive)}
                  `}
                >
                  <span>More</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${desktopMoreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {desktopMoreOpen && (
                  <div className="absolute top-full right-0 w-56 pt-0">
                    <div className="theme-bg theme-border border rounded-b-xl shadow-xl overflow-hidden py-2">
                      {desktopHidden.map((sport) => {
                        const isItemActive = currentSport === sport.id;
                        const itemClass = isDark
                          ? isItemActive
                            ? "text-blue-400 bg-slate-900"
                            : "text-secondary hover:text-slate-200 hover:bg-slate-800"
                          : isItemActive
                            ? "text-[#0f80da] bg-blue-50"
                            : "text-secondary hover:text-primary hover:bg-slate-50";

                        return (
                          <Link
                            key={sport.id}
                            href={sportHref(sport.id)}
                            className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${itemClass}`}
                          >
                            <span className="text-lg w-6 text-center" style={getIconStyle(isItemActive)}>
                              {sport.icon}
                            </span>
                            <span>{getSportLabel(sport.id, sport.name)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* RIGHT: Search + Theme + Profile */}
          <div className="flex items-center h-full gap-2 pl-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`p-2.5 rounded-full transition-colors ${
                isDark
                  ? "text-secondary hover:bg-slate-800"
                  : "text-white/80 hover:bg-white/20 hover:text-white"
              }`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-colors ${
                isDark
                  ? "text-secondary hover:bg-slate-800"
                  : "text-white/80 hover:bg-white/20 hover:text-white"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              href="/admin/login"
              className={`p-2.5 rounded-full transition-colors ${
                isDark
                  ? "text-secondary hover:bg-slate-800"
                  : "text-white/80 hover:bg-white/20 hover:text-white"
              }`}
              aria-label="Admin login"
            >
              <User size={20} />
            </Link>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="lg:hidden flex flex-col w-full">
          {/* Top Row */}
          <div
            className={`flex items-center justify-between px-4 h-14 w-full ${isDark ? "theme-bg" : "bg-[#0f80da]"}`}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${logoBgClass}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brandLogo}
                  alt={brandLogoTitle || brandName || "Live Score"}
                  title={brandLogoTitle || brandName || "Live Score"}
                  className="w-5 h-5"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <span className={`text-lg font-bold tracking-tight ${logoTextClass}`}>{brandName}</span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2 rounded-md ${
                  isDark ? "text-secondary hover:bg-slate-800" : "text-white hover:bg-white/10"
                }`}
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link
                href="/admin/login"
                className={`p-2 rounded-md ${
                  isDark ? "text-secondary hover:bg-slate-800" : "text-white hover:bg-white/10"
                }`}
                aria-label="Admin login"
              >
                <User size={20} />
              </Link>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${
                  isDark ? "text-secondary hover:bg-slate-800" : "text-white hover:bg-white/10"
                }`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={onMenuClick}
                className={`p-2 rounded-md ${
                  isDark ? "text-secondary hover:bg-slate-800" : "text-white hover:bg-white/10"
                }`}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Bottom Row: SPORTS SELECTOR (styling only) */}
          <div
            className={`flex items-center px-3 h-12 w-full ${
              isDark ? "theme-bg border-t theme-border" : "bg-[#0f80da]"
            }`}
          >
            {/* Track */}
            <div
              className={`flex items-center w-full h-10 rounded-full px-1 gap-1 ${mobileTrackClass} ${
                isDark ? "backdrop-blur supports-[backdrop-filter]:backdrop-blur" : ""
              }`}
            >
              {/* Visible Sports */}
              <div className="flex flex-1 min-w-0 gap-1">
                {mobileTopSports.map((sport) => {
                  const isActive = currentSport === sport.id;
                  return (
                    <Link
                      key={sport.id}
                      href={sportHref(sport.id)}
                      onClick={() => setMobileMoreOpen(false)}
                      className={`
                        relative flex-1 min-w-0
                        flex items-center justify-center gap-1.5
                        h-9 px-2 rounded-full
                        text-[11px] font-semibold uppercase tracking-wide
                        ${getMobileNavItemClass(isActive)}
                      `}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="text-sm leading-none" style={getIconStyle(isActive, true)}>
                        {sport.icon}
                      </span>
                      <span className="truncate">{getSportLabel(sport.id, sport.name)}</span>
                    </Link>
                  );
                })}
              </div>

              {/* More Button */}
              {mobileHidden.length > 0 && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMoreOpen((open) => !open)}
                    className={`
                      flex items-center justify-center gap-1
                      h-9 px-3 rounded-full
                      text-[11px] font-semibold uppercase tracking-wide
                      ${getMobileNavItemClass(mobileMoreOpen || isMobileHiddenActive)}
                    `}
                    aria-label="More sports"
                    aria-expanded={mobileMoreOpen}
                  >
                    <span>More</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${mobileMoreOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {mobileMoreOpen && (
                    <div
                      className={`
                        absolute right-0 top-full mt-2 w-52
                        border rounded-2xl shadow-2xl overflow-hidden z-50
                        animate-in fade-in zoom-in-95 duration-200
                        ${mobileDropdownShellClass}
                      `}
                    >
                      <div className={`${isDark ? "bg-slate-950/85" : "bg-white"} px-2 py-2`}>
                        {mobileHidden.map((sport) => {
                          const isItemActive = currentSport === sport.id;

                          const itemClass = isDark
                            ? isItemActive
                              ? "bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/30"
                              : "text-slate-200/90 hover:bg-slate-800/60 hover:text-slate-100"
                            : isItemActive
                              ? "bg-blue-50 text-[#0f80da]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900";

                          return (
                            <Link
                              key={sport.id}
                              href={sportHref(sport.id)}
                              onClick={() => setMobileMoreOpen(false)}
                              className={`
                                flex items-center gap-3 px-3 py-3
                                rounded-xl text-[11px] font-semibold uppercase tracking-wide
                                transition-colors
                                ${itemClass}
                              `}
                              aria-current={isItemActive ? "page" : undefined}
                            >
                              <span className="text-base w-6 text-center" style={getIconStyle(isItemActive, true)}>
                                {sport.icon}
                              </span>
                              <span className="truncate">{getSportLabel(sport.id, sport.name)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop-only trigger, but modal can render globally */}
      <MobileSearch open={searchOpen} onClose={() => setSearchOpen(false)} initialSport={currentSport} />
    </>
  );
}

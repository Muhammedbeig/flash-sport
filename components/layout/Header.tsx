"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { CSSProperties } from "react";

// Full list (No NBA)
const ALL_SPORTS = [
  { name: "Football", id: "football", icon: "⚽" },
  { name: "Basketball", id: "basketball", icon: "🏀" },
  { name: "NFL", id: "nfl", icon: "🏈" },
  { name: "Baseball", id: "baseball", icon: "⚾" },
  { name: "Hockey", id: "hockey", icon: "🏒" },
  { name: "Rugby", id: "rugby", icon: "🏉" },
  { name: "Volleyball", id: "volleyball", icon: "🏐" },
];

// Mobile Top 3
const MOBILE_TOP_SPORTS = [
  { name: "Football", id: "football", icon: "⚽" },
  { name: "Basketball", id: "basketball", icon: "🏀" },
  { name: "NFL", id: "nfl", icon: "🏈" },
];

type HeaderProps = {
  onMenuClick: () => void;
};

function getSportFromPathname(pathname: string | null | undefined): string | null {
  if (!pathname) return null;

  // New canonical routes:
  // /sports/:sport/:tab
  // /sports/:sport/:tab/league/:leagueId
  const sportsMatch = pathname.match(/^\/sports\/([^/]+)(\/|$)/);
  if (sportsMatch?.[1]) return sportsMatch[1].toLowerCase();

  // Match routes:
  // /match/:sport/:id
  const matchMatch = pathname.match(/^\/match\/([^/]+)(\/|$)/);
  if (matchMatch?.[1]) return matchMatch[1].toLowerCase();

  // Legacy football routes you already had (path-based)
  if (pathname.startsWith("/football")) return "football";

  return null;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ✅ PATH-based sport detection (primary)
  const sportFromPath = getSportFromPathname(pathname);

  // ✅ Legacy query fallback only (secondary)
  const sportFromQuery = (searchParams.get("sport") || "").split("/")[0]?.toLowerCase();

  const currentSport =
    sportFromPath ||
    (pathname === "/" && sportFromQuery ? sportFromQuery : null) ||
    "football";

  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // --- LOGIC FOR SPLITTING LISTS ---

  const desktopVisible = ALL_SPORTS.slice(0, 6);
  const desktopHidden = ALL_SPORTS.slice(6);
  const isDesktopHiddenActive = desktopHidden.some((s) => s.id === currentSport);

  const mobileHidden = ALL_SPORTS.filter(
    (s) => !MOBILE_TOP_SPORTS.some((m) => m.id === s.id)
  );
  const isMobileHiddenActive = mobileHidden.some((s) => s.id === currentSport);

  // --- STYLES ---

  const headerClass = isDark
    ? "theme-bg theme-border border-b"
    : "bg-[#0f80da] border-none";

  const logoTextClass = isDark ? "text-primary" : "text-white";
  const logoBgClass = isDark
    ? "bg-[#0f80da] text-white"
    : "bg-white text-[#0f80da]";

  const getDesktopNavItemClass = (isActive: boolean) => {
    if (isDark) {
      return isActive
        ? "text-blue-400 border-b-[3px] border-blue-400 bg-slate-900/60"
        : "text-slate-200 border-b-[3px] border-transparent hover:bg-slate-800/70";
    }
    return isActive
      ? "bg-[#f1f5f9] text-[#0f80da]"
      : "text-white/90 hover:bg-white/10";
  };

  const getMobileNavItemClass = (isActive: boolean) => {
    if (isDark) {
      return isActive
        ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-500"
        : "text-secondary hover:text-primary hover:bg-slate-800 bg-slate-900/50 border border-slate-800";
    }
    return isActive
      ? "bg-white text-[#0f80da] shadow-md font-bold"
      : "text-white/80 hover:text-white hover:bg-white/20";
  };

  const getIconStyle = (isActive: boolean, isMobile = false): CSSProperties => {
    if (isActive) {
      return { filter: "none" };
    }
    const strokeColor = !isDark && isMobile ? "#ffffff" : isDark ? "#e2e8f0" : "#ffffff";
    return {
      color: "transparent",
      WebkitTextStroke: `1px ${strokeColor}`,
      textStroke: `1px ${strokeColor}`,
    } as CSSProperties;
  };

  const sportHref = (sportId: string) => `/sports/${sportId}/all`;

  return (
    <header
      className={`${headerClass} sticky top-0 z-30 shadow-sm transition-colors duration-200`}
    >
      {/* DESKTOP HEADER */}
      <div className="hidden lg:flex h-16 px-6 justify-between w-full max-w-7xl mx-auto">
        {/* LEFT: logo */}
        <div className="flex items-center h-full mr-6">
          <Link href="/" className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${logoBgClass}`}>
              <img
                src="/brand/logo.svg"
                alt="LiveSocceRR Scores"
                className="w-6 h-6"
                loading="eager"
                decoding="async"
              />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${logoTextClass}`}>
              Live Score
            </h1>
          </Link>
          <div
            className={`h-8 w-px mx-6 ${isDark ? "bg-slate-800" : "bg-white/20"}`}
          />
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
                <span>{sport.name}</span>
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
                          <span
                            className="text-lg w-6 text-center"
                            style={getIconStyle(isItemActive)}
                          >
                            {sport.icon}
                          </span>
                          <span>{sport.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* RIGHT: Theme ONLY */}
        <div className="flex items-center h-full gap-2 pl-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-colors ${
              isDark
                ? "text-secondary hover:bg-slate-800"
                : "text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="lg:hidden flex flex-col w-full">
        {/* Top Row */}
        <div
          className={`flex items-center justify-between px-4 h-14 w-full ${
            isDark ? "theme-bg" : "bg-[#0f80da]"
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${logoBgClass}`}
            >
              F
            </div>
            <span className={`text-lg font-bold tracking-tight ${logoTextClass}`}>
              FlashSport
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md ${
                isDark
                  ? "text-secondary hover:bg-slate-800"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-md ${
                isDark
                  ? "text-secondary hover:bg-slate-800"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Bottom Row: SPORTS LIST */}
        <div
          className={`flex items-center px-3 h-12 gap-2 w-full ${
            isDark ? "theme-bg border-t theme-border" : "bg-[#0f80da]"
          }`}
        >
          {/* Visible Sports */}
          <div className="flex flex-1 gap-2 h-8 min-w-0">
            {MOBILE_TOP_SPORTS.map((sport) => {
              const isActive = currentSport === sport.id;
              return (
                <Link
                  key={sport.id}
                  href={sportHref(sport.id)}
                  onClick={() => setMobileMoreOpen(false)}
                  className={`
                    flex-1 flex items-center justify-center gap-2
                    px-1 rounded-md text-[11px] font-bold uppercase tracking-wide
                    transition-all duration-200
                    ${getMobileNavItemClass(isActive)}
                  `}
                >
                  <span className="text-sm" style={getIconStyle(isActive, true)}>
                    {sport.icon}
                  </span>
                  <span className="truncate">{sport.name}</span>
                </Link>
              );
            })}
          </div>

          {/* More Button (Fixed Width) */}
          {mobileHidden.length > 0 && (
            <div className="relative h-8 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMoreOpen((open) => !open)}
                className={`
                  flex items-center justify-center gap-1
                  h-full px-3 rounded-md text-[11px] font-bold uppercase tracking-wide
                  transition-all duration-200
                  ${getMobileNavItemClass(mobileMoreOpen || isMobileHiddenActive)}
                `}
              >
                <span>More</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    mobileMoreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileMoreOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 theme-bg theme-border border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                  {mobileHidden.map((sport) => {
                    const isItemActive = currentSport === sport.id;
                    const itemClass = isDark
                      ? isItemActive
                        ? "bg-blue-600 text-white"
                        : "text-secondary hover:bg-slate-800 hover:text-primary"
                      : isItemActive
                        ? "bg-blue-50 text-[#0f80da]"
                        : "text-secondary hover:bg-slate-50 hover:text-primary";

                    return (
                      <Link
                        key={sport.id}
                        href={sportHref(sport.id)}
                        onClick={() => setMobileMoreOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wide border-b theme-border last:border-0 transition-colors
                          ${itemClass}
                        `}
                      >
                        <span
                          className="text-base w-6 text-center"
                          style={getIconStyle(isItemActive)}
                        >
                          {sport.icon}
                        </span>
                        <span>{sport.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { CSSProperties } from "react";

const DESKTOP_SPORTS = [
  { name: "Football", id: "football", icon: "⚽" },
  { name: "Basketball", id: "basketball", icon: "🏀" },
  { name: "NBA", id: "nba", icon: "🏀" },
  { name: "NFL", id: "nfl", icon: "🏈" },
  { name: "Baseball", id: "baseball", icon: "⚾" },
  { name: "Hockey", id: "hockey", icon: "🏒" },
  { name: "Rugby", id: "rugby", icon: "🏉" },
  { name: "Volleyball", id: "volleyball", icon: "🏐" },
];

const MOBILE_TOP_SPORTS = [
  { name: "Football", id: "football", icon: "⚽" },
  { name: "Basketball", id: "basketball", icon: "🏀" },
  { name: "Hockey", id: "hockey", icon: "🏒" },
];

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get("sport") || "football";

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const visibleSports = DESKTOP_SPORTS.slice(0, 6);
  const hiddenSports = DESKTOP_SPORTS.slice(6);
  const isHiddenActive = hiddenSports.some((s) => s.id === currentSport);

  // For mobile "More": everything that's not in MOBILE_TOP_SPORTS
  const mobileHiddenSports = DESKTOP_SPORTS.filter(
    (s) => !MOBILE_TOP_SPORTS.some((m) => m.id === s.id),
  );

  // Header background
  const headerClass = isDark
    ? "theme-bg theme-border border-b"
    : "bg-[#0f80da] border-none";

  const logoTextClass = isDark ? "text-primary" : "text-white";
  const logoBgClass = isDark
    ? "bg-[#0f80da] text-white"
    : "bg-white text-[#0f80da]";

  // Desktop/mobile tab style
  const getNavItemClass = (isActive: boolean) => {
    if (isDark) {
      return isActive
        ? "text-blue-400 border-b-[3px] border-blue-400 bg-slate-900/60"
        : "text-slate-200 border-b-[3px] border-transparent hover:bg-slate-800/70";
    }
    return isActive
      ? "bg-[#f1f5f9] text-[#0f80da]"
      : "text-white/90 hover:bg-white/10";
  };

  // Icon style: active = full color, inactive = outlined
  const getIconStyle = (isActive: boolean): CSSProperties => {
    if (isActive) {
      return { filter: "none" };
    }
    const strokeColor = isDark ? "#e2e8f0" : "#ffffff";
    return {
      color: "transparent",
      WebkitTextStroke: `1px ${strokeColor}`,
      textStroke: `1px ${strokeColor}`,
    } as CSSProperties;
  };

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
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${logoBgClass}`}
            >
              F
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${logoTextClass}`}>
              FlashSport
            </h1>
          </Link>
          <div
            className={`h-8 w-px mx-6 ${
              isDark ? "bg-slate-800" : "bg-white/20"
            }`}
          />
        </div>

        {/* MIDDLE: nav */}
        <nav className="flex items-end h-full flex-1 gap-1">
          {visibleSports.map((sport) => {
            const isActive = currentSport === sport.id;
            return (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                className={`
                  relative flex items-center justify-center gap-2
                  h-full px-5 text-sm font-bold uppercase tracking-wide
                  transition-all duration-150
                  ${getNavItemClass(isActive)}
                `}
              >
                <span
                  className="text-lg leading-none"
                  style={getIconStyle(isActive)}
                >
                  {sport.icon}
                </span>
                <span>{sport.name}</span>
              </Link>
            );
          })}

          {/* MORE for desktop */}
          {hiddenSports.length > 0 && (
            <div
              className="relative h-full"
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <button
                type="button"
                className={`
                  flex items-center justify-center gap-1
                  h-full px-4 text-sm font-bold uppercase tracking-wide
                  transition-all duration-150
                  ${getNavItemClass(isMoreOpen || isHiddenActive)}
                `}
              >
                <span>More</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isMoreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isMoreOpen && (
                <div className="absolute top-full right-0 w-56 pt-0">
                  <div className="theme-bg theme-border border rounded-b-xl shadow-xl overflow-hidden py-2">
                    {hiddenSports.map((sport) => {
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
                          href={`/?sport=${sport.id}`}
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

        {/* RIGHT: theme + menu */}
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
          <button
            onClick={onMenuClick}
            className={`p-2.5 rounded-full transition-colors ${
              isDark
                ? "text-secondary hover:bg-slate-800"
                : "text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="lg:hidden">
        {/* top bar */}
        <div
          className={`flex items-center justify-between px-4 h-14 ${
            isDark ? "theme-bg" : "bg-[#0f80da]"
          }`}
        >
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

          <Link href="/" className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${logoBgClass}`}
            >
              F
            </div>
            <span
              className={`text-lg font-bold tracking-tight ${logoTextClass}`}
            >
              FlashSport
            </span>
          </Link>

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
        </div>

        {/* MOBILE SPORTS ROW */}
        <div
          className={`flex items-stretch justify-between px-2 h-11 ${
            isDark ? "theme-bg" : "bg-[#0f80da]"
          }`}
        >
          <div className="flex flex-1 gap-1">
            {MOBILE_TOP_SPORTS.map((sport) => {
              const isActive = currentSport === sport.id;
              return (
                <Link
                  key={sport.id}
                  href={`/?sport=${sport.id}`}
                  onClick={() => setMobileMoreOpen(false)}
                  className={`
                    flex-1 flex items-center justify-center gap-1
                    h-full text-[11px] font-semibold uppercase tracking-wide
                    ${getNavItemClass(isActive)}
                  `}
                >
                  <span className="text-sm" style={getIconStyle(isActive)}>
                    {sport.icon}
                  </span>
                  <span>{sport.name}</span>
                </Link>
              );
            })}
          </div>

          {mobileHiddenSports.length > 0 && (
            <div className="relative ml-1 h-full">
              <button
                type="button"
                onClick={() => setMobileMoreOpen((open) => !open)}
                className={`
                  flex items-center justify-center gap-1
                  h-full px-3 rounded-md text-[11px] font-semibold uppercase tracking-wide
                  ${getNavItemClass(mobileMoreOpen || isHiddenActive)}
                `}
              >
                <span>More</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    mobileMoreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileMoreOpen && (
                <div className="absolute right-0 mt-1 w-44 theme-bg theme-border border rounded-lg shadow-lg overflow-hidden z-40">
                  {mobileHiddenSports.map((sport) => (
                    <Link
                      key={sport.id}
                      href={`/?sport=${sport.id}`}
                      onClick={() => setMobileMoreOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-secondary hover:text-primary hover:bg-muted"
                    >
                      <span
                        className="text-base w-6 text-center"
                        style={getIconStyle(currentSport === sport.id)}
                      >
                        {sport.icon}
                      </span>
                      <span>{sport.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const DESKTOP_SPORTS = [
  { name: "Football", id: "football", icon: "⚽" },
  { name: "Basketball", id: "basketball", icon: "🏀" },
  { name: "NBA", id: "nba", icon: "🏀" },
  { name: "NFL", id: "nfl", icon: "🏈" },
  { name: "Baseball", id: "baseball", icon: "⚾" },
  { name: "Hockey", id: "hockey", icon: "🏒" },
  { name: "Formula 1", id: "f1", icon: "🏎️" },
  { name: "MMA", id: "mma", icon: "🥊" },
  { name: "Rugby", id: "rugby", icon: "🏉" },
  { name: "Volleyball", id: "volleyball", icon: "🏐" },
  { name: "AFL", id: "afl", icon: "🏉" },
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

  const visibleSports = DESKTOP_SPORTS.slice(0, 6);
  const hiddenSports = DESKTOP_SPORTS.slice(6);
  const isHiddenActive = hiddenSports.some((s) => s.id === currentSport);

  return (
    <header className="theme-bg theme-border border-b sticky top-0 z-30 shadow-sm">

      {/* DESKTOP HEADER */}
      <div className="hidden lg:flex items-center h-16 px-6 justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3 mr-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
            F
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            FlashSport
          </h1>
        </div>

        <div className="h-8 w-px theme-border mr-6"></div>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-2">

          {visibleSports.map((sport) => {
            const isActive = currentSport === sport.id;

            return (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all

                  ${
                    isActive
                      ? "bg-blue-600 text-white dark:bg-blue-700"
                      : "text-secondary theme-hover hover:text-primary"
                  }
                `}
              >
                <span className="text-lg leading-none">{sport.icon}</span>
                {sport.name}
              </Link>
            );
          })}

          {/* MORE DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setIsMoreOpen(true)}
            onMouseLeave={() => setIsMoreOpen(false)}
          >
            <button
              className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all

                ${
                  isMoreOpen || isHiddenActive
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : "text-secondary theme-hover hover:text-primary"
                }
              `}
            >
              More
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="absolute top-full right-0 w-48 pt-2">
                <div className="theme-bg theme-border border rounded-xl shadow-xl overflow-hidden py-1">

                  {hiddenSports.map((sport) => (
                    <Link
                      key={sport.id}
                      href={`/?sport=${sport.id}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-secondary theme-hover hover:text-primary"
                    >
                      <span className="text-lg w-6 text-center">
                        {sport.icon}
                      </span>
                      {sport.name}
                    </Link>
                  ))}

                </div>
              </div>
            )}
          </div>
        </nav>

        {/* THEME SWITCH */}
        <button
          onClick={toggleTheme}
          className="p-2 text-secondary theme-hover rounded-full transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* MOBILE HEADER */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 h-14 theme-bg theme-border border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              F
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">
              FlashSport
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-secondary theme-hover rounded-md"
            >
              {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <button
              onClick={onMenuClick}
              className="p-2 -mr-2 text-secondary theme-hover rounded-md"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>

        {/* MOBILE SPORTS ROW */}
        <div className="flex items-center justify-between px-2 h-12 theme-bg theme-border border-b">
          {MOBILE_TOP_SPORTS.map((sport) => {
            const isActive = currentSport === sport.id;

            return (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                onClick={() => setMobileMoreOpen(false)}
                className={`flex-1 flex items-center justify-center gap-2 h-full text-sm font-semibold

                  ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                      : "text-secondary theme-hover hover:text-primary"
                  }
                `}
              >
                <span>{sport.icon}</span> {sport.name}
              </Link>
            );
          })}

          {/* MOBILE MORE BUTTON */}
          <button
            onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
            className={`flex-1 flex items-center justify-center gap-1 h-full text-sm font-semibold

              ${
                mobileMoreOpen
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-secondary theme-hover hover:text-primary"
              }
            `}
          >
            More
            <ChevronDown
              size={14}
              className={`transition-transform ${
                mobileMoreOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {mobileMoreOpen && (
          <div className="absolute top-full left-0 w-full theme-bg theme-border border-t shadow-xl py-2 grid grid-cols-2 gap-2 px-4 animate-in slide-in-from-top-2 fade-in duration-200">
            {DESKTOP_SPORTS.filter(
              (s) => !MOBILE_TOP_SPORTS.some((m) => m.id === s.id)
            ).map((sport) => (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg theme-hover text-sm font-medium text-secondary hover:text-primary"
              >
                <span className="text-lg">{sport.icon}</span>
                {sport.name}
              </Link>
            ))}
          </div>
        )}
      </div>

    </header>
  );
}

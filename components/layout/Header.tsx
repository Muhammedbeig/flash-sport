"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

// Sports List with Emojis (Matches your screenshot exactly)
const SPORTS = [
  { name: "Football", id: "football", icon: "⚽" },
  { name: "Basketball", id: "basketball", icon: "🏀" },
  { name: "NBA", id: "nba", icon: "🏀" },
  { name: "NFL", id: "nfl", icon: "🏈" },
  { name: "Baseball", id: "baseball", icon: "⚾" },
  { name: "Hockey", id: "hockey", icon: "🏒" },
  { name: "Handball", id: "handball", icon: "🤾" },
  { name: "Rugby", id: "rugby", icon: "🏉" },
  { name: "Volleyball", id: "volleyball", icon: "🏐" },
  { name: "AFL", id: "afl", icon: "🏉" },
];

export default function Header() {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get("sport") || "football";
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Logic: Show Top 5, Hide Rest
  const VISIBLE_COUNT = 5;
  const visibleSports = SPORTS.slice(0, VISIBLE_COUNT);
  const hiddenSports = SPORTS.slice(VISIBLE_COUNT);
  const isHiddenActive = hiddenSports.some(s => s.id === currentSport);

  return (
    <header className="hidden lg:flex items-center h-16 bg-white border-b border-gray-200 px-6 sticky top-0 z-50 shadow-sm">
      
      {/* 1. Logo Section */}
      <div className="flex items-center gap-3 mr-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
          F
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          FlashSport
        </h1>
      </div>

      {/* 2. Vertical Separator */}
      <div className="h-8 w-px bg-gray-200 mr-6"></div>

      {/* 3. Horizontal Navigation */}
      <nav className="flex items-center gap-2">
        {visibleSports.map((sport) => {
          const isActive = currentSport === sport.id;
          return (
            <Link 
              key={sport.id}
              href={`/?sport=${sport.id}`} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
              }`}
            >
              {/* EMOJI ICON */}
              <span className="text-lg leading-none">{sport.icon}</span>
              {sport.name}
            </Link>
          );
        })}

        {/* 4. "More" Dropdown */}
        <div 
          className="relative"
          onMouseEnter={() => setIsMoreOpen(true)}
          onMouseLeave={() => setIsMoreOpen(false)}
        >
          <button 
            className={`flex items-center gap-1 px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold ${
              isHiddenActive || isMoreOpen
                ? "bg-blue-50 text-blue-600" 
                : "text-slate-600 hover:bg-gray-50"
            }`}
          >
            More
            <ChevronDown size={16} className={`transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Content */}
          <div 
            className={`absolute top-full right-0 w-48 pt-2 transition-all duration-200 origin-top-right ${
              isMoreOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
            }`}
          >
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
              {hiddenSports.map((sport) => {
                const isActive = currentSport === sport.id;
                return (
                  <Link 
                    key={sport.id}
                    href={`/?sport=${sport.id}`}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-slate-600 hover:bg-gray-50"
                    }`}
                  >
                     <span className="text-lg w-6 text-center">{sport.icon}</span>
                     {sport.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
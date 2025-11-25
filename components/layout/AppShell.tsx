"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

type AppShellProps = {
  children: ReactNode;
};

// Full Sports List
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

export default function AppShell({ children }: AppShellProps) {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get("sport") || "football";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Logic to split sports for Desktop View
  const VISIBLE_COUNT = 5;
  const visibleSports = SPORTS.slice(0, VISIBLE_COUNT);
  const hiddenSports = SPORTS.slice(VISIBLE_COUNT);

  // Helper to check if active sport is inside the hidden menu
  const isHiddenActive = hiddenSports.some(s => s.id === currentSport);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans">
      
      {/* --- DESKTOP HEADER (Web Look) --- */}
      <header className="hidden lg:flex items-center px-8 py-0 h-16 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer mr-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            FlashSport
          </h1>
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-gray-200 mr-8"></div>

        {/* Desktop Navigation (Top 5 + More) */}
        <nav className="flex items-center gap-1">
          {visibleSports.map((sport) => {
            const isActive = currentSport === sport.id;
            
            return (
              <Link 
                key={sport.id}
                href={`/?sport=${sport.id}`} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-lg opacity-80">{sport.icon}</span>
                {sport.name}
              </Link>
            );
          })}

          {/* "More" Dropdown */}
          <div 
            className="relative ml-2"
            onMouseEnter={() => setIsMoreOpen(true)}
            onMouseLeave={() => setIsMoreOpen(false)}
          >
            <button 
              className={`flex items-center gap-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                isHiddenActive || isMoreOpen
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              More
              <ChevronDown size={16} className={`transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <div 
              className={`absolute top-full left-0 w-48 pt-2 transition-all duration-200 origin-top-left ${
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
                      onClick={() => setIsMoreOpen(false)} // Close on click
                      className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        isActive 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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

      {/* --- MOBILE MENU OVERLAY (Unchanged) --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- MOBILE SIDEBAR (Unchanged - Shows ALL sports) --- */}
      <aside className={`fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FlashSport
          </h1>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="overflow-y-auto px-4 py-6 space-y-1 h-[calc(100vh-100px)]">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Sports
          </div>
          
          {/* Mobile shows ALL sports in one list */}
          {SPORTS.map((sport) => {
            const isActive = currentSport === sport.id;
            
            return (
              <Link 
                key={sport.id}
                href={`/?sport=${sport.id}`} 
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 text-base font-medium ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                    : "text-gray-700 active:bg-gray-100"
                }`}
              >
                <span className="text-2xl">{sport.icon}</span>
                {sport.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* MOBILE HEADER (Only shows on mobile) */}
        <header className="lg:hidden h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FlashSport
          </h1>
          
          <div className="w-10" /> 
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
        
        {/* MOBILE BOTTOM NAV */}
        <nav className="lg:hidden h-20 bg-white border-t border-gray-200 flex justify-around items-center z-30 shadow-lg safe-area-inset-bottom">
          <button className="flex flex-col items-center gap-1 px-4 py-2 text-blue-600 active:scale-95 transition-transform">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50">
              <span className="text-xl">⚽</span>
            </div>
            <span className="text-xs font-medium">Scores</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500 active:scale-95 transition-transform">
            <div className="w-10 h-10 flex items-center justify-center rounded-full">
              <span className="text-xl">⭐</span>
            </div>
            <span className="text-xs font-medium">Favorites</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500 active:scale-95 transition-transform">
            <div className="w-10 h-10 flex items-center justify-center rounded-full">
              <span className="text-xl">📰</span>
            </div>
            <span className="text-xs font-medium">News</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
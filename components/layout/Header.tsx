"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { SportIcon } from "@/components/ui/SportIcon";

// --- CONFIGURATION ---
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
  onMenuClick: () => void; // Prop to open sidebar
};

export default function Header({ onMenuClick }: HeaderProps) {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get("sport") || "football";
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Desktop Logic
  const VISIBLE_COUNT = 6;
  const desktopVisible = DESKTOP_SPORTS.slice(0, VISIBLE_COUNT);
  const desktopHidden = DESKTOP_SPORTS.slice(VISIBLE_COUNT);
  const isHiddenActive = desktopHidden.some(s => s.id === currentSport);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      
      {/* ===========================
          DESKTOP LAYOUT (lg:flex)
         =========================== */}
      <div className="hidden lg:flex items-center h-16 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">F</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FlashSport</h1>
        </div>

        <div className="h-8 w-px bg-gray-200 mr-6"></div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {desktopVisible.map((sport) => {
            const isActive = currentSport === sport.id;
            return (
              <Link 
                key={sport.id}
                href={`/?sport=${sport.id}`} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg leading-none">{sport.icon}</span>
                {sport.name}
              </Link>
            );
          })}

          {/* Desktop "More" Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsMoreOpen(true)}
            onMouseLeave={() => setIsMoreOpen(false)}
          >
            <button className={`flex items-center gap-1 px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold ${isHiddenActive || isMoreOpen ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-gray-50"}`}>
              More <ChevronDown size={16} className={`transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
            </button>
            {/* Dropdown Content */}
            <div className={`absolute top-full right-0 w-48 pt-2 transition-all origin-top-right ${isMoreOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                {desktopHidden.map((sport) => (
                  <Link key={sport.id} href={`/?sport=${sport.id}`} onClick={() => setIsMoreOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-gray-50">
                     <span className="text-lg w-6 text-center">{sport.icon}</span> {sport.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ===========================
          MOBILE LAYOUT (lg:hidden)
         =========================== */}
      <div className="lg:hidden">
        {/* Top Row: Hamburger + Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="p-1 -ml-1 text-slate-700 active:bg-gray-100 rounded-md">
              <Menu size={26} />
            </button>
            <span className="font-bold text-slate-900 text-xl tracking-tight">FlashSport</span>
          </div>
        </div>

        {/* Bottom Row: Sports Nav */}
        <div className="flex items-center justify-between px-2 h-12 bg-slate-50/80 backdrop-blur-sm">
          {MOBILE_TOP_SPORTS.map((sport) => {
            const isActive = currentSport === sport.id;
            return (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                onClick={() => setMobileMoreOpen(false)}
                className={`flex-1 flex items-center justify-center gap-2 h-full text-sm font-semibold ${
                  isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"
                }`}
              >
                <span>{sport.icon}</span> {sport.name}
              </Link>
            );
          })}
          
          {/* Mobile "More" Button */}
          <button 
            onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
            className={`flex-1 flex items-center justify-center gap-1 h-full text-sm font-semibold ${mobileMoreOpen ? "text-blue-600 bg-blue-50" : "text-slate-500"}`}
          >
            More <ChevronDown size={14} className={`transition-transform ${mobileMoreOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Mobile "More" Dropdown Content */}
        {mobileMoreOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 py-2 grid grid-cols-2 gap-2 px-4 animate-in slide-in-from-top-2 fade-in duration-200">
            {DESKTOP_SPORTS.filter(s => !MOBILE_TOP_SPORTS.some(m => m.id === s.id)).map((sport) => (
              <Link key={sport.id} href={`/?sport=${sport.id}`} onClick={() => setMobileMoreOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-sm font-medium text-slate-700">
                <span className="text-lg">{sport.icon}</span> {sport.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
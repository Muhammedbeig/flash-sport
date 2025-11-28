"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import SidebarCountries from "./SidebarCountries";
import { useTheme } from "@/components/providers/ThemeProvider";

// Extensive list of pinned leagues matching your screenshot
const PINNED_LEAGUES = [
  { name: "Premier League", id: "39" },
  { name: "Ligue 1", id: "61" },
  { name: "Bundesliga", id: "78" },
  { name: "Serie A", id: "135" },
  { name: "Eredivisie", id: "88" }, 
  { name: "LaLiga", id: "140" },
  { name: "Euro Championship", id: "4" },
  { name: "Champions League", id: "2" },
  { name: "Europa League", id: "3" },
  { name: "Conference League", id: "848" },
  { name: "UEFA Nations League", id: "5" },
  { name: "Copa Libertadores", id: "13" },
  { name: "World Cup", id: "1" },
];

export default function Sidebar({ className = "", onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get("sport") || "football";
  const currentLeague = searchParams.get("league");
  const { theme } = useTheme();

  return (
    <aside className={`theme-bg theme-border border-r ${className}`}>
      {/* PINNED LEAGUES */}
      <div className="p-4 pb-0">
        <div className="mb-3 px-3 flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          Pinned Leagues
        </div>
        <div className="space-y-1">
          {PINNED_LEAGUES.map((league) => {
            const isActive = String(league.id) === String(currentLeague);
            
            // CDN URL for League Logos
            const logoUrl = `https://media.api-sports.io/football/leagues/${league.id}.png`;

            // === STRICT THEME STYLING ===
            const activeClass = theme === 'dark'
              ? "bg-slate-800 text-blue-400 border-blue-500"
              : "bg-blue-50 text-blue-700 border-blue-600";

            const inactiveClass = theme === 'dark'
              ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
              : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

            return (
              <Link
                key={league.id}
                href={`/?sport=football&league=${league.id}`}
                onClick={onLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium border-l-4 transition-all duration-200
                  ${isActive ? activeClass : inactiveClass}
                `}
              >
                {/* League Icon (White background circle for better visibility in dark mode) */}
                <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full p-0.5 shrink-0 shadow-sm">
                  <img 
                    src={logoUrl} 
                    alt={league.name} 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                
                <span className="truncate">{league.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="my-4 theme-border border-t mx-4"></div>

      {/* ALL COUNTRIES LIST */}
      <div className="pb-10">
        <div className="mb-2 px-7 text-xs font-bold text-secondary uppercase tracking-wider">
          All Countries
        </div>
        <SidebarCountries currentSport={currentSport} onLinkClick={onLinkClick} />
      </div>
    </aside>
  );
}
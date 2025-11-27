"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Shield } from "lucide-react";
import SidebarCountries from "./SidebarCountries";

const PINNED_LEAGUES = [
  { name: "Premier League", id: "39" },
  { name: "Ligue 1", id: "61" },
  { name: "Bundesliga", id: "78" },
  { name: "Serie A", id: "135" },
  { name: "LaLiga", id: "140" },
  { name: "Champions League", id: "2" },
];

export default function Sidebar({ className = "", onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get("sport") || "football";
  const currentLeague = searchParams.get("league");

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
            return (
              <Link
                key={league.id}
                href={`/?sport=football&league=${league.id}`}
                onClick={onLinkClick}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium border-l-4 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white dark:bg-blue-700 border-blue-700 pl-3"
                    : "text-secondary border-transparent theme-hover hover:text-primary"
                }`}
              >
                {league.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="my-4 theme-border border-t mx-4"></div>

      {/* CUSTOM API COUNTRIES LIST (No Widget Bugs) */}
      <div className="pb-10">
        <div className="mb-2 px-7 text-xs font-bold text-secondary uppercase tracking-wider">
          All Countries
        </div>
        <SidebarCountries currentSport={currentSport} onLinkClick={onLinkClick} />
      </div>
    </aside>
  );
}
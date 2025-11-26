"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Globe, Shield } from "lucide-react";

// Pinned Leagues
const PINNED_LEAGUES = [
  { name: "Premier League", id: "39" },
  { name: "Ligue 1", id: "61" },
  { name: "Bundesliga", id: "78" },
  { name: "Serie A", id: "135" },
  { name: "Eredivisie", id: "88" },
  { name: "LaLiga", id: "140" },
  { name: "Euro", id: "4" },
  { name: "Champions League", id: "2" },
  { name: "Europa League", id: "3" },
  { name: "Conference League", id: "848" },
  { name: "UEFA Nations League", id: "5" },
  { name: "Copa Libertadores", id: "13" },
  { name: "World Cup", id: "1" },
  { name: "World Cup U17", id: "15" },
];

export default function Sidebar() {
  const searchParams = useSearchParams();
  const currentLeague = searchParams.get("league");
  const isFavoritesView = searchParams.get("view") === "favorites";

  return (
    <aside className="hidden lg:block w-64 h-[calc(100vh-64px)] sticky top-16 border-r border-gray-200 bg-white overflow-y-auto">
      
      {/* --- PINNED LEAGUES --- */}
      <div className="p-4 pb-0">
        <div className="mb-3 px-3 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          Pinned Leagues
        </div>
        <div className="space-y-1">
          {PINNED_LEAGUES.map((league) => {
            const isActive = currentLeague === league.id;
            return (
              <Link 
                key={league.id}
                href={`/?sport=football&league=${league.id}`} 
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-3" 
                    : "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent"
                }`}
              >
                {league.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="my-4 border-t border-gray-100 mx-4"></div>

      {/* --- MY TEAMS (Favorites Shortcut) --- */}
      <div className="p-4 pt-0 pb-0">
        <div className="mb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
          My Teams
        </div>
        {/* Clicking this sets 'view=favorites' in the URL.
           Our page.tsx will detect this and tell the widget to show the favorites tab.
        */}
        <Link
          href="/?sport=football&view=favorites"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            isFavoritesView 
              ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm" 
              : "bg-gray-50 text-slate-600 hover:bg-gray-100"
          }`}
        >
          <Shield size={16} className={isFavoritesView ? "text-blue-600" : "text-slate-400"} />
          <span>View My Favorites</span>
        </Link>
        <p className="mt-2 px-3 text-[10px] text-gray-400 leading-tight">
          Star matches in the feed to see them here.
        </p>
      </div>

      <div className="my-4 border-t border-gray-100 mx-4"></div>

      {/* --- COUNTRIES --- */}
      <div className="p-4 pt-0">
        <div className="mb-3 px-3 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Globe size={12} />
          Countries
        </div>
        <div className="min-h-[300px]" dangerouslySetInnerHTML={{ __html: `
          <api-sports-widget 
            data-type="leagues" 
            data-sport="football"
            data-target-league="#match-details-container" 
            data-theme="white"
            data-show-errors="false"
          ></api-sports-widget>
        `}} />
      </div>

    </aside>
  );
}
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Shield } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useEffect, useState } from "react";

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

type SidebarProps = {
  className?: string;
  onLinkClick?: () => void;
};

export default function Sidebar({ className = "", onLinkClick }: SidebarProps) {
  const searchParams = useSearchParams();
  const currentLeague = searchParams.get("league");
  const currentSport = searchParams.get("sport") || "football";
  const isFavoritesView = searchParams.get("view") === "favorites";

  const { theme } = useTheme();
  const widgetTheme = theme === "dark" ? "dark" : "white";

  // FIX: Ensure hydration is complete before rendering the widget
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure the API script catches the new DOM element
    const timer = setTimeout(() => setIsMounted(true), 200);
    return () => clearTimeout(timer);
  }, [currentSport]);

  return (
    <aside className={`w-64 h-[calc(100vh-64px)] sticky top-16 theme-bg theme-border border-r overflow-y-auto ${className}`}>

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
                className={`
                  block px-4 py-2.5 rounded-lg text-sm font-medium border-l-4 transition-all

                  ${
                    isActive
                      ? "bg-blue-600 text-white dark:bg-blue-700 border-blue-700 pl-3"
                      : "text-secondary border-transparent theme-hover hover:text-primary"
                  }
                `}
              >
                {league.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="my-4 theme-border border-t mx-4"></div>

      {/* MY TEAMS */}
      <div className="p-4 pt-0 pb-0">
        <div className="mb-2 px-3 text-xs font-bold text-secondary uppercase tracking-wider">
          My Teams
        </div>

        <Link
          href="/?sport=football&view=favorites"
          onClick={onLinkClick}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all border

            ${
              isFavoritesView
                ? "bg-blue-600 text-white dark:bg-blue-700 border-blue-700 shadow-sm"
                : "theme-bg text-secondary border-transparent theme-hover hover:text-primary"
            }
          `}
        >
          <Shield size={16} />
          <span>View My Favorites</span>
        </Link>
      </div>

      {/* DIVIDER */}
      <div className="my-4 theme-border border-t mx-4"></div>

      {/* COUNTRY LIST WIDGET - FIX: Applied mounted check and dynamic sport */}
      <div className="p-4 pt-0 min-h-[400px]">
        <div className="mb-3 px-3 text-xs font-bold text-secondary uppercase tracking-wider">
          All Countries
        </div>
        
        {isMounted ? (
           <div
             className="animate-in fade-in"
             dangerouslySetInnerHTML={{
               __html: `
                 <api-sports-widget 
                   data-type="leagues"
                   data-sport="${currentSport}"
                   data-theme="${widgetTheme}"
                   data-show-errors="false"
                 ></api-sports-widget>
               `,
             }}
           />
        ) : (
          <div className="space-y-3 px-3 mt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        )}
      </div>

    </aside>
  );
}
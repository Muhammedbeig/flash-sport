"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import SidebarCountries from "./SidebarCountries";
import { useTheme } from "@/components/providers/ThemeProvider";
import { FOOTBALL_ROUTES } from "@/lib/seo-routes"; // Import the config

export default function Sidebar({ className = "", onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLeagueId = searchParams.get("league");
  const { theme } = useTheme();

  // Helper to check if a specific SEO link is active
  const isLinkActive = (href: string, id?: string) => {
    // Active if URL matches exactly OR if we are on homepage with matching ID
    if (pathname === href) return true;
    if (id && pathname === "/" && currentLeagueId === id) return true;
    return false;
  };

  return (
    <aside className={`theme-bg theme-border border-r ${className}`}>
      
      {/* 1. PINNED LEAGUES (SEO URLs) */}
      <div className="p-4 pb-0">
        <div className="mb-3 px-3 flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          Pinned Leagues
        </div>
        <div className="space-y-1">
          {Object.entries(FOOTBALL_ROUTES.leagues).map(([slug, id]) => {
            // Construct the Pretty URL
            const href = `/football/${slug}`;
            const isActive = isLinkActive(href, id);
            
            // Format Name (Simple capitalization for display)
            const name = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            const logoUrl = `https://media.api-sports.io/football/leagues/${id}.png`;

            // Styles
            const activeClass = theme === 'dark'
              ? "bg-slate-800 text-blue-400 border-blue-500"
              : "bg-blue-50 text-blue-700 border-blue-600";
            const inactiveClass = theme === 'dark'
              ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
              : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

            return (
              <Link
                key={slug}
                href={href}
                onClick={onLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium border-l-4 transition-all duration-200
                  ${isActive ? activeClass : inactiveClass}
                `}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full p-0.5 shrink-0 shadow-sm">
                  <img src={logoUrl} alt={name} className="w-full h-full object-contain" loading="lazy"/>
                </div>
                <span className="truncate">{name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="my-4 theme-border border-t mx-4"></div>

      {/* 2. SEO PAGES (Today, Fixtures, etc.) */}
      <div className="pb-4">
        <div className="mb-2 px-7 text-xs font-bold text-secondary uppercase tracking-wider">
          Explore
        </div>
        <div className="space-y-1">
           {Object.keys(FOOTBALL_ROUTES.pages).map((slug) => {
             const href = `/football/${slug}`;
             const isActive = pathname === href;
             const name = slug.charAt(0).toUpperCase() + slug.slice(1); // Capitalize
             
             // Simple text link style
             const baseStyle = "block px-8 py-2 text-sm transition-colors border-l-2 border-transparent";
             const activeStyle = theme === 'dark' ? "text-blue-400 font-bold border-blue-400 bg-slate-800" : "text-blue-600 font-bold border-blue-600 bg-blue-50";
             const inactiveStyle = "text-secondary hover:text-primary";

             return (
              <Link
                key={slug}
                href={href}
                onClick={onLinkClick}
                className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
              >
                {name}
              </Link>
             );
           })}
        </div>
      </div>

      <div className="my-4 theme-border border-t mx-4"></div>

      {/* 3. ALL COUNTRIES (Fallback to Query Params to save build time) */}
      <div className="pb-10">
        <div className="mb-2 px-7 text-xs font-bold text-secondary uppercase tracking-wider">
          All Countries
        </div>
        <SidebarCountries currentSport="football" onLinkClick={onLinkClick} />
      </div>
    </aside>
  );
}
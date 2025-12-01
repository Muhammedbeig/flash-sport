"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight, Globe } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
  volleyball: "v1.volleyball.api-sports.io",
};

type League = { id: number; name: string; logo: string };
type CountryData = {
  name: string;
  flag: string | null;
  leagues: League[];
};

export default function SidebarCountries({
  currentSport,
  onLinkClick,
}: {
  currentSport: string;
  onLinkClick?: () => void;
}) {
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { theme } = useTheme();
  const VISIBLE_COUNT = 15;

  useEffect(() => {
    let isMounted = true;

    async function fetchLeagues() {
      setLoading(true);
      try {
        const host = SPORT_HOSTS[currentSport] || SPORT_HOSTS.football;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        
        if (!apiKey) return;

        // Wrap fetch in a try/catch to prevent Sidebar crash
        const response = await fetch(`https://${host}/leagues`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": host,
            "x-rapidapi-key": apiKey,
          },
        }).catch((err) => {
          throw new Error(`Network Error: ${err.message}`);
        });

        if (!response.ok) {
           // Silently fail if API blocks request
           console.warn(`Sidebar API Error: ${response.status}`);
           return;
        }

        const json = await response.json();
        
        if (!isMounted) return;
        if (!json.response || !Array.isArray(json.response)) return;

        const grouped: Record<string, CountryData> = {};

        json.response.forEach((item: any) => {
          const cName = item.country?.name;
          if (!cName || cName === "World") return;
          if (!item.league?.id) return;

          if (!grouped[cName]) {
            grouped[cName] = {
              name: cName,
              flag: item.country.flag || null,
              leagues: [],
            };
          }
          grouped[cName].leagues.push({
            id: item.league.id,
            name: item.league.name,
            logo: item.league.logo,
          });
        });

        setData(Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("SidebarCountries fetch error (Recovered):", err);
        // Do not set data to empty if it fails, just stop loading
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLeagues();

    return () => { isMounted = false; };
  }, [currentSport]);

  const toggleCountry = (name: string) => setExpandedCountry(expandedCountry === name ? null : name);

  if (loading) return <div className="p-4 text-xs text-secondary text-center animate-pulse">Loading...</div>;

  // Render list or empty state safely
  const visibleCountries = showAll ? data : data.slice(0, VISIBLE_COUNT);

  return (
    <div className="space-y-1">
      {visibleCountries.map((country) => {
        const isExpanded = expandedCountry === country.name;
        const activeClass = theme === "dark" ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-700";
        const inactiveClass = theme === "dark" ? "text-secondary hover:bg-slate-800/50" : "text-secondary hover:bg-slate-100";

        return (
          <div key={country.name} className="border-b theme-border last:border-0">
            <button
              onClick={() => toggleCountry(country.name)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-200 ${isExpanded ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {country.flag ? <img src={country.flag} alt={country.name} className="w-4 h-4 object-contain shrink-0" /> : <Globe size={16} className="shrink-0" />}
                <span className="truncate">{country.name}</span>
              </div>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {isExpanded && (
              <div className="border-t animate-in slide-in-from-top-1 bg-black/5 dark:bg-black/20">
                {country.leagues.map((league) => (
                  <Link
                    key={league.id}
                    href={`/?sport=${currentSport}&league=${league.id}`}
                    onClick={onLinkClick}
                    className="block px-8 py-2.5 text-xs text-secondary hover:text-primary transition-colors"
                  >
                    {league.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {data.length > VISIBLE_COUNT && (
        <button onClick={() => setShowAll(!showAll)} className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider border-t theme-border mt-2 text-primary hover:bg-muted transition-colors">
          {showAll ? <>View Less <ChevronUp size={14} /></> : <>View All ({data.length}) <ChevronDown size={14} /></>}
        </button>
      )}
    </div>
  );
}
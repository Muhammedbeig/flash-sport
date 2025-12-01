"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

type LeagueWidgetProps = {
  leagueId: string;
  sport: string;
};

/**
 * LeagueWidget
 * ------------
 * Dedicated widget used ONLY when a user clicks a league from:
 * - Pinned Leagues
 * - All Countries list
 *
 * Uses API-SPORTS "league" widget:
 *   - Shows Today / Results / Games / Standings tabs
 *   - Works for Football, Basketball, NBA, NFL, Hockey, Rugby, Volleyball, etc.
 */
export default function LeagueWidget({ leagueId, sport }: LeagueWidgetProps) {
  const { theme } = useTheme();

  // Match our custom CSS themes (flash-light / flash-dark) in globals.css
  const widgetTheme = theme === "dark" ? "flash-dark" : "flash-light";

  // Supported sports for the LEAGUE widget according to docs
  const SUPPORTED_SPORTS = [
    "football",
    "afl",
    "baseball",
    "basketball",
    "handball",
    "hockey",
    "nba",
    "nfl",
    "rugby",
    "volleyball",
  ];

  // If somehow an unsupported sport gets here, fall back to football
  const widgetSport = SUPPORTED_SPORTS.includes(sport) ? sport : "football";

  // League widget takes latest season by default, but we can be explicit
  const season = new Date().getFullYear();

  const html = `
    <api-sports-widget
      data-type="league"
      data-sport="${widgetSport}"
      data-league="${leagueId}"
      data-season="${season}"
      data-standings="true"
      data-theme="${widgetTheme}"
      data-refresh="60"
    ></api-sports-widget>
  `;

  return (
    <div className="w-full min-h-[500px] rounded-xl border theme-border theme-bg overflow-hidden">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

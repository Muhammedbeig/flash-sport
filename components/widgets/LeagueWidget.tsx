"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

type LeagueWidgetProps = {
  leagueId: string;
  sport: string;
};

export default function LeagueWidget({ leagueId, sport }: LeagueWidgetProps) {
  const { theme } = useTheme();

  // 1. Force the script to re-run whenever this component mounts
  // This fixes the "Blank Page" issue on navigation
  useEffect(() => {
    const scriptId = "api-sports-script-force-reload";
    
    // Remove existing script to reset the engine
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    // Re-add the script
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://widgets.api-sports.io/3.1.0/widgets.js";
    script.type = "module";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [leagueId, sport]); // Re-run if league changes

  const widgetTheme = theme === "dark" ? "flash-dark" : "flash-light";

  const SUPPORTED_SPORTS = [
    "football",
    "afl",
    "baseball",
    "basketball",
    "hockey",
    "nfl",
    "rugby",
    "volleyball",
  ];

  const widgetSport = SUPPORTED_SPORTS.includes(sport) ? sport : "football";
  // Dynamically set season to current year or previous if early in the year
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
    <div className="w-full min-h-[600px] rounded-xl border theme-border theme-bg overflow-hidden p-4">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
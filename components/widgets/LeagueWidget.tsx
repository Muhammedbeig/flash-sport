"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

type LeagueWidgetProps = {
  leagueId: string;
  sport: string;
};

export default function LeagueWidget({ leagueId, sport }: LeagueWidgetProps) {
  const { theme } = useTheme();

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
    // REMOVED HANDBALL
  ];

  const widgetSport = SUPPORTED_SPORTS.includes(sport) ? sport : "football";
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
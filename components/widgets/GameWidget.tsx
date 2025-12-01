"use client";

import CustomGameFeed from "@/components/feed/CustomGameFeed";
import { useTheme } from "@/components/providers/ThemeProvider";

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
};

export default function GameWidget({ sport = "football", leagueId }: GameWidgetProps) {
  const { theme } = useTheme();
  
  // Supported sports for the Custom Feed (Team sports with Home vs Away structure)
  const CUSTOM_FEED_SPORTS = [
    "football",
    "basketball",
    "baseball",
    "hockey",
    "rugby",
    "nfl",
    "nba",
    "volleyball",
    "handball",
  ];

  // If the sport is supported by our custom feed, use it.
  if (CUSTOM_FEED_SPORTS.includes(sport)) {
    return (
      <div className="w-full min-h-[500px]">
        {/* IMPORTANT: pass leagueId so sidebar filters actually work */}
        <CustomGameFeed sport={sport} leagueId={leagueId} />
      </div>
    );
  }

  // === FALLBACK: STANDARD WIDGET (F1, MMA, etc.) ===
  // For sports like F1 (Races) or MMA (Fights) that don't fit the "Team vs Team" row layout perfectly
  // we use the official widget to ensure data correctness.
  
  const widgetTheme = theme === "dark" ? "flash-dark" : "flash-light";

  // Build optional league attribute for fallback widget
  const leagueAttr = leagueId ? `data-league="${leagueId}"` : "";

  // Simple widget render logic for fallback sports
  // (You can keep your existing widget logic here if you want to support F1/MMA specifically)
  return (
    <div className="w-full min-h-[500px] theme-bg rounded-xl border theme-border p-4">
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <api-sports-widget 
              data-type="games" 
              data-sport="${sport}" 
              data-theme="${widgetTheme}" 
              data-show-toolbar="true" 
              data-refresh="60"
              ${leagueAttr}
            ></api-sports-widget>
          `,
        }}
      />
    </div>
  );
}

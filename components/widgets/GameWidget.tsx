"use client";

import CustomGameFeed from "@/components/feed/CustomGameFeed";
import { useTheme } from "@/components/providers/ThemeProvider";

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
};

export default function GameWidget({ sport = "football", leagueId }: GameWidgetProps) {
  const { theme } = useTheme();
  
  // CRITICAL: Any sport listed here will use your new Custom Feeds.
  // Any sport NOT listed here will fallback to the standard generic widget.
  const CUSTOM_FEED_SPORTS = [
    "football",
    "basketball",
    "nfl",
    "baseball",
    "hockey",
    "rugby",
    "volleyball",
    "handball",
  ];

  // 1. If supported, render your Custom Feed (The new separate files)
  if (CUSTOM_FEED_SPORTS.includes(sport.toLowerCase())) {
    return (
      <div className="w-full min-h-[500px]">
        <CustomGameFeed sport={sport} leagueId={leagueId} />
      </div>
    );
  }

  // 2. Fallback for F1, MMA, etc.
  const widgetTheme = theme === "dark" ? "flash-dark" : "flash-light";
  const leagueAttr = leagueId ? `data-league="${leagueId}"` : "";

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
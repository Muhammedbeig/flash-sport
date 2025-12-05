"use client";

import CustomGameFeed from "@/components/feed/CustomGameFeed";
import { useTheme } from "@/components/providers/ThemeProvider";
import LeagueTabs from "./LeagueTabs";

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
  initialTab?: string; // This comes from URL (e.g. football/summary)
  leagueSlug?: string;
};

export default function GameWidget({ 
  sport = "football", 
  leagueId, 
  initialTab,
  leagueSlug 
}: GameWidgetProps) {
  const { theme } = useTheme();

  // 1. FOOTBALL LEAGUE VIEW (Pinned Leagues like Premier League)
  // Logic: If there is a leagueId AND it's football, show the detailed League Tabs.
  if (leagueId && sport === "football") {
    return (
      <LeagueTabs 
        leagueId={leagueId} 
        sport={sport} 
        initialTab={initialTab}
        leagueSlug={leagueSlug}
      />
    );
  }

  // 2. MAIN DAILY FEEDS (Football & Basketball)
  // Logic: If no leagueId is selected (Homepage) OR it's Basketball (which uses a feed style), use CustomFeed.
  const CUSTOM_FEED_SPORTS = ["football", "basketball", "nfl", "baseball", "hockey", "rugby", "volleyball"];

  if (CUSTOM_FEED_SPORTS.includes(sport.toLowerCase())) {
    return (
      <div className="w-full min-h-[500px]">
        <CustomGameFeed 
          sport={sport} 
          leagueId={leagueId} 
          initialTab={initialTab} 
        />
      </div>
    );
  }

  // 3. FALLBACK WIDGET (Hockey, Rugby, etc.)
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
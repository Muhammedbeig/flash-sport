"use client";

import CustomGameFeed from "@/components/feed/CustomGameFeed";
import { useTheme } from "@/components/providers/ThemeProvider";
import LeagueTabs from "./LeagueTabs";

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
  initialTab?: string;
  leagueSlug?: string;
};

export default function GameWidget({ 
  sport = "football", 
  leagueId, 
  initialTab,
  leagueSlug 
}: GameWidgetProps) {
  const { theme } = useTheme();

  // 1. SEO MODE: SEO Slug present
  if (leagueSlug && leagueId) {
    return (
      <LeagueTabs 
        leagueId={leagueId} 
        sport={sport} 
        initialTab={initialTab} 
        leagueSlug={leagueSlug} 
      />
    );
  }

  // 2. Main Feed Logic
  const CUSTOM_FEED_SPORTS = ["football"];

  if (CUSTOM_FEED_SPORTS.includes(sport.toLowerCase())) {
    return (
      <div className="w-full min-h-[500px]">
        {/* Pass initialTab down to the feed */}
        <CustomGameFeed sport={sport} leagueId={leagueId} initialTab={initialTab} />
      </div>
    );
  }

  // 3. Fallback Widget
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
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

function normalizeSportKey(sport?: string) {
  return (sport || "football").toLowerCase().trim();
}

export default function GameWidget({
  sport = "football",
  leagueId,
  initialTab,
  leagueSlug,
}: GameWidgetProps) {
  const { theme } = useTheme();
  const sportKey = normalizeSportKey(sport);

  // 1) FOOTBALL LEAGUE VIEW (Pinned Leagues)
  if (leagueId && sportKey === "football") {
    return (
      <LeagueTabs
        leagueId={leagueId}
        sport={sportKey}
        initialTab={initialTab}
        leagueSlug={leagueSlug}
      />
    );
  }

  // 2) MAIN DAILY FEEDS
  const CUSTOM_FEED_SPORTS = ["football", "basketball", "nfl", "baseball", "hockey", "rugby", "volleyball"];

  if (CUSTOM_FEED_SPORTS.includes(sportKey)) {
    return (
      <div className="w-full min-h-[500px]">
        <CustomGameFeed sport={sportKey} leagueId={leagueId} initialTab={initialTab} />
      </div>
    );
  }

  // 3) FALLBACK WIDGET
  const widgetTheme = theme === "dark" ? "flash-dark" : "flash-light";
  const leagueAttr = leagueId ? `data-league="${leagueId}"` : "";

  return (
    <div className="w-full min-h-[500px] theme-bg rounded-xl border theme-border p-4">
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <api-sports-widget 
              data-type="games" 
              data-sport="${sportKey}" 
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

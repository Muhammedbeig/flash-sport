"use client";

import FeedSkeleton from "../feed/FeedSkeleton";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
};

export default function GameWidget({ leagueId, sport = "football" }: GameWidgetProps) {
  const [showWidget, setShowWidget] = useState(false);
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const isFavoritesView = searchParams.get("view") === "favorites";

  useEffect(() => {
    setShowWidget(true);
  }, []);

  const widgetTheme = theme === "dark" ? "dark" : "white";

  let widgetHtml = "";

  const common = `
    data-theme="${widgetTheme}"
    data-show-errors="true"
    data-favorite="true"
  `;

  const targets = `
    data-target-game="#match-details-container"
    data-target-team="#match-details-container"
    data-target-player="#match-details-container"
    data-target-standings="#match-details-container"
  `;

  const tabs = `
    data-events="true"
    data-lineups="true"
    data-statistics="true"
    data-player-statistics="true"
  `;

  const activeTab = isFavoritesView ? `data-tab="favorites"` : "";

  if (sport === "f1") {
    widgetHtml = `
      <api-sports-widget 
        data-type="races"
        data-sport="f1"
        data-target-race="#match-details-container"
        data-target-driver="#match-details-container"
        ${common}
      ></api-sports-widget>
    `;
  } else if (sport === "mma") {
    widgetHtml = `
      <api-sports-widget 
        data-type="fights"
        data-sport="mma"
        data-target-fight="#match-details-container"
        data-target-fighter="#match-details-container"
        ${common}
      ></api-sports-widget>
    `;
  } else {
    widgetHtml = `
      <api-sports-widget 
        data-type="games"
        data-sport="${sport}"
        ${leagueId ? `data-league="${leagueId}"` : ""}
        data-show-toolbar="true"
        ${activeTab}
        ${targets}
        ${tabs}
        ${common}
      ></api-sports-widget>
    `;
  }

  return (
    <div className="w-full min-h-[500px] theme-bg rounded-xl border-0 overflow-hidden relative transition-colors duration-200 text-primary">

      {/* SKELETON BEFORE LOAD */}
      {!showWidget && (
        <div className="absolute inset-0 z-0">
          <FeedSkeleton />
        </div>
      )}

      {/* API SPORTS WIDGET */}
      <div
        key={widgetTheme}
        dangerouslySetInnerHTML={{ __html: widgetHtml }}
      />
    </div>
  );
}

"use client";

import FeedSkeleton from "../feed/FeedSkeleton";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Import this

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
};

export default function GameWidget({ leagueId, sport = "football" }: GameWidgetProps) {
  const [showWidget, setShowWidget] = useState(false);
  const searchParams = useSearchParams();
  
  // Check if we should show the favorites tab
  const isFavoritesView = searchParams.get("view") === "favorites";

  useEffect(() => {
    setShowWidget(true);
  }, []);

  let widgetHtml = "";
  
  const common = `
    data-theme="white"
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

  // Determine the active tab: if 'view=favorites' is in URL, force 'data-tab="favorites"'
  // data-tab: "Enum: 'all' 'live' 'finished' 'scheduled' 'favorites'"  NOTE: 'favorites' logic via tab param
  const activeTab = isFavoritesView ? 'data-tab="favorites"' : "";

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
    <div className="w-full min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {!showWidget && (
        <div className="absolute inset-0 z-0">
          <FeedSkeleton />
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: widgetHtml }} />
    </div>
  );
}
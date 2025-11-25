"use client";

import FeedSkeleton from "../feed/FeedSkeleton";
import { useEffect, useState } from "react";

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
};

export default function GameWidget({ leagueId, sport = "football" }: GameWidgetProps) {
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    setShowWidget(true);
  }, []);

  const widgetHtml = `
    <api-sports-widget 
      data-type="games" 
      data-sport="${sport}"
      ${leagueId ? `data-league="${leagueId}"` : ""} 
      data-target-game="#match-details-container"
      data-show-toolbar="true"
      data-theme="white"
      data-show-errors="true"
    ></api-sports-widget>
  `;

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
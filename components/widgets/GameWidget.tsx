"use client";

import { useEffect, useState } from "react";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";

type GameWidgetProps = {
  leagueId?: string;
  sport?: string;
};

export default function GameWidget({ leagueId, sport = "football" }: GameWidgetProps) {
  const searchParams = useSearchParams();
  const isFavoritesView = searchParams.get("view") === "favorites";
  
  const { theme } = useTheme();
  // Map internal theme to widget theme values
  const widgetTheme = theme === "dark" ? "dark" : "white";

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Small delay to let the skeleton show while widget script processes
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Configuration strings
  const commonConfig = `
    data-theme="${widgetTheme}"
    data-show-errors="false"
    data-favorite="true"
    data-refresh="60"
  `;

  // Targeting options
  const targetConfig = `
    data-target-game="#match-details-container"
    data-target-match="#match-details-container"
    data-target-team="#match-details-container"
    data-target-player="#match-details-container"
    data-target-standings="#match-details-container"
    data-target-race="#match-details-container"
    data-target-driver="#match-details-container"
    data-target-fight="#match-details-container"
    data-target-fighter="#match-details-container"
  `;

  // Tab configurations
  const detailsConfig = `
    data-events="true"
    data-lineups="true"
    data-statistics="true"
    data-player-statistics="true"
    data-standings="true"
  `;

  const favoritesConfig = isFavoritesView ? 'data-tab="favorites"' : '';
  const leagueConfig = leagueId ? `data-league="${leagueId}"` : '';

  // Construct the HTML string based on sport
  const getWidgetHtml = () => {
    if (sport === "f1") {
      return `
        <api-sports-widget 
          data-type="races" 
          data-sport="f1"
          ${commonConfig}
          ${targetConfig}
        ></api-sports-widget>`;
    } 
    
    if (sport === "mma") {
      return `
        <api-sports-widget 
          data-type="fights" 
          data-sport="mma"
          ${commonConfig}
          ${targetConfig}
        ></api-sports-widget>`;
    }

    // Default (Football, Basketball, etc)
    return `
      <api-sports-widget 
        data-type="games" 
        data-sport="${sport}" 
        ${leagueConfig}
        ${commonConfig}
        ${targetConfig}
        ${detailsConfig}
        ${favoritesConfig}
        data-show-toolbar="true"
      ></api-sports-widget>`;
  };

  return (
    <div className="w-full min-h-[500px] theme-bg rounded-xl border-0 relative transition-colors duration-200">
      
      {/* Skeleton Loader */}
      {!isMounted && (
        <div className="absolute inset-0 z-10 theme-bg">
          <FeedSkeleton />
        </div>
      )}

      {/* Actual Widget Container */}
      <div
        className={isMounted ? "opacity-100 transition-opacity duration-500" : "opacity-0"}
        dangerouslySetInnerHTML={{ __html: getWidgetHtml() }}
      />
    </div>
  );
}
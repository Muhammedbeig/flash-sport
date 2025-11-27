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
  const currentTab = searchParams.get("tab"); 
  
  const { theme } = useTheme();
  const widgetTheme = theme === "dark" ? "dark" : "white";

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // === INTERCEPTOR: Opens match in NEW TAB with Dynamic Path ===
  useEffect(() => {
    if (!isMounted) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          const targetNode = mutation.target as HTMLElement;
          const injectedWidget = targetNode.querySelector("api-sports-widget");
          
          if (injectedWidget) {
            const gameId = injectedWidget.getAttribute("data-game-id");
            const raceId = injectedWidget.getAttribute("data-race-id");
            const fightId = injectedWidget.getAttribute("data-fight-id");
            
            const finalId = gameId || raceId || fightId;

            if (finalId) {
              // === DYNAMIC URL FIX ===
              // 1. Get the Repo Name from the environment (exposed by package.json script)
              const repoName = process.env.NEXT_PUBLIC_REPO_NAME;
              
              // 2. If it exists, add a slash (e.g., "/flash-sport"). If not, empty string.
              const basePath = repoName ? `/${repoName}` : "";

              // 3. Construct the URL combining base path + page path
              window.open(`${basePath}/match?id=${finalId}&sport=${sport}`, '_blank'); 
              
              targetNode.innerHTML = ""; 
            }
          }
        }
      });
    });

    const interceptorDiv = document.getElementById("widget-interceptor");
    if (interceptorDiv) {
      observer.observe(interceptorDiv, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [isMounted, sport]);

  const commonConfig = `
    data-theme="${widgetTheme}"
    data-show-errors="false"
    data-refresh="60"
  `;

  let tabConfig = '';
  if (isFavoritesView) {
    tabConfig = 'data-tab="favorites"';
  } else if (currentTab) {
    tabConfig = `data-tab="${currentTab}"`;
  }

  const leagueConfig = leagueId ? `data-league="${leagueId}"` : '';
  
  const targetConfig = `
    data-target-game="#widget-interceptor"
    data-target-race="#widget-interceptor"
    data-target-fight="#widget-interceptor"
  `;

  return (
    <div className="w-full min-h-[500px] theme-bg rounded-xl border-0 relative transition-colors duration-200">
      
      {!isMounted && (
        <div className="absolute inset-0 z-10 theme-bg">
          <FeedSkeleton />
        </div>
      )}

      {/* HIDDEN INTERCEPTOR DIV */}
      <div id="widget-interceptor" className="hidden" />

      {/* Main Feed Widget */}
      <div
        className={isMounted ? "opacity-100 block animate-in fade-in" : "opacity-0"}
        dangerouslySetInnerHTML={{ __html: `
          <api-sports-widget 
            data-type="games" 
            data-sport="${sport}" 
            ${leagueConfig}
            ${commonConfig}
            ${targetConfig}
            ${tabConfig}
            data-show-toolbar="true"
          ></api-sports-widget>
        ` }}
      />
    </div>
  );
}
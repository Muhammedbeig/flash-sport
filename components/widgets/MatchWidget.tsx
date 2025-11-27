"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton"; // Ensure this path is correct
import { useTheme } from "@/components/providers/ThemeProvider";

export default function MatchWidget({ matchId, sport = "football" }: { matchId: string, sport?: string }) {
  const [loaded, setLoaded] = useState(false);
  const { theme } = useTheme();
  const widgetTheme = theme === "dark" ? "dark" : "white";

  useEffect(() => {
    setLoaded(false);
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, [matchId, theme]);

  // Determine widget type
  const getType = () => {
    if (sport === "f1") return "race";
    if (sport === "mma") return "fight";
    return "game";
  };
  
  // Set ID Attribute based on sport
  const getIdAttr = () => {
    if (sport === "f1") return `data-race-id="${matchId}"`;
    if (sport === "mma") return `data-fight-id="${matchId}"`;
    return `data-game-id="${matchId}"`;
  };

  return (
    <div className="w-full theme-bg flex flex-col text-primary">
      {!loaded && (
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      <div
        className={loaded ? "block animate-in fade-in" : "hidden"}
        dangerouslySetInnerHTML={{
          __html: `
            <api-sports-widget
              data-type="${getType()}"
              ${getIdAttr()}
              data-sport="${sport}"
              data-theme="${widgetTheme}"
              data-show-toolbar="false"
              data-events="true"
              data-statistics="true"
              data-lineups="true"
            ></api-sports-widget>
          `,
        }}
      />
    </div>
  );
}
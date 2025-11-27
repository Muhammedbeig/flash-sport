"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";

function PlayerContent() {
  const searchParams = useSearchParams();
  const playerId = searchParams.get("id");
  const sport = searchParams.get("sport") || "football";
  const { theme } = useTheme();
  
  // State to ensure client-side rendering matches theme
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Manually inject the script for this new page context
    const scriptId = "player-widget-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://widgets.api-sports.io/3.1.0/widgets.js";
      script.type = "module";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!playerId) {
    return <div className="p-10 text-center text-secondary">No Player Selected</div>;
  }

  const widgetTheme = theme === "dark" ? "dark" : "white";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="theme-bg rounded-xl shadow-sm border theme-border overflow-hidden min-h-[600px]">
        {mounted ? (
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <api-sports-widget
                  data-type="player"
                  data-player-id="${playerId}"
                  data-sport="${sport}"
                  data-theme="${widgetTheme}"
                  data-show-toolbar="false"
                  data-show-errors="false"
                  data-player-statistics="true"
                  data-player-trophies="true"
                  data-season="2023" 
                ></api-sports-widget>
              `,
            }}
          />
        ) : (
          <div className="p-6 space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading player...</div>}>
      <PlayerContent />
    </Suspense>
  );
}
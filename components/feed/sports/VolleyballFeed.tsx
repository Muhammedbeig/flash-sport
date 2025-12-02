"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function VolleyballFeed({ leagueId }: { leagueId?: string }) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

  useEffect(() => {
    // 1. Clean up previous script to force a re-run
    const scriptId = "api-sports-script-force";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // 2. Create and inject the script anew
    // This forces the API-Sports loader to scan the DOM and render the widget immediately.
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://widgets.api-sports.io/3.1.0/widgets.js";
    script.type = "module";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup to prevent memory leaks
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [leagueId]); // Re-run if league changes

  // 3. Configure Widget Attributes
  const widgetTheme = theme === "dark" ? "flash-dark" : "flash-light";
  const leagueAttr = leagueId ? `data-league="${leagueId}"` : "";
  
  // If no league is selected (Home), the widget automatically shows "Today's" matches or a list.
  // We explicitly pass the Key here to ensure it works even if the global config missed it.
  const html = `
    <api-sports-widget
      data-type="games"
      data-sport="volleyball"
      data-key="${apiKey}"
      data-theme="${widgetTheme}"
      data-show-toolbar="true"
      data-refresh="60"
      ${leagueAttr}
    ></api-sports-widget>
  `;

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-[600px] theme-bg rounded-xl border theme-border p-4"
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
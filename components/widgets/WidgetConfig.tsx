"use client";

import Script from "next/script";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function WidgetConfig() {
  const { theme } = useTheme();

  // Map our theme to API-Sports expected theme values ('dark' | 'white')
  const widgetTheme = theme === "dark" ? "dark" : "white";

  return (
    <>
      <Script 
        src={process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL || "https://widgets.api-sports.io/2.0.3/widgets.js"}
        strategy="afterInteractive"
        type="module"
        crossOrigin="anonymous"
      />

      {/* Global Configuration */}
      <div dangerouslySetInnerHTML={{ __html: `
        <api-sports-widget 
          data-type="config" 
          data-key="${process.env.NEXT_PUBLIC_API_SPORTS_KEY}" 
          data-sport="football" 
          data-theme="${widgetTheme}" 
          data-show-logos="true"
        ></api-sports-widget>
      `}} />
    </>
  );
}

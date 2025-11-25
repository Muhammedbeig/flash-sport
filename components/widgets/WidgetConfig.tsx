"use client";

import Script from "next/script";

export default function WidgetConfig() {
  return (
    <>
      <Script 
        src={process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL || "https://widgets.api-sports.io/2.0.3/widgets.js"}
        strategy="afterInteractive"
        type="module"
        crossOrigin="anonymous" // <--- Add this line
      />

      {/* Global Configuration */}
      <div dangerouslySetInnerHTML={{ __html: `
        <api-sports-widget 
          data-type="config" 
          data-key="${process.env.NEXT_PUBLIC_API_SPORTS_KEY}" 
          data-sport="football" 
          data-theme="white" 
          data-show-logos="true"
        ></api-sports-widget>
      `}} />
    </>
  );
}
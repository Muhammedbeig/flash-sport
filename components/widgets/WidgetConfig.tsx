"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

const SCRIPT_ID = "api-sports-widgets-js";

export default function WidgetConfig() {
  const { theme } = useTheme();
  const widgetTheme = theme === "dark" ? "dark" : "white";

  const key = process.env.NEXT_PUBLIC_API_SPORTS_KEY || "";
  const scriptSrc = process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL || "https://widgets.api-sports.io/2.0.3/widgets.js";

  useEffect(() => {
    // Ensure config exists before script loads
    // (this component is mounted => config element is already in the DOM)

    // Load widgets script once
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = scriptSrc;
      s.type = "module";
      s.async = true;
      s.crossOrigin = "anonymous";
      document.body.appendChild(s);
    }

    // No further action needed; widget script scans DOM for config.
  }, [scriptSrc]);

  return (
    <div
      // keep exactly one config element in DOM
      dangerouslySetInnerHTML={{
        __html: `
<api-sports-widget
  data-type="config"
  data-key="${key}"
  data-sport="football"
  data-theme="${widgetTheme}"
  data-show-logos="true"
></api-sports-widget>
        `.trim(),
      }}
    />
  );
}

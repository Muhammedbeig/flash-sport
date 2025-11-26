"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { useEffect, useRef } from "react";

export default function WidgetThemeConfig() {
  const { theme } = useTheme();
  const widgetTheme = theme === "dark" ? "dark" : "white";
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update CONFIG WIDGET dynamically
    if (configRef.current) {
      configRef.current.innerHTML = `
        <api-sports-widget 
          data-type="config" 
          data-key="${process.env.NEXT_PUBLIC_API_SPORTS_KEY}"
          data-sport="football"
          data-theme="${widgetTheme}"
          data-show-logos="true"
          data-show-errors="true"
        ></api-sports-widget>
      `;
    }

    // Update ALL widgets to the new theme (Flashscore behavior)
    const widgets = document.querySelectorAll(
      'api-sports-widget:not([data-type="config"])'
    );

    widgets.forEach((widget) => {
      const current = widget.getAttribute("data-theme");
      if (current !== widgetTheme) {
        widget.setAttribute("data-theme", widgetTheme);
      }
    });
  }, [widgetTheme]);

  return <div ref={configRef} id="api-widget-config" style={{ display: "none" }} />;
}

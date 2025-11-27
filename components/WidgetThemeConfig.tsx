"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function WidgetThemeConfig() {
  const { theme } = useTheme();

  useEffect(() => {
    // API-Sports widget theme update mechanism
    try {
      window.dispatchEvent(
        new CustomEvent("ASW_THEME", {
          detail: { theme: theme === "dark" ? "dark" : "white" },
        })
      );
    } catch (e) {
      console.warn("Widget theme event error:", e);
    }
  }, [theme]);

  return null;
}

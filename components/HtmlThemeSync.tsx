"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function HtmlThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  return null;
}

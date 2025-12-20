"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function AdminThemeToggle({ variant = "header" }: { variant?: "header" | "panel" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Match main Header hover styles
  const headerBtn = `p-2.5 rounded-full transition-colors ${
    isDark ? "text-secondary hover:bg-slate-800" : "text-white/80 hover:bg-white/20 hover:text-white"
  }`;

  // For places not on the blue header (optional)
  const panelBtn = `p-2.5 rounded-full transition-colors ${
    isDark ? "text-secondary hover:bg-slate-800" : "text-secondary hover:bg-slate-100 hover:text-primary"
  }`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={variant === "header" ? headerBtn : panelBtn}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

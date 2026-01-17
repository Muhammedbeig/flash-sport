"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initial mount - check for saved theme or system preference
  useEffect(() => {
    setMounted(true);
    try {
      const storedTheme = localStorage.getItem("theme") as Theme | null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme: Theme = storedTheme ?? (prefersDark ? "dark" : "light");
      
      setTheme(initialTheme);
      applyTheme(initialTheme);
    } catch (e) {
      console.warn("ThemeProvider init error:", e);
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the correct class
    root.classList.add(newTheme);
    
    // Set data-theme attribute for third-party widgets
    root.setAttribute("data-theme", newTheme);
    
    // Also set a CSS variable that can be used
    root.style.setProperty("--current-theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    try {
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    } catch (e) {
      console.warn("ThemeProvider toggle error:", e);
    }
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
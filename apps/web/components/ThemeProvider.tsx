"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  // Gates the apply/persist effect until the stored theme has been read.
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    // Read the stored theme once, before anything is allowed to write. StrictMode
    // mounts effects twice in development; persisting the "system" default here
    // would overwrite the stored value, and the second pass would then read that
    // default back — losing the user's choice on every reload.
    let savedTheme: Theme | null = null;
    try {
      savedTheme = localStorage.getItem("theme") as Theme | null;
    } catch {
      // Storage can be unavailable (private mode); the system default stands.
    }
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;

    const applyTheme = (currentTheme: Theme) => {
      const isDark =
        currentTheme === "dark" ||
        (currentTheme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // Listen for system theme changes if set to system
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, restored]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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

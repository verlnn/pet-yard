"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function resolveSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialThemeState(): { theme: Theme; resolvedTheme: ResolvedTheme } {
  if (typeof window === "undefined") {
    return { theme: "system", resolvedTheme: "light" };
  }

  const theme = getStoredTheme();
  const resolvedTheme = theme === "system" ? resolveSystemTheme() : theme;

  return { theme, resolvedTheme };
}

function applyTheme(theme: Theme): ResolvedTheme {
  const resolvedTheme = theme === "system" ? resolveSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;
  return resolvedTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialThemeState().theme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => getInitialThemeState().resolvedTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const storedTheme = getStoredTheme();
      if (storedTheme === "system") {
        setResolvedTheme(applyTheme("system"));
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setTheme = (nextTheme: Theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
    setResolvedTheme(applyTheme(nextTheme));
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}

export const themeScript = `(function() {
  const stored = localStorage.getItem('theme');

  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
    document.documentElement.style.colorScheme = stored;
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = prefersDark ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;
})();`;

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ThemeContext, type ThemeColor, type ThemeMode } from "./theme-context-value";

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

const DEFAULT_MODE: ThemeMode = "light";
const MODE_STORAGE_KEY = "saas-telecom-theme-mode";

const PWA_THEME_COLORS: Record<ThemeMode, string> = {
  light: "#ffffff",
  dark: "#020617",
};

export const ThemeProvider = ({
  children,
  initialMode = DEFAULT_MODE,
}: ThemeProviderProps) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    return (savedMode as ThemeMode) || initialMode;
  });

  // Keep the legacy primaryColor property available with default only
  const [primaryColor] = useState<ThemeColor>("default");

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, themeMode);

    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${themeMode}`);

    const themeColor = PWA_THEME_COLORS[themeMode];
    updatePWAThemeColor(themeColor);
  }, [themeMode]);

  const updatePWAThemeColor = (color: string) => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", color);
    }

    const tileColorMeta = document.querySelector(
      'meta[name="msapplication-TileColor"]'
    );
    if (tileColorMeta) {
      tileColorMeta.setAttribute("content", color);
    }

    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.setAttribute(
        "href",
        `/manifest?theme=${encodeURIComponent(color)}`
      );
    }
  };

  const toggleThemeMode = () => {
    setThemeMode((current) => (current === "light" ? "dark" : "light"));
  };

  const contextValue = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode,
      primaryColor,
      setPrimaryColor: () => { },
    }),
    [themeMode, primaryColor]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

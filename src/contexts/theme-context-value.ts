import { createContext } from "react";

// Available theme modes
export type ThemeMode = "light" | "dark";

// Legacy color type preserved for compatibility
export type ThemeColor = "default";

// Theme context type
export interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  primaryColor: ThemeColor;
  setPrimaryColor: (color: ThemeColor) => void;
}

// Create context with default values
export const ThemeContext = createContext<ThemeContextType>({
  themeMode: "light",
  setThemeMode: () => {},
  toggleThemeMode: () => {},
  primaryColor: "default",
  setPrimaryColor: () => {},
});

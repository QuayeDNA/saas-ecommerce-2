type ProviderColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

type ThemedProviderColors = {
  light: ProviderColors;
  dark: ProviderColors;
};

type ProviderColorMap = {
  [key: string]: ThemedProviderColors;
};

const DEFAULT_MODE = "light" as const;

type ThemeMode = typeof DEFAULT_MODE | "dark";

const getBrowserThemeMode = (): ThemeMode => {
  if (typeof document === "undefined") return DEFAULT_MODE;
  return document.body.classList.contains("theme-dark") ? "dark" : "light";
};

/**
 * Map of network provider names to their brand colors
 */
export const providerColors: ProviderColorMap = {
  MTN: {
    light: {
      primary: "#ffc403",
      secondary: "#1A2526",
      background: "#FFF8E1",
      text: "#000000",
    },
    dark: {
      primary: "#ffc403",
      secondary: "#E6C200",
      background: "#202528",
      text: "#FFFFFF",
    },
  },
  TELECEL: {
    light: {
      primary: "#f8020f",
      secondary: "#37474F",
      background: "#FFEBEE",
      text: "#FFFFFF",
    },
    dark: {
      primary: "#f8020f",
      secondary: "#f28b94",
      background: "#2A2F33",
      text: "#FFFFFF",
    },
  },
  AT: {
    light: {
      primary: "#223d76",
      secondary: "#e8262c",
      background: "#E3F2FD",
      text: "#FFFFFF",
    },
    dark: {
      primary: "#8ca8ff",
      secondary: "#e8262c",
      background: "#152238",
      text: "#FFFFFF",
    },
  },
  AFA: {
    light: {
      primary: "#2E7D32",
      secondary: "#1B5E20",
      background: "#E8F5E9",
      text: "#FFFFFF",
    },
    dark: {
      primary: "#7cc57c",
      secondary: "#a8d5a8",
      background: "#152a1c",
      text: "#FFFFFF",
    },
  },
  default: {
    light: {
      primary: "#9CA3AF",
      secondary: "#4B5563",
      background: "#F9FAFB",
      text: "#111827",
    },
    dark: {
      primary: "#9CA3AF",
      secondary: "#D1D5DB",
      background: "#111827",
      text: "#F8FAFC",
    },
  },
};

/**
 * Get provider brand colors
 * @param providerName - The name of the network provider
 * @returns The brand colors for the provider or default colors if not found
 */
export const getProviderColors = (
  providerName: string | undefined,
  themeMode?: ThemeMode
): ProviderColors => {
  const mode = themeMode ?? getBrowserThemeMode();
  const normalizedName = providerName
    ? Object.keys(providerColors).find(
        (name) => name.toLowerCase() === providerName.toLowerCase()
      )
    : null;

  const providerKey = normalizedName ?? "default";
  return providerColors[providerKey][mode];
};
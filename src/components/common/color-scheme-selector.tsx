import React from "react";
import { useTheme } from "../../hooks/use-theme";

const themeOptions = [
  {
    id: "light",
    label: "Light mode",
    description: "Clean, bright interface for daytime use",
    bg: "#f8fafc",
    accent: "#0f172a",
  },
  {
    id: "dark",
    label: "Dark mode",
    description: "Low-light friendly interface for night-time use",
    bg: "#0f172a",
    accent: "#e2e8f0",
  },
] as const;

type ThemeMode = "light" | "dark";

export const ColorSchemeSelector: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Theme</h3>
        <p className="text-sm text-[var(--color-muted-text)] mt-1">
          Choose between light and dark appearance for the app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleModeChange(option.id)}
            className={`relative p-4 rounded-2xl border transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] ${themeMode === option.id
                ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] shadow-sm"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl border border-[var(--color-border)]"
                style={{ backgroundColor: option.bg }}
              />
              <div>
                <div className="font-semibold text-[var(--color-text)]">{option.label}</div>
                <div className="text-sm text-[var(--color-muted-text)]">{option.description}</div>
              </div>
            </div>
            {themeMode === option.id && (
              <div className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="text-xs text-[var(--color-muted-text)] mt-3">
        Your theme preference is saved automatically and will be applied across the app.
      </div>
    </div>
  );
};

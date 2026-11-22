import { createContext } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

export const THEME_STORAGE_KEY = "streamline-theme";

export const ThemeContext = createContext<ThemeContextValue | null>(null);

"use client";

import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme-init-script.mjs";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange
      // The page applies the stored theme with its own constant script (lib/theme-init-script.mjs, see the root layout):
      // the one next-themes writes has a text that depends on the bundler, so it cannot be allowed by a stable hash.
      // As a JSON data block it is inert; the library still keeps the theme in step once the page is interactive.
      scriptProps={{ type: "application/json" }}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme(): ThemeProviderState {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  return {
    theme: (theme as Theme) || "system",
    resolvedTheme: (resolvedTheme as "dark" | "light") || "dark",
    setTheme: setTheme as (theme: Theme) => void,
  };
}

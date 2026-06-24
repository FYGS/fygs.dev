"use client";

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
  defaultTheme = "dark",
  storageKey = "fygs-theme",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange
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

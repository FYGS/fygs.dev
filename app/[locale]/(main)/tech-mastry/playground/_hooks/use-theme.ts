import { useEffect } from "react";
import type { Theme } from "../_config/themes";
import { useEditorStore } from "../_stores/editor-store";

export function useTheme() {
  const { theme, setTheme } = useEditorStore();

  const toggleTheme = () => {
    const newTheme: Theme = theme === "vs-dark" ? "vs-light" : "vs-dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = isDark ? "vs-dark" : "vs-light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", isDark);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "vs-dark" : "vs-light");
      document.documentElement.classList.toggle("dark", e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme]);

  return { theme, toggleTheme };
}

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "../_hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <Label>Theme</Label>
      <Button variant="outline" size="icon" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </Button>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { platformConfig } from "../_config/platform-config";

export function createGlassStyle(
  intensity: "low" | "medium" | "high" = "medium",
  isDark = false
) {
  const { glass } = platformConfig.appearance;
  const opacityMap = {
    low: 0.3,
    medium: 0.5,
    high: 0.8,
  };

  return {
    backgroundColor: isDark
      ? `rgba(0,0,0,${opacityMap[intensity]})`
      : `rgba(255,255,255,${opacityMap[intensity]})`,
    backdropFilter: `blur(${glass.blur})`,
    WebkitBackdropFilter: `blur(${glass.blur})`,
    borderRadius: "1rem",
    border: glass.border,
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
  };
}

export const glassCard = cn(
  "relative overflow-hidden transition-all",
  "before:absolute before:inset-0",
  "before:bg-gradient-to-br before:from-white/10 before:to-white/5",
  "before:rounded-[inherit] before:-z-10",
  "after:absolute after:inset-0",
  "after:bg-gradient-to-br after:from-white/10 after:to-transparent",
  "after:rounded-[inherit] after:-z-10"
);

"use client";

import { useTheme } from "@/providers/theme-provider";
import { useMounted } from "../../_hooks/use-mounted";
import { skillLabel } from "./progress-dashboard/icons";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillRadarChartProps {
  skills: Record<string, number>;
}

export function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Format the skills data for the radar chart
  const data = Object.entries(skills).map(([key, value]) => ({
    subject: skillLabel(key),
    value,
    fullMark: 100,
  }));

  // Wait for theme to be available (mounted is false until hydration is done)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse bg-muted/50 h-[300px] w-[300px] rounded-full"></div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid
          stroke={isDark ? "hsl(var(--muted))" : "hsl(var(--border))"}
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fill: isDark ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
            fontWeight: 500,
          }}
          fontSize={12}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          stroke={isDark ? "hsl(var(--muted))" : "hsl(var(--border))"}
        />
        <Radar
          name="Niveau"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark
              ? "hsl(var(--background))"
              : "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            color: isDark ? "hsl(var(--foreground))" : "#333",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
          formatter={(value) => [`${value} %`, "Niveau"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

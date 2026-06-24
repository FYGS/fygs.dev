"use client";

import { Flame, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationStatsProps {
  totalXp: number;
  currentStreak: number;
  todayXp: number;
  className?: string;
}

export function GamificationStats({
  totalXp,
  currentStreak,
  todayXp,
  className,
}: GamificationStatsProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <Flame
          className={cn(
            "h-5 w-5",
            currentStreak > 0 ? "text-orange-500" : "text-muted-foreground",
          )}
        />
        <span className="text-sm font-medium">{currentStreak}j</span>
      </div>

      {/* XP Today */}
      <div className="flex items-center gap-1.5">
        <Zap className="h-5 w-5 text-yellow-500" />
        <span className="text-sm font-medium">+{todayXp} XP</span>
      </div>

      {/* Total XP */}
      <div className="flex items-center gap-1.5">
        <Trophy className="h-5 w-5 text-purple-500" />
        <span className="text-sm font-medium">{totalXp.toLocaleString()}</span>
      </div>
    </div>
  );
}

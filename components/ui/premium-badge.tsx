"use client";

import { Crown, Sparkles } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  variant?: "default" | "subtle";
}

export function PremiumBadge({ className, variant = "default" }: PremiumBadgeProps) {
  if (variant === "subtle") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "bg-gradient-to-r from-purple-100 to-indigo-100",
          "dark:from-purple-950/50 dark:to-indigo-950/50",
          "text-purple-700 dark:text-purple-300",
          "border-purple-200 dark:border-purple-800",
          "hover:from-purple-200 hover:to-indigo-200",
          "dark:hover:from-purple-950/60 dark:hover:to-indigo-950/60",
          className
        )}
      >
        <Crown className="h-3.5 w-3.5 mr-1" />
        Premium
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600",
        "hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500",
        "border-0 text-white font-medium",
        "animate-gradient bg-[length:200%_auto]",
        className
      )}
    >
      <Crown className="h-3.5 w-3.5 mr-1" />
      Premium
      <Sparkles className="h-3 w-3 absolute -top-0.5 -right-0.5 animate-pulse" />
    </Badge>
  );
}
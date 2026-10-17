"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface StreakCalendarProps {
  streakDays: number;
}

const DAYS_SHOWN = 30;

// Simulate activity data - in a real app, this would come from an API
function simulateActivity(streakDays: number) {
  return Array.from({ length: DAYS_SHOWN }, (_, index) => {
    // For demo purposes, mark the last 'streakDays' as active
    // and some random days before that
    const isActive =
      index >= DAYS_SHOWN - streakDays ||
      (index < DAYS_SHOWN - streakDays && Math.random() > 0.6);

    return {
      isActive,
      intensity: isActive ? Math.floor(Math.random() * 3) + 1 : 0, // 0-3 intensity levels
    };
  });
}

export function StreakCalendar({ streakDays }: StreakCalendarProps) {
  // Generate the last 30 days
  const today = new Date();
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date;
  }).reverse();

  // The simulated activity is drawn once per streak length, not on every render
  const [simulation, setSimulation] = useState(() => ({
    streakDays,
    activity: simulateActivity(streakDays),
  }));
  let activity = simulation.activity;
  if (simulation.streakDays !== streakDays) {
    activity = simulateActivity(streakDays);
    setSimulation({ streakDays, activity });
  }
  const activityData = days.map((day, index) => ({ date: day, ...activity[index] }));

  // Format day name
  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {formatDate(days[0])} - {formatDate(days[days.length - 1])}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">{streakDays} day streak</span>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </div>
      </div>

      <div className="grid grid-cols-15 gap-1.5">
        {activityData.map((day, i) => (
          <div key={i} className="flex flex-col items-center">
            {i % 2 === 0 && (
              <div className="text-xs text-muted-foreground mb-1">
                {formatDay(day.date)}
              </div>
            )}
            <div
              className={cn(
                "w-6 h-6 rounded-sm flex items-center justify-center text-xs",
                day.isActive
                  ? day.intensity === 1
                    ? "bg-green-500/20 text-green-500"
                    : day.intensity === 2
                    ? "bg-green-500/40 text-green-500"
                    : "bg-green-500/60 text-green-500"
                  : "bg-muted/30 text-muted-foreground"
              )}
              title={`${formatDate(day.date)}${
                day.isActive ? " - Active" : " - Inactive"
              }`}
            >
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30"></div>
          <span className="text-xs text-muted-foreground">No activity</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500/20"></div>
          <span className="text-xs text-muted-foreground">Light</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500/40"></div>
          <span className="text-xs text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500/60"></div>
          <span className="text-xs text-muted-foreground">Heavy</span>
        </div>
      </div>
    </div>
  );
}

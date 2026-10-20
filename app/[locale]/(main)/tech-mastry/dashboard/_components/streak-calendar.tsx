"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { dayKey } from "../../_utils/progress-model";

interface StreakCalendarProps {
  streakDays: number;
  /** Activity count per UTC day (yyyy-mm-dd): what the learner actually did */
  activityByDay: Record<string, number>;
  /** Last day shown; defaults to today */
  today?: Date;
}

const DAYS_SHOWN = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const formatDay = (date: Date) => date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).charAt(0);
const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** 0 = nothing, 1 = opened the section, 2 = a few things, 3 = a busy day */
const intensity = (count: number) => (count <= 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3);

export function StreakCalendar({ streakDays, activityByDay, today = new Date() }: StreakCalendarProps) {
  const last = Date.parse(`${dayKey(today)}T00:00:00Z`);
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const date = new Date(last - (DAYS_SHOWN - 1 - i) * DAY_MS);
    const count = activityByDay[dayKey(date)] ?? 0;
    return { date, count, level: intensity(count) };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {formatDate(days[0].date)} - {formatDate(days[days.length - 1].date)}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">
            {streakDays} day{streakDays === 1 ? "" : "s"} streak
          </span>
          {streakDays > 0 && <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />}
        </div>
      </div>

      <div className="grid grid-cols-15 gap-1.5">
        {days.map((day, i) => (
          <div key={day.date.getTime()} className="flex flex-col items-center">
            {i % 2 === 0 && (
              <div className="text-xs text-muted-foreground mb-1" aria-hidden="true">
                {formatDay(day.date)}
              </div>
            )}
            <div
              className={cn(
                "w-6 h-6 rounded-sm flex items-center justify-center text-xs",
                day.level === 0 && "bg-muted/30 text-muted-foreground",
                day.level === 1 && "bg-green-500/20 text-foreground",
                day.level === 2 && "bg-green-500/40 text-foreground",
                day.level === 3 && "bg-green-500/60 text-foreground",
              )}
              title={`${formatDate(day.date)}: ${day.count > 0 ? `${day.count} activit${day.count === 1 ? "y" : "ies"}` : "no activity"}`}
            >
              {day.date.getUTCDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        {[
          ["bg-muted/30", "No activity"],
          ["bg-green-500/20", "Light"],
          ["bg-green-500/40", "Medium"],
          ["bg-green-500/60", "Heavy"],
        ].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1">
            <div className={cn("w-3 h-3 rounded-sm", color)}></div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

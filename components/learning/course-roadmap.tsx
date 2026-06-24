"use client";

import { cn } from "@/lib/utils";
import { Check, Play, Lock } from "lucide-react";
import Link from "next/link";

interface RoadmapItem {
  id: string;
  title: string;
  type: "lesson" | "quiz";
  url: string;
  completed: boolean;
  accessible: boolean;
  current: boolean;
}

interface CourseRoadmapProps {
  items: RoadmapItem[];
  className?: string;
}

/**
 * Visual vertical roadmap showing course progression as a timeline
 */
export function CourseRoadmap({ items, className }: CourseRoadmapProps) {
  const completedCount = items.filter((i) => i.completed).length;
  const percentage =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progression</span>
        <span className="text-muted-foreground">
          {completedCount}/{items.length} — {percentage}%
        </span>
      </div>

      {/* Roadmap timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
        {/* Completed progress overlay */}
        <div
          className="absolute left-[11px] top-2 w-0.5 bg-primary transition-all duration-500"
          style={{
            height: `${percentage}%`,
          }}
        />

        <div className="space-y-1">
          {items.map((item) => {
            const node = (
              <div
                className={cn(
                  "relative flex items-center gap-3 p-2 rounded-md transition-colors",
                  item.current && "bg-primary/10",
                  item.accessible && !item.current && "hover:bg-accent/50",
                  !item.accessible && "opacity-50",
                )}
              >
                {/* Dot */}
                <div
                  className={cn(
                    "absolute -left-6 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center bg-background",
                    item.completed && "border-primary bg-primary",
                    item.current && !item.completed && "border-primary",
                    !item.completed &&
                      !item.current &&
                      item.accessible &&
                      "border-muted-foreground",
                    !item.accessible && "border-muted",
                  )}
                >
                  {item.completed ? (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  ) : item.current ? (
                    <Play className="h-3 w-3 text-primary" />
                  ) : !item.accessible ? (
                    <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  )}
                </div>

                {/* Title */}
                <span
                  className={cn(
                    "text-sm truncate",
                    item.current && "font-medium text-primary",
                    item.completed && "text-muted-foreground line-through",
                    !item.accessible && "text-muted-foreground",
                  )}
                >
                  {item.title}
                </span>
              </div>
            );

            if (item.accessible) {
              return (
                <Link key={item.id} href={item.url} className="block">
                  {node}
                </Link>
              );
            }
            return (
              <div key={item.id} className="cursor-not-allowed">
                {node}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

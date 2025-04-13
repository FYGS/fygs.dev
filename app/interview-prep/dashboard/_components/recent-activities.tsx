"use client";

import { cn } from "@/lib/utils";
import { BookOpen, CheckCircle2, Code2, FileQuestion, X } from "lucide-react";

interface Activity {
  id: string;
  type: "challenge" | "quiz" | "interview" | "learning";
  title: string;
  timestamp: Date;
  result?: "success" | "partial" | "failed";
  score?: number;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "challenge":
        return <Code2 className="h-4 w-4" />;
      case "quiz":
        return <FileQuestion className="h-4 w-4" />;
      case "interview":
        return <Code2 className="h-4 w-4" />;
      case "learning":
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // Get result icon
  const getResultIcon = (result?: Activity["result"]) => {
    if (!result) return null;
    
    switch (result) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "partial":
        return <CheckCircle2 className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <X className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <div
            className={cn(
              "p-1.5 rounded-md",
              activity.type === "challenge" && "bg-blue-500/10 text-blue-500",
              activity.type === "quiz" && "bg-purple-500/10 text-purple-500",
              activity.type === "interview" && "bg-orange-500/10 text-orange-500",
              activity.type === "learning" && "bg-green-500/10 text-green-500"
            )}
          >
            {getActivityIcon(activity.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{activity.title}</h4>
              {getResultIcon(activity.result)}
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(activity.timestamp)}
              </span>
              
              {activity.score !== undefined && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    activity.score >= 80 && "text-green-500",
                    activity.score >= 60 && activity.score < 80 && "text-yellow-500",
                    activity.score < 60 && "text-red-500"
                  )}
                >
                  {activity.score}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

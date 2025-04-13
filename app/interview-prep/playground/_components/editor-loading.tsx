"use client";

import { glassCard } from "@/app/_lib/theme-utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EditorLoading() {
  return (
    <Card className={`${glassCard} p-4 space-y-4 border shadow-lg neon-border`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[180px] pulse-glow" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md pulse-glow" />
          <Skeleton className="h-10 w-10 rounded-md pulse-glow" />
        </div>
      </div>
      <div className="flex justify-center items-center h-[calc(100vh-12rem)] min-h-[400px]">
        <div className="futuristic-spinner" />
        <p className="ml-4 text-primary/80 animate-pulse">
          Initializing Editor...
        </p>
      </div>
    </Card>
  );
}

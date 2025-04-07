"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PostStatsSkeletonProps } from "@/types/blog";

export function PostStatsSkeleton({ className }: PostStatsSkeletonProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    </div>
  );
}

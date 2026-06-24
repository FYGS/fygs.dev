import { Skeleton } from "@/components/ui/skeleton";

export default function LearningLoading() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar skeleton */}
      <aside className="hidden md:block w-80 border-r p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-64" />
          <div className="ml-auto">
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* Video player */}
        <Skeleton className="aspect-video w-full max-w-4xl rounded-lg" />

        {/* Content */}
        <div className="max-w-4xl space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </main>
    </div>
  );
}

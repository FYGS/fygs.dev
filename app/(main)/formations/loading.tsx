import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {/* Hero skeleton */}
      <div className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto text-center space-y-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-16 w-full max-w-3xl mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="container py-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <LoadingSkeleton />;
}

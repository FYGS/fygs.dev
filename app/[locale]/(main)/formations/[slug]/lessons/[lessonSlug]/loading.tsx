import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-800">
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="aspect-video w-full bg-slate-700" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-slate-700" />
              <Skeleton className="h-4 w-full bg-slate-700" />
              <Skeleton className="h-4 w-2/3 bg-slate-700" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Skeleton className="h-64 w-full bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonLoading() {
  return <LoadingSkeleton />;
}

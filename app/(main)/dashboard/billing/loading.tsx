import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container py-8 max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function BillingLoading() {
  return <LoadingSkeleton />;
}

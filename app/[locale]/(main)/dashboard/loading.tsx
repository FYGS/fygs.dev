import { Skeleton } from "@/components/ui/skeleton";
import { PageLoading } from "@/components/learning/page-loading";

export default function DashboardLoading() {
  return (
    <PageLoading label="Chargement du tableau de bord…" className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:py-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </PageLoading>
  );
}

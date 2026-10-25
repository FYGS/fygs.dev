import { Skeleton } from "@/components/ui/skeleton";
import { PageLoading } from "@/components/learning/page-loading";

export default function PathLoading() {
  return (
    <PageLoading label="Chargement du parcours…" className="container mx-auto max-w-6xl space-y-8 py-10">
      <Skeleton className="h-4 w-40" />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </PageLoading>
  );
}

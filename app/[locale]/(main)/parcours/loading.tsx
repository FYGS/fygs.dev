import { Skeleton } from "@/components/ui/skeleton";

export default function PathsLoading() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-10" aria-busy="true" aria-label="Chargement des parcours">
      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

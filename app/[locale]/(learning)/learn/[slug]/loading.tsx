import { Skeleton } from "@/components/ui/skeleton";

/** Shown inside the learning shell while a lesson, quiz or exam loads: the plan and top bar stay. */
export default function LearningLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

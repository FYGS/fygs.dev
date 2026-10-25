import { Skeleton } from "@/components/ui/skeleton";
import { PageLoading } from "@/components/learning/page-loading";

export default function PathCertificateLoading() {
  return (
    <PageLoading label="Chargement du certificat…" className="container mx-auto max-w-3xl space-y-6 py-10">
      <Skeleton className="h-96 rounded-xl" />
      <div className="flex justify-center gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
    </PageLoading>
  );
}

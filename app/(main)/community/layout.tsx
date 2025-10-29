import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </div>
  );
}
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
            <div className="container py-8 max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-80 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FormationsLoading() {
    return <LoadingSkeleton />;
}

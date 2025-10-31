import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Flame } from "lucide-react";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { DiscussionCard } from "@/components/community/discussion-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TrendingPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function TrendingContent({ searchParams }: TrendingPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 20;

  try {
    // Get trending discussions (sorted by engagement score)
    const trendingResult = await CommunityService.getDiscussions({
      sort: "trending",
      page,
      limit: pageSize,
    }, session?.user?.id);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/community" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Community
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                <h1 className="text-2xl font-bold">Trending Discussions</h1>
              </div>
              <p className="text-muted-foreground">
                Most engaging discussions from the community
              </p>
            </div>

            {/* Trending Discussions */}
            {trendingResult.discussions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No trending discussions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start engaging with discussions to see trending content here.
                  </p>
                  <Button asChild>
                    <Link href="/community">
                      Explore Discussions
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {trendingResult.discussions.map((discussion, index) => (
                  <div key={discussion.id} className="relative">
                    {index < 3 && (
                      <div className="absolute -left-2 -top-2 z-10">
                        <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                    )}
                    <DiscussionCard discussion={discussion} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {trendingResult.pagination && trendingResult.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <Link href={`/community/trending?page=${page - 1}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                
                <span className="flex items-center px-3 py-2 text-sm">
                  Page {page} of {trendingResult.pagination.totalPages}
                </span>

                {page < trendingResult.pagination.totalPages && (
                  <Button variant="outline" asChild>
                    <Link href={`/community/trending?page=${page + 1}`}>
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading trending discussions:", error);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Error Loading Content</h1>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default function TrendingPage({ searchParams }: TrendingPageProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-6">
            <LoadingSpinner />
          </div>
        </div>
      }
    >
      <TrendingContent searchParams={searchParams} />
    </Suspense>
  );
}
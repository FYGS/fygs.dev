import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Users, Heart } from "lucide-react";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { DiscussionCard } from "@/components/community/discussion-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FollowingPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function FollowingContent({ searchParams }: FollowingPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/community/following");
  }

  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 20;

  const loaded = await (async () => {
    try {
      // Get followed topics
      const followedTopics = await CommunityService.getFollowedTopics(session.user.id);

      if (followedTopics.length === 0) {
        return { followedTopics, discussionsResult: null };
      }

      // Get discussions from followed topics
      const topicIds = followedTopics.map(topic => topic.id);
      const discussionsResult = await CommunityService.getDiscussions({
        topicId: topicIds[0], // For now, we'll need to modify service to handle multiple topics
        sort: "recent",
        page,
        limit: pageSize,
      }, session.user.id);

      return { followedTopics, discussionsResult };
    } catch (error) {
      console.error("Error loading following content:", error);
      return null;
    }
  })();

  if (!loaded) {
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

  const { followedTopics, discussionsResult } = loaded;

  if (!discussionsResult) {
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Following</h1>
              </div>
              <p className="text-muted-foreground">
                Discussions from topics you follow
              </p>
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Not following any topics yet</h3>
                <p className="text-muted-foreground mb-4">
                  Follow topics that interest you to see relevant discussions here.
                </p>
                <Button asChild>
                  <Link href="/community">
                    Explore Topics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Following</h1>
              </div>
              <p className="text-muted-foreground">
                Discussions from topics you follow
              </p>
            </div>

            {/* Followed Topics */}
            <div className="flex flex-wrap gap-2">
              {followedTopics.map(topic => (
                <Badge key={topic.id} variant="secondary" className="gap-1">
                  {topic.icon && <span>{topic.icon}</span>}
                  {topic.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Following Discussions */}
          {discussionsResult.discussions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No recent discussions</h3>
                <p className="text-muted-foreground mb-4">
                  No recent activity in the topics you follow. Check back later!
                </p>
                <Button asChild>
                  <Link href="/community">
                    Explore All Discussions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {discussionsResult.discussions.map(discussion => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {discussionsResult.pagination && discussionsResult.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link href={`/community/following?page=${page - 1}`}>
                    Previous
                  </Link>
                </Button>
              )}

              <span className="flex items-center px-3 py-2 text-sm">
                Page {page} of {discussionsResult.pagination.totalPages}
              </span>

              {page < discussionsResult.pagination.totalPages && (
                <Button variant="outline" asChild>
                  <Link href={`/community/following?page=${page + 1}`}>
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
}

export default function FollowingPage({ searchParams }: FollowingPageProps) {
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
      <FollowingContent searchParams={searchParams} />
    </Suspense>
  );
}
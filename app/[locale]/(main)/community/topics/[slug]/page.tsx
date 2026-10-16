import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { TopicContentClient } from "./_components/topic-content-client";

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

async function TopicContent({ params, searchParams }: TopicPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const loaded = await (async () => {
    try {
      // Get topic by slug
      const topics = await CommunityService.getTopics();
      const topic = topics.find((t) => t.slug === resolvedParams.slug);

      if (!topic) {
        notFound();
      }

      const page = parseInt(resolvedSearchParams.page || "1");
      const sortBy = (resolvedSearchParams.sort || "recent") as "recent" | "trending" | "top";

      // Get discussions for this topic
      const { discussions } = await CommunityService.getDiscussions(
        {
          topicId: topic.id,
          page,
          limit: 20,
          sort: sortBy,
        },
        session?.user?.id
      );

      // Sort discussions
      const sortedDiscussions = [...discussions].sort((a, b) => {
        switch (sortBy) {
          case "trending":
            return (b.upvoteCount - b.downvoteCount) - (a.upvoteCount - a.downvoteCount);
          case "top":
            return b.viewCount - a.viewCount;
          case "recent":
          default:
            return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
        }
      });

      // Check if user follows this topic
      const isFollowing = session?.user
        ? await CommunityService.isFollowingTopic(session.user.id, topic.id)
        : false;

      return { topics, topic, sortBy, sortedDiscussions, isFollowing };
    } catch (error) {
      console.error("Error loading topic:", error);
      notFound();
    }
  })();

  const { topics, topic, sortBy, sortedDiscussions, isFollowing } = loaded;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/community/topics" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Topics
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TopicContentClient
              topic={topic}
              discussions={sortedDiscussions}
              sortBy={sortBy}
              isFollowing={isFollowing}
              isAuthenticated={!!session?.user}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topics
                    .filter((t) => t.id !== topic.id)
                    .slice(0, 5)
                    .map((relatedTopic) => (
                      <Link
                        key={relatedTopic.id}
                        href={`/community/topics/${relatedTopic.slug}`}
                        className="block p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {relatedTopic.icon && (
                            <span className="text-lg">{relatedTopic.icon}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {relatedTopic.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {relatedTopic._count?.discussions || 0} discussions
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Topic Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Topic Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Discussions</span>
                    <Badge variant="secondary">
                      {topic._count?.discussions || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Followers</span>
                    <Badge variant="secondary">
                      {topic._count?.followers || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopicPage({ params, searchParams }: TopicPageProps) {
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
      <TopicContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

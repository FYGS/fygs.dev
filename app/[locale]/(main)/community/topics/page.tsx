import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Users, MessageCircle, TrendingUp } from "lucide-react";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { FollowTopicButton } from "@/components/community/follow-topic-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

async function TopicsContent() {
  const session = await auth.api.getSession({ headers: await headers() });

  const loaded = await (async () => {
    try {
      const topics = await CommunityService.getTopics(session?.user?.id);
      
      // Separate default and custom topics
      const defaultTopics = topics.filter(topic => topic.isDefault);
      const customTopics = topics.filter(topic => !topic.isDefault);

      return { topics, defaultTopics, customTopics };
    } catch (error) {
      console.error("Error loading topics:", error);
      return null;
    }
  })();

  if (!loaded) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Error Loading Topics</h1>
              <p className="text-slate-400">Please try again later.</p>
            </div>
          </div>
        </div>
      );
  }

  const { topics, defaultTopics, customTopics } = loaded;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
            <h1 className="text-3xl font-bold">Community Topics</h1>
            <p className="text-slate-400">
              Explore all discussion topics and find communities that interest you
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-950 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {topics.reduce((sum, topic) => sum + (topic._count?.discussions || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-400">Total Discussions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-950 rounded-lg">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {topics.reduce((sum, topic) => sum + (topic._count?.followers || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-400">Total Followers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-950 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{topics.length}</div>
                    <div className="text-sm text-slate-400">Active Topics</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Default Topics */}
          {defaultTopics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Core Topics</h2>
                <Badge variant="secondary">Featured</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </div>
          )}

          {/* Custom Topics */}
          {customTopics.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Community Topics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </div>
          )}

          {topics.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Topics Found</h3>
                <p className="text-slate-400">
                  There are no discussion topics available at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {topic.icon && (
              <div className="text-2xl">{topic.icon}</div>
            )}
            <div>
              <CardTitle className="text-lg">{topic.name}</CardTitle>
              {topic.description && (
                <p className="text-sm text-slate-400 mt-1">
                  {topic.description}
                </p>
              )}
            </div>
          </div>
          <FollowTopicButton
            topicId={topic.id}
            topicName={topic.name}
            isFollowing={topic.isFollowing}
            variant="default"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-slate-500" />
              <span className="text-slate-400">
                {topic._count?.discussions || 0} discussions
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-slate-400">
                {topic._count?.followers || 0} followers
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/community/topics/${topic.slug}`}>
              View →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TopicsPage() {
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
      <TopicsContent />
    </Suspense>
  );
}
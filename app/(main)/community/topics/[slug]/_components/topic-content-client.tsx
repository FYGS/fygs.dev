"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscussionCard } from "@/components/community/discussion-card";
import { CompactDiscussionComposer } from "@/components/community/discussion-composer";
import { FollowTopicButton } from "@/components/community/follow-topic-button";
import type { CommunityTopic } from "@/types/community";

interface TopicContentClientProps {
  topic: CommunityTopic & {
    _count?: {
      discussions?: number;
      followers?: number;
    };
  };
  discussions: any[];
  sortBy: string;
  isFollowing: boolean;
  isAuthenticated: boolean;
}

export function TopicContentClient({
  topic,
  discussions,
  sortBy,
  isFollowing,
  isAuthenticated,
}: TopicContentClientProps) {
  const router = useRouter();

  return (
    <>
      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {topic.icon && (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: topic.color + "20" }}
                  >
                    {topic.icon}
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">{topic.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {topic.description}
                  </p>
                </div>
              </div>
            </div>

            {isAuthenticated && (
              <FollowTopicButton
                topicId={topic.id}
                topicName={topic.name}
                isFollowing={isFollowing}
                variant="default"
                size="default"
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{topic._count?.discussions || 0} discussions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{topic._count?.followers || 0} followers</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Discussion Composer */}
      {isAuthenticated && (
        <CompactDiscussionComposer
          topics={[topic]}
          onSuccess={(discussionId) => {
            router.push(`/community/discussions/${discussionId}`);
          }}
          placeholder={`Start a discussion in ${topic.name}...`}
        />
      )}

      {/* Discussions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Discussions</CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === "recent" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={`?sort=recent`}>Recent</Link>
              </Button>
              <Button
                variant={sortBy === "trending" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={`?sort=trending`}>Trending</Link>
              </Button>
              <Button
                variant={sortBy === "top" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={`?sort=top`}>Top</Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💭</div>
              <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a discussion in this topic!
              </p>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/community/new">Start Discussion</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

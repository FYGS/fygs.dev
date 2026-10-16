import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { ReplyComposer } from "@/components/community/reply-composer";
import { InteractiveReplies } from "@/components/community/interactive-replies";
import { UserBadges } from "@/components/community/user-badges";
import { MDXContent } from "@/components/community/mdx-content";
import { DiscussionActions } from "@/components/community/discussion-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DiscussionPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    sort?: "oldest" | "newest" | "best";
  }>;
}

async function DiscussionContent({ params, searchParams }: DiscussionPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const loaded = await (async () => {
    try {
      const discussion = await CommunityService.getDiscussionById(resolvedParams.id, {
        userId: session?.user?.id,
        includeReplies: true,
      });

      if (!discussion) {
        notFound();
      }
      const sortBy = resolvedSearchParams.sort || "oldest";

      // Sort replies based on the sort parameter
      const sortedReplies = [...(discussion.replies || [])].sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "best":
            return (b._count.votes || 0) - (a._count.votes || 0);
          case "oldest":
          default:
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
      });

      return { discussion, sortedReplies, sortBy };
    } catch (error) {
      console.error("Error loading discussion:", error);
      notFound();
    }
  })();

  const { discussion, sortedReplies, sortBy } = loaded;

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
          {/* Main Discussion */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {discussion.topic && (
                      <Badge variant="outline">
                        {discussion.topic.icon && (
                          <span className="mr-1">{discussion.topic.icon}</span>
                        )}
                        {discussion.topic.name}
                      </Badge>
                    )}
                    
                    {discussion.course && (
                      <Badge variant="secondary">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {discussion.course.title}
                      </Badge>
                    )}

                    {discussion.isPinned && (
                      <Badge variant="default">Pinned</Badge>
                    )}
                  </div>

                  <CardTitle className="text-2xl leading-tight">
                    {discussion.title}
                  </CardTitle>

                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Link 
                      href={`/community/users/${discussion.author.id}`}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={discussion.author.image || ""} />
                        <AvatarFallback className="text-xs">
                          {discussion.author.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{discussion.author.name}</span>
                    </Link>
                    <UserBadges 
                      user={discussion.author as any}
                      showLevel={true}
                      showBadges={false}
                      size="sm"
                    />
                    <span>•</span>
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    {discussion.updatedAt !== discussion.createdAt && (
                      <>
                        <span>•</span>
                        <span>edited</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Discussion Actions */}
                {session?.user && (
                  <DiscussionActions
                    discussionId={discussion.id}
                    content={discussion.content || ""}
                    isPinned={discussion.isPinned}
                    isLocked={discussion.isLocked}
                    isSolved={discussion.isSolved}
                    isAuthor={session.user.id === discussion.authorId}
                    isModerator={
                      session.user.role === "ADMIN" ||
                      session.user.role === "INSTRUCTOR"
                    }
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              {discussion.content && (
                <div className="prose prose-sm max-w-none mb-6">
                  <MDXContent 
                    content={discussion.content}
                    className="leading-relaxed"
                  />
                </div>
              )}

              {/* Discussion stats and actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{discussion._count?.replies || 0} replies</span>
                  <span>{discussion._count?.votes || 0} votes</span>
                  <span>{discussion.viewCount || 0} views</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reply Composer */}
          {session?.user && (
            <ReplyComposer
              discussionId={discussion.id}
              currentUser={{
                id: session.user.id,
                name: session.user.name,
                image: session.user.image || null,
              }}
              placeholder="Share your thoughts..."
            />
          )}

          {/* Replies Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Replies ({sortedReplies.length})
                </CardTitle>

                {sortedReplies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Sort by:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={sortBy === "oldest" ? "default" : "ghost"}
                        size="sm"
                        asChild
                      >
                        <Link href={`?sort=oldest`}>Oldest</Link>
                      </Button>
                      <Button
                        variant={sortBy === "newest" ? "default" : "ghost"}
                        size="sm"
                        asChild
                      >
                        <Link href={`?sort=newest`}>Newest</Link>
                      </Button>
                      <Button
                        variant={sortBy === "best" ? "default" : "ghost"}
                        size="sm"
                        asChild
                      >
                        <Link href={`?sort=best`}>Best</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {sortedReplies.length > 0 ? (
                <InteractiveReplies
                  replies={sortedReplies}
                  discussionId={discussion.id}
                  currentUserId={session?.user?.id}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">No replies yet</h3>
                  <p className="text-slate-400">
                    Be the first to share your thoughts on this discussion!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DiscussionPage({ params, searchParams }: DiscussionPageProps) {
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
      <DiscussionContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
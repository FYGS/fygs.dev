import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Calendar, MessageCircle, ThumbsUp, Bookmark } from "lucide-react";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { DiscussionCard } from "@/components/community/discussion-card";
import { UserBadges } from "@/components/community/user-badges";
import { FollowUserButton } from "@/components/community/follow-user-button";
import { MDXContent } from "@/components/community/mdx-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UserProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
  searchParams: Promise<{
    tab?: "discussions" | "replies" | "bookmarks";
  }>;
}

async function UserProfileContent({ params, searchParams }: UserProfilePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const loaded = await (async () => {
    try {
      const userProfile = await CommunityService.getUserProfile(resolvedParams.userId);
      
      if (!userProfile) {
        notFound();
      }

      const isOwnProfile = session?.user?.id === resolvedParams.userId;
      const activeTab = resolvedSearchParams.tab || "discussions";

      // Fetch tab-specific data
      const [userReplies, userBookmarks] = await Promise.all([
        activeTab === "replies" ? CommunityService.getUserReplies(resolvedParams.userId) : Promise.resolve([]),
        activeTab === "bookmarks" && isOwnProfile ? CommunityService.getUserBookmarks(resolvedParams.userId) : Promise.resolve([])
      ]);

      return { userProfile, isOwnProfile, activeTab, userReplies, userBookmarks };
    } catch (error) {
      console.error("Error loading user profile:", error);
      notFound();
    }
  })();

  const { userProfile, isOwnProfile, activeTab, userReplies, userBookmarks } = loaded;

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={userProfile.user.image || ""} />
                    <AvatarFallback className="text-2xl">
                      {userProfile.user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h1 className="text-2xl font-bold">{userProfile.user.name}</h1>
                    <Badge variant="secondary" className="mt-2">
                      {userProfile.user.role}
                    </Badge>
                  </div>

                  {/* User Badges and Level */}
                  <UserBadges 
                    user={userProfile.user as any}
                    showLevel={true}
                    showBadges={true}
                    size="lg"
                  />

                  {/* Follow Button */}
                  {!isOwnProfile && session?.user && (
                    <FollowUserButton
                      userId={resolvedParams.userId}
                      userName={userProfile.user.name || "User"}
                      className="w-full"
                    />
                  )}

                  {/* Bio */}
                  {userProfile.user.bio && (
                    <div className="text-left">
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">
                        {userProfile.user.bio}
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="space-y-2">
                    {userProfile.user.githubUrl && (
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={userProfile.user.githubUrl} target="_blank">
                          GitHub Profile
                        </Link>
                      </Button>
                    )}
                    {userProfile.user.linkedinUrl && (
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={userProfile.user.linkedinUrl} target="_blank">
                          LinkedIn Profile
                        </Link>
                      </Button>
                    )}
                    {userProfile.user.websiteUrl && (
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={userProfile.user.websiteUrl} target="_blank">
                          Personal Website
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Discussions</span>
                    </div>
                    <Badge variant="secondary">
                      {userProfile.stats.totalDiscussions}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Replies</span>
                    </div>
                    <Badge variant="secondary">
                      {userProfile.stats.totalReplies}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Upvotes Received</span>
                    </div>
                    <Badge variant="secondary">
                      {userProfile.stats.totalUpvotes}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Member Since</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(userProfile.stats.joinedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="discussions" asChild>
                  <Link href={`/community/users/${resolvedParams.userId}?tab=discussions`}>
                    Discussions
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="replies" asChild>
                  <Link href={`/community/users/${resolvedParams.userId}?tab=replies`}>
                    Replies
                  </Link>
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger value="bookmarks" asChild>
                    <Link href={`/community/users/${resolvedParams.userId}?tab=bookmarks`}>
                      Bookmarks
                    </Link>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="discussions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Discussions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userProfile.recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No discussions created yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userProfile.recentActivity.map((discussion) => (
                          <DiscussionCard
                            key={discussion.id}
                            discussion={discussion}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="replies">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Replies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userReplies.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No replies yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userReplies.map((reply: any) => (
                          <Card key={reply.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Reply to:</span>
                                <Link 
                                  href={`/community/discussions/${reply.discussion.id}`}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {reply.discussion.title}
                                </Link>
                                {reply.discussion.topic && (
                                  <Badge variant="outline" className="text-xs">
                                    {reply.discussion.topic.name}
                                  </Badge>
                                )}
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <MDXContent content={reply.content} />
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{reply._count.votes} votes</span>
                                <span>•</span>
                                <span>{reply._count.replies} replies</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {isOwnProfile && (
                <TabsContent value="bookmarks">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bookmarked Discussions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userBookmarks.length === 0 ? (
                        <div className="text-center py-8">
                          <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No bookmarked discussions yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userBookmarks.map((bookmark: any) => (
                            <DiscussionCard
                              key={bookmark.discussion.id}
                              discussion={bookmark.discussion}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
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
      <UserProfileContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
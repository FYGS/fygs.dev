import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Crown, Users, MessageCircle, Clock, Globe } from "lucide-react";
import { Github, Linkedin } from "@/components/icons/brand-icons";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { getAvailableMentors, getMentorRequests } from "@/app/actions/community-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UserBadges } from "@/components/community/user-badges";
import { MentorRequestButton } from "@/components/community/mentor-request-button";
import { MentorResponseButtons } from "@/components/community/mentor-response-buttons";

interface MentorshipPageProps {
  searchParams: Promise<{
    tab?: "find-mentor" | "become-mentor" | "my-requests";
  }>;
}

async function MentorshipContent({ searchParams }: MentorshipPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/community/mentorship");
  }

  const activeTab = resolvedSearchParams.tab || "find-mentor";

  const loaded = await (async () => {
    try {
      // Fetch data based on active tab
      const [mentorsResult, requestsResult, statsResult] = await Promise.all([
        activeTab === "find-mentor" ? getAvailableMentors() : Promise.resolve({ success: true, data: [] }),
        activeTab === "my-requests" ? getMentorRequests(session.user.id) : Promise.resolve({ success: true, data: { sent: [], received: [] } }),
        CommunityService.getMentorshipStats(),
      ]);

      const mentors = mentorsResult.success ? mentorsResult.data || [] : [];
      const requests = requestsResult.success ? requestsResult.data || { sent: [], received: [] } : { sent: [], received: [] };

      return { mentors, requests, statsResult };
    } catch (error) {
      console.error("Error loading mentorship data:", error);
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

  const { mentors, requests, statsResult } = loaded;

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
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-600" />
              <h1 className="text-2xl font-bold">Mentorship Program</h1>
            </div>
            <p className="text-muted-foreground">
              Connect with experienced developers or share your knowledge with others
            </p>
          </div>

          {/* Program Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold mb-1">Available Mentors</h3>
                <p className="text-2xl font-bold text-blue-600">{statsResult.totalMentors}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold mb-1">Total Requests</h3>
                <p className="text-2xl font-bold text-green-600">{statsResult.totalRequests}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-semibold mb-1">Active Matches</h3>
                <p className="text-2xl font-bold text-yellow-600">{statsResult.activeMatches}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="find-mentor" asChild>
                <Link href="/community/mentorship?tab=find-mentor">
                  Find a Mentor
                </Link>
              </TabsTrigger>
              <TabsTrigger value="become-mentor" asChild>
                <Link href="/community/mentorship?tab=become-mentor">
                  Become a Mentor
                </Link>
              </TabsTrigger>
              <TabsTrigger value="my-requests" asChild>
                <Link href="/community/mentorship?tab=my-requests">
                  My Requests
                </Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="find-mentor">
              <Card>
                <CardHeader>
                  <CardTitle>Available Mentors</CardTitle>
                </CardHeader>
                <CardContent>
                  {mentors.length === 0 ? (
                    <div className="text-center py-8">
                      <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No mentors available</h3>
                      <p className="text-muted-foreground">
                        Check back later for available mentors.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mentors.map((mentor: any) => (
                        <Card key={mentor.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={mentor.image || ""} />
                              <AvatarFallback>
                                {mentor.name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Link 
                                  href={`/community/users/${mentor.id}`}
                                  className="font-semibold hover:text-primary transition-colors"
                                >
                                  {mentor.name}
                                </Link>
                                <Badge variant="secondary">
                                  {mentor.role}
                                </Badge>
                              </div>

                              <UserBadges 
                                user={mentor}
                                showLevel={true}
                                showBadges={true}
                                maxBadges={2}
                                size="sm"
                              />

                              {mentor.bio && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {mentor.bio}
                                </p>
                              )}

                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span>{mentor._count.discussions} discussions</span>
                                <span>{mentor._count.discussionReplies} replies</span>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <MentorRequestButton
                                  mentorId={mentor.id}
                                  mentorName={mentor.name}
                                />
                                
                                <div className="flex gap-1">
                                  {mentor.githubUrl && (
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={mentor.githubUrl} target="_blank" rel="noopener noreferrer nofollow ugc">
                                        <Github className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  )}
                                  {mentor.linkedinUrl && (
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer nofollow ugc">
                                        <Linkedin className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  )}
                                  {mentor.websiteUrl && (
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={mentor.websiteUrl} target="_blank" rel="noopener noreferrer nofollow ugc">
                                        <Globe className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="become-mentor">
              <Card>
                <CardHeader>
                  <CardTitle>Become a Mentor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                      <h3 className="text-lg font-semibold mb-2">Share Your Knowledge</h3>
                      <p className="text-muted-foreground">
                        Help other developers grow by becoming a mentor in the FYGS community.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Requirements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 2+ years of development experience</li>
                          <li>• Active community participation</li>
                          <li>• Commitment to helping others</li>
                          <li>• Regular availability for sessions</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Benefits:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Exclusive mentor badge</li>
                          <li>• Priority support</li>
                          <li>• Network with other mentors</li>
                          <li>• Make a meaningful impact</li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Applications Opening Soon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-requests">
              <div className="space-y-4">
                {/* Sent Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sent Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {requests.sent.length === 0 ? (
                      <div className="text-center py-6">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No mentorship requests sent yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {requests.sent.map((request: any) => (
                          <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.mentor.image || ""} />
                                <AvatarFallback>
                                  {request.mentor.name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.mentor.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                              request.status === "PENDING" ? "secondary" :
                              request.status === "ACCEPTED" ? "default" : "destructive"
                            }>
                              {request.status.toLowerCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Received Requests (if user is a mentor) */}
                {session.user.role === "INSTRUCTOR" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Received Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {requests.received.length === 0 ? (
                        <div className="text-center py-6">
                          <Crown className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">No mentorship requests received yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {requests.received.map((request: any) => (
                            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={request.student.image || ""} />
                                  <AvatarFallback>
                                    {request.student.name?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{request.student.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </p>
                                  {request.message && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      &quot;{request.message}&quot;
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {request.status === "PENDING" && (
                                  <MentorResponseButtons 
                                    requestId={request.id}
                                  />
                                )}
                                <Badge variant={
                                  request.status === "PENDING" ? "secondary" :
                                  request.status === "ACCEPTED" ? "default" : "destructive"
                                }>
                                  {request.status.toLowerCase()}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function MentorshipPage({ searchParams }: MentorshipPageProps) {
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
      <MentorshipContent searchParams={searchParams} />
    </Suspense>
  );
}
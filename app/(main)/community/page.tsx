import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { CommunitySidebar } from "@/components/community/community-sidebar";
import { DiscussionsList } from "@/components/community/discussions-list";
import { CommunityFilters } from "@/components/community/community-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CommunityPageProps {
  searchParams: Promise<{
    topic?: string;
    sort?: "recent" | "trending" | "top";
    filter?: "all" | "unanswered" | "solved";
    page?: string;
  }>;
}

async function CommunityContent({ searchParams }: CommunityPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  // Parse search parameters
  const topicIds = resolvedSearchParams.topic ? [resolvedSearchParams.topic] : [];
  const sortBy = resolvedSearchParams.sort || "recent";
  const filterBy = resolvedSearchParams.filter || "all";
  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 20;

  try {
    // Fetch data in parallel
    const [discussionsResult, topics, followedTopics, unreadNotificationsCount] = await Promise.all([
      CommunityService.getDiscussions({
        topicId: topicIds[0],
        sort: sortBy,
        page,
        limit: pageSize,
        userId: session?.user?.id,
      }),
      CommunityService.getTopics(session?.user?.id),
      session?.user?.id 
        ? CommunityService.getFollowedTopics(session.user.id)
        : Promise.resolve([]),
      session?.user?.id
        ? CommunityService.getUnreadNotificationsCount(session.user.id)
        : Promise.resolve(0),
    ]);

    const discussions = discussionsResult.discussions || [];
    // Remove unused variable
    // const followedTopicIds = followedTopics.map((t: any) => t.id);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <CommunitySidebar
              topics={topics}
              followedTopics={followedTopics.map((t: any) => t.id)}
              unreadNotifications={unreadNotificationsCount}
            />

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Community Discussions</h1>
                    <p className="text-muted-foreground">
                      Share knowledge, ask questions, and connect with fellow learners
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters and Interactive Elements */}
              <CommunityFilters
                topics={topics}
                selectedTopics={topicIds}
                sortBy={sortBy}
                filterBy={filterBy}
                session={session}
              />

              {/* Discussions List */}
              <DiscussionsList
                discussions={discussions}
                currentUserId={session?.user?.id}
                totalPages={discussionsResult.pagination?.totalPages || 1}
                currentPage={page}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading community page:", error);
    notFound();
  }
}

export default function CommunityPage({ searchParams }: CommunityPageProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex gap-6">
              <div className="w-64 shrink-0">
                <LoadingSpinner />
              </div>
              <div className="flex-1">
                <LoadingSpinner />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CommunityContent searchParams={searchParams} />
    </Suspense>
  );
}
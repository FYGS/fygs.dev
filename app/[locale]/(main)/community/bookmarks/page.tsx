import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { DiscussionCard } from "@/components/community/discussion-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface BookmarksPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function BookmarksContent({ searchParams }: BookmarksPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 20;

  try {
    // Get bookmarked discussions
    const bookmarks = await CommunityService.getUserBookmarks(session.user.id, page, pageSize);

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
                <Bookmark className="h-6 w-6" />
                <h1 className="text-2xl font-bold">My Bookmarks</h1>
              </div>
              <p className="text-muted-foreground">
                Discussions you&apos;ve saved for later
              </p>
            </div>

            {/* Bookmarked Discussions */}
            {bookmarks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start bookmarking discussions to save them for later reading.
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
                {bookmarks.map((bookmark: any) => (
                  <DiscussionCard
                    key={bookmark.discussion.id}
                    discussion={bookmark.discussion}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading bookmarks:", error);
    notFound();
  }
}

export default function BookmarksPage({ searchParams }: BookmarksPageProps) {
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
      <BookmarksContent searchParams={searchParams} />
    </Suspense>
  );
}
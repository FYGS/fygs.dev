import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { CommunityService } from "@/lib/services/community-service";
import { NewDiscussionClient } from "./new-discussion-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface NewDiscussionPageProps {
  searchParams: Promise<{
    topic?: string;
    course?: string;
  }>;
}

async function NewDiscussionContent({ searchParams }: NewDiscussionPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  try {
    const topics = await CommunityService.getTopics(session.user.id);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/community" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Community
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Start a New Discussion</h1>
            <p className="text-muted-foreground">
              Share your knowledge, ask questions, or start a conversation with the community.
            </p>
          </div>

          {/* Discussion Composer */}
          <NewDiscussionClient
            topics={topics}
            courseId={resolvedSearchParams.course}
          />

          {/* Guidelines */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">Community Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be respectful and constructive in your discussions</li>
              <li>• Choose the most appropriate topic for your discussion</li>
              <li>• Use clear and descriptive titles</li>
              <li>• Search existing discussions before creating new ones</li>
              <li>• Provide context and details to help others understand</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading new discussion page:", error);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Error</h1>
            <p className="text-muted-foreground">
              Something went wrong. Please try again later.
            </p>
            <Button asChild className="mt-4">
              <Link href="/community">Back to Community</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default function NewDiscussionPage({ searchParams }: NewDiscussionPageProps) {
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
      <NewDiscussionContent searchParams={searchParams} />
    </Suspense>
  );
}
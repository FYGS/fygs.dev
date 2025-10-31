import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ContentModeration } from "@/components/community/admin-dashboard";

async function getModerationData() {
  try {
    const [
      discussions,
      replies
    ] = await Promise.all([
      // Get all discussions for moderation
      db.discussion.findMany({
        include: {
          author: { 
            select: { 
              id: true, 
              name: true, 
              image: true, 
              email: true 
            } 
          },
          topic: { 
            select: { 
              id: true,
              name: true, 
              icon: true 
            } 
          },
          _count: { 
            select: { 
              replies: true, 
              votes: true 
            } 
          }
        },
        orderBy: { createdAt: "desc" },
        take: 100
      }),

      // Get all replies for moderation
      db.discussionReply.findMany({
        include: {
          author: { 
            select: { 
              id: true, 
              name: true, 
              image: true, 
              email: true 
            } 
          },
          discussion: { 
            select: { 
              id: true, 
              title: true,
              topic: { select: { name: true, icon: true } }
            } 
          },
          _count: { 
            select: { 
              votes: true 
            } 
          }
        },
        orderBy: { createdAt: "desc" },
        take: 100
      })
    ]);

    // Transform data for ContentModeration component
    const formattedDiscussions = discussions.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      author: {
        id: d.author.id,
        name: d.author.name || "Unknown",
        avatar: d.author.image || undefined
      },
      topic: {
        id: d.topic.id,
        name: d.topic.name
      },
      isModerated: false,
      isFlagged: false,
      createdAt: d.createdAt,
      repliesCount: d._count.replies,
      votesCount: d.upvoteCount - d.downvoteCount,
      viewsCount: d.viewCount
    }));

    const formattedReplies = replies.map(r => ({
      id: r.id,
      content: r.content,
      author: {
        id: r.author.id,
        name: r.author.name || "Unknown",
        avatar: r.author.image || undefined
      },
      discussion: {
        id: r.discussion.id,
        title: r.discussion.title
      },
      isModerated: false,
      isFlagged: false,
      createdAt: r.createdAt,
      votesCount: r.upvoteCount - r.downvoteCount
    }));

    return {
      discussions: formattedDiscussions,
      replies: formattedReplies
    };
  } catch (error) {
    console.error("Error fetching moderation data:", error);
    return {
      discussions: [],
      replies: []
    };
  }
}

async function ModerationContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  const data = await getModerationData();

  const handleContentAction = (contentId: string, type: "discussion" | "reply", action: string) => {
    console.log("Content action:", contentId, type, action);
    // Actions are handled by the ContentModeration component directly
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review and moderate community content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/community">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Use the Content Moderation Component */}
      <ContentModeration
        discussions={data.discussions}
        replies={data.replies}
        onContentAction={handleContentAction}
      />
    </div>
  );
}

export default function ModerationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingSpinner />
        </div>
      }
    >
      <ModerationContent />
    </Suspense>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { DiscussionCard } from "@/components/community/discussion-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityDiscussion } from "@/types/community";
import { voteOnDiscussion, toggleBookmark } from "@/app/actions/community-actions";

interface DiscussionsListProps {
  discussions: CommunityDiscussion[];
  currentUserId?: string;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DiscussionsList({
  discussions,
  currentUserId,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  className,
}: DiscussionsListProps) {
  const router = useRouter();
  const [optimisticDiscussions, setOptimisticDiscussions] = useState(discussions);

  const handleVote = async (discussionId: string, voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    // Optimistic update
    setOptimisticDiscussions(prev => prev.map(discussion => {
      if (discussion.id !== discussionId) return discussion;

      const currentVote = discussion.userVote?.voteType;
      const isRemoving = currentVote === voteType;
      
      let voteCount = discussion._count.votes || 0;

      // Remove existing vote
      if (currentVote) voteCount--;

      // Add new vote if not removing
      if (!isRemoving) {
        voteCount++;
      }

      return {
        ...discussion,
        _count: {
          ...discussion._count,
          votes: voteCount,
        },
        userVote: isRemoving ? null : {
          id: "",
          userId: currentUserId,
          createdAt: new Date(),
          discussionId: discussionId,
          replyId: null,
          voteType: voteType,
        },
      };
    }));

    try {
      await voteOnDiscussion(discussionId, voteType);
    } catch (error) {
      console.error("Failed to vote:", error);
      // Revert optimistic update on error
      setOptimisticDiscussions(discussions);
    }
  };

  const handleBookmark = async (discussionId: string) => {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    // Optimistic update
    setOptimisticDiscussions(prev => prev.map(discussion => {
      if (discussion.id !== discussionId) return discussion;
      
      return {
        ...discussion,
        isBookmarked: !discussion.isBookmarked,
      };
    }));

    try {
      await toggleBookmark(discussionId);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // Revert optimistic update on error
      setOptimisticDiscussions(discussions);
    }
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      // Update URL if no custom handler
      const url = new URL(window.location.href);
      url.searchParams.set("page", page.toString());
      router.push(url.toString());
    }
  };

  if (optimisticDiscussions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a conversation in this community!
            </p>
            <Button asChild>
              <a href="/community/new">Start Discussion</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {optimisticDiscussions.map((discussion) => (
          <DiscussionCard
            key={discussion.id}
            discussion={discussion}
            onVote={handleVote}
            onBookmark={handleBookmark}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              const isActive = pageNum === currentPage;

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground mt-4">
        Showing {optimisticDiscussions.length} discussion{optimisticDiscussions.length !== 1 ? 's' : ''} 
        {totalPages > 1 && (
          <span> • Page {currentPage} of {totalPages}</span>
        )}
      </div>
    </div>
  );
}
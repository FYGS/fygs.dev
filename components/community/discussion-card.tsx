"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ArrowUp, ArrowDown, BookmarkIcon, Eye, Zap, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CommunityDiscussion } from "@/types/community";
import { MDXContent } from "./mdx-content";

interface DiscussionCardProps {
  discussion: CommunityDiscussion;
  onVote?: (discussionId: string, voteType: "UPVOTE" | "DOWNVOTE") => void;
  onBookmark?: (discussionId: string) => void;
  className?: string;
}

export function DiscussionCard({
  discussion,
  onVote,
  onBookmark,
  className,
}: DiscussionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const voteScore = discussion._count.votes || 0;
  const userVote = discussion.userVote?.voteType;
  const isBookmarked = discussion.isBookmarked;

  // Check if content is long enough to need collapsing
  const contentLength = discussion.content?.length || 0;
  const shouldCollapse = contentLength > 300;

  const handleVote = async (voteType: "UPVOTE" | "DOWNVOTE") => {
    if (onVote) {
      await onVote(discussion.id, voteType);
    }
  };

  const handleBookmark = async () => {
    if (onBookmark) {
      await onBookmark(discussion.id);
    }
  };

  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/community/discussions/${discussion.id}`}
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">
                {discussion.title}
              </h3>
            </Link>
            
            {discussion.content && (
              <div className="mb-3">
                <div className={cn(
                  "text-slate-600 dark:text-slate-300 text-sm prose prose-sm max-w-none",
                  !isExpanded && shouldCollapse && "line-clamp-3"
                )}>
                  <MDXContent 
                    content={discussion.content} 
                    className="[&>*]:mb-1 [&>*:last-child]:mb-0" 
                  />
                </div>
                
                {shouldCollapse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="mt-2 h-6 px-2 text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show more
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Link 
                href={`/community/users/${discussion.author.id}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={discussion.author.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {discussion.author.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{discussion.author.name}</span>
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(discussion.createdAt))} ago</span>
              {discussion.updatedAt !== discussion.createdAt && (
                <>
                  <span>•</span>
                  <span>edited</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                userVote === "UPVOTE" && "text-green-600 bg-green-50 hover:bg-green-100"
              )}
              onClick={() => handleVote("UPVOTE")}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            
            <span className={cn(
              "text-sm font-medium px-1",
              voteScore > 0 && "text-green-600",
              voteScore < 0 && "text-red-600"
            )}>
              {voteScore}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                userVote === "DOWNVOTE" && "text-red-600 bg-red-50 hover:bg-red-100"
              )}
              onClick={() => handleVote("DOWNVOTE")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{discussion._count?.replies || 0}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{discussion.viewCount || 0}</span>
            </div>

            {discussion.isPinned && (
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}

            {discussion.topic && (
              <Badge variant="outline" className="text-xs">
                {discussion.topic.name}
              </Badge>
            )}
          </div>          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isBookmarked && "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
            )}
            onClick={handleBookmark}
          >
            <BookmarkIcon className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
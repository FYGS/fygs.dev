"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageCircle, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CommunityReply } from "@/types/community";
import { MDXContent } from "./mdx-content";

interface ReplyCardProps {
  reply: CommunityReply;
  onVote?: (replyId: string, voteType: "UPVOTE" | "DOWNVOTE") => void;
  onReply?: (parentReplyId: string) => void;
  onEdit?: (replyId: string) => void;
  onDelete?: (replyId: string) => void;
  currentUserId?: string;
  level?: number;
  className?: string;
}

export function ReplyCard({
  reply,
  onVote,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  level = 0,
  className,
}: ReplyCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const voteScore = reply._count.votes || 0;
  const userVote = reply.userVote?.voteType;
  const isAuthor = currentUserId === reply.authorId;
  const maxLevel = 4; // Maximum nesting level
  const canReply = level < maxLevel;

  const handleVote = async (voteType: "UPVOTE" | "DOWNVOTE") => {
    if (onVote) {
      await onVote(reply.id, voteType);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(reply.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(reply.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(reply.id);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Threading line for nested replies */}
      {level > 0 && (
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      )}
      
      <Card className={cn(
        "ml-0 group hover:shadow-sm transition-all duration-200",
        level > 0 && "ml-12 border-l-2 border-l-muted",
        level > 2 && "bg-muted/30"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={reply.author.image || undefined} />
              <AvatarFallback className="text-sm">
                {reply.author.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{reply.author.name}</span>
                
                {reply.author.role === "INSTRUCTOR" && (
                  <Badge variant="secondary" className="text-xs">
                    Instructor
                  </Badge>
                )}
                
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.createdAt))} ago
                </span>
                
                {reply.updatedAt !== reply.createdAt && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}

                {reply._count?.children > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleExpanded}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? "−" : "+"} {reply._count.children} {reply._count.children === 1 ? "reply" : "replies"}
                  </Button>
                )}
              </div>

              {isExpanded && (
                <>
                  <div className="mb-3">
                    <MDXContent 
                      content={reply.content} 
                      className="text-sm leading-relaxed" 
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 w-7 p-0",
                          userVote === "UPVOTE" && "text-green-600 bg-green-50 hover:bg-green-100"
                        )}
                        onClick={() => handleVote("UPVOTE")}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      
                      <span className={cn(
                        "text-xs font-medium min-w-[1rem] text-center",
                        voteScore > 0 && "text-green-600",
                        voteScore < 0 && "text-red-600"
                      )}>
                        {voteScore}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 w-7 p-0",
                          userVote === "DOWNVOTE" && "text-red-600 bg-red-50 hover:bg-red-100"
                        )}
                        onClick={() => handleVote("DOWNVOTE")}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {canReply && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReply}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )}

                    {isAuthor && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={handleEdit}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nested replies */}
          {isExpanded && reply.children && reply.children.length > 0 && (
            <div className="mt-4 space-y-3">
              {reply.children.map((nestedReply) => (
                <ReplyCard
                  key={nestedReply.id}
                  reply={nestedReply}
                  onVote={onVote}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
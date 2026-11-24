"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageCircle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
import { UserBadges } from "./user-badges";
import { ReplyEditor } from "./reply-editor";
import { voteOnReply, deleteReply, updateReply } from "@/app/actions/community-actions";
import { toast } from "sonner";

interface ReplyCardProps {
  reply: CommunityReply;
  discussionId?: string;
  currentUserId?: string;
  level?: number;
  maxDepth?: number;
  className?: string;
  /** The instructor of the course the discussion belongs to: their answers are marked "Formateur". */
  instructorId?: string | null;
}

export function ReplyCard({
  reply,
  discussionId,
  currentUserId,
  level = 0,
  maxDepth = 4,
  className,
  instructorId = null,
}: ReplyCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [upvotes, setUpvotes] = useState(reply.upvoteCount || 0);
  const [downvotes, setDownvotes] = useState(reply.downvoteCount || 0);
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(
    reply.userVote?.voteType || null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [content, setContent] = useState(reply.content);
  
  const isAuthor = currentUserId === reply.authorId;
  const canReply = level < maxDepth;
  const isModerator = reply.isModerator || reply.author.role === "INSTRUCTOR";

  const handleVote = async (voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!currentUserId) {
      toast.error("Please log in to vote");
      return;
    }

    setIsVoting(true);
    try {
      const result = await voteOnReply(reply.id, voteType);
      
      if (result.success) {
        if (userVote === voteType) {
          // Remove vote
          setUserVote(null);
          if (voteType === "UPVOTE") {
            setUpvotes(prev => prev - 1);
          } else {
            setDownvotes(prev => prev - 1);
          }
        } else {
          // Add or change vote
          if (userVote) {
            // Change vote type
            if (userVote === "UPVOTE") {
              setUpvotes(prev => prev - 1);
              setDownvotes(prev => prev + 1);
            } else {
              setDownvotes(prev => prev - 1);
              setUpvotes(prev => prev + 1);
            }
          } else {
            // New vote
            if (voteType === "UPVOTE") {
              setUpvotes(prev => prev + 1);
            } else {
              setDownvotes(prev => prev + 1);
            }
          }
          setUserVote(voteType);
        }
        
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to vote");
      }
    } catch {
      toast.error("Error while voting");
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      const result = await deleteReply(reply.id);
      if (result.success) {
        toast.success("Reply deleted");
        // Router will handle navigation/refresh via server action revalidation
      } else {
        toast.error(result.error || "Failed to delete reply");
      }
    } catch {
      toast.error("Error deleting reply");
    }
  };

  const handleUpdate = async (newContent: string) => {
    try {
      const result = await updateReply(reply.id, newContent);
      if (result.success) {
        setContent(newContent);
        setIsEditing(false);
        toast.success("Reply updated");
      } else {
        toast.error(result.error || "Failed to update reply");
      }
    } catch {
      toast.error("Error updating reply");
    }
  };



  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn(
      "relative",
      level > 0 && "ml-4 pl-4 border-l-2 border-slate-700",
      className
    )}>
      <Card className="mb-4 group hover:shadow-sm transition-all duration-200">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href={`/community/users/${reply.author.id}`}>
                <Avatar className="h-8 w-8 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  <AvatarImage src={reply.author.image || undefined} />
                  <AvatarFallback className="text-sm">
                    {reply.author.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/community/users/${reply.author.id}`}
                    className="font-medium text-sm hover:text-primary transition-colors"
                  >
                    {reply.author.name}
                  </Link>
                  
                  {instructorId && reply.authorId === instructorId && (
                    <Badge className="text-xs">Formateur</Badge>
                  )}
                  {isModerator && reply.authorId !== instructorId && (
                    <Badge variant="secondary" className="text-xs">
                      Moderator
                    </Badge>
                  )}
                </div>
                
                <UserBadges 
                  user={reply.author}
                  showLevel={true}
                  showBadges={true}
                  maxBadges={2}
                  size="sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                {reply.updatedAt !== reply.createdAt && " (edited)"}
              </span>
              
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="Actions de la réponse">
                      <MoreHorizontal className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthor && (
                      <>
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={handleDelete}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <ReplyEditor
              initialContent={content}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="Update Reply"
              placeholder="Edit your reply..."
            />
          ) : (
            <div className="prose prose-sm max-w-none prose-invert mb-3">
              <MDXContent content={content} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Voting */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("UPVOTE")}
                  disabled={isVoting || !currentUserId}
                  className={cn(
                    "h-7 px-2",
                    userVote === "UPVOTE" && "text-green-400 bg-green-950"
                  )}
                >
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {upvotes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("DOWNVOTE")}
                  disabled={isVoting || !currentUserId}
                  className={cn(
                    "h-7 px-2",
                    userVote === "DOWNVOTE" && "text-red-400 bg-red-950"
                  )}
                >
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {downvotes}
                </Button>
              </div>

              {/* Reply Button */}
              {canReply && currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(true)}
                  className="h-7 px-2"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>

            {/* Toggle children */}
            {reply.children && reply.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-7 px-2 text-xs"
              >
                {isExpanded ? "Hide" : "Show"} {reply.children.length} replies
              </Button>
            )}
          </div>

          {/* Reply Editor */}
          {isReplying && discussionId && (
            <div className="mt-4 pt-4 border-t">
              <ReplyEditor
                discussionId={discussionId}
                parentId={reply.id}
                onCancel={() => setIsReplying(false)}
                placeholder="Write your reply..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {isExpanded && reply.children && reply.children.length > 0 && (
        <div className="space-y-0">
          {reply.children.map((nestedReply) => (
            <ReplyCard
              key={nestedReply.id}
              reply={nestedReply}
              discussionId={discussionId}
              currentUserId={currentUserId}
              level={level + 1}
              maxDepth={maxDepth}
              instructorId={instructorId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

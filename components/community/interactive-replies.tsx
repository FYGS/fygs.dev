"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { voteOnReply, deleteReply } from "@/app/actions/community-actions";
import { ReplyCard } from "./reply-card";
import { CommunityReply } from "@/types/community";

interface InteractiveRepliesProps {
  replies: CommunityReply[];
  currentUserId?: string;
}

export function InteractiveReplies({ 
  replies, 
  currentUserId 
}: InteractiveRepliesProps) {
  const router = useRouter();

  const handleVote = async (replyId: string, voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!currentUserId) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const result = await voteOnReply(replyId, voteType);
      
      if (result.success) {
        toast.success("Vote recorded");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Error voting on reply:", error);
      toast.error("An error occurred while voting");
    }
  };

  const handleDelete = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      const result = await deleteReply(replyId);
      
      if (result.success) {
        toast.success("Reply deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete reply");
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("An error occurred while deleting");
    }
  };

  const handleReply = () => {
    // For now, scroll to the main reply composer
    // TODO: Implement nested reply functionality
    const replyComposer = document.getElementById("reply-composer");
    if (replyComposer) {
      replyComposer.scrollIntoView({ behavior: "smooth" });
      // Focus the textarea
      const textarea = replyComposer.querySelector("textarea");
      if (textarea) {
        textarea.focus();
        // Add mention to the parent reply author
        // TODO: Get parent reply author and add mention
      }
    }
  };

  const handleEdit = () => {
    // TODO: Implement inline edit mode
    toast.info("Edit functionality coming soon");
  };

  return (
    <div className="space-y-4">
      {replies.map((reply, index) => (
        <div key={reply.id}>
          <ReplyCard
            reply={reply}
            currentUserId={currentUserId}
            onVote={handleVote}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {index < replies.length - 1 && (
            <div className="border-l-2 border-muted ml-8 h-4" />
          )}
        </div>
      ))}
    </div>
  );
}
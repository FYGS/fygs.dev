"use client";

import { ReplyCard } from "./reply-card";
import { CommunityReply } from "@/types/community";

interface InteractiveRepliesProps {
  replies: CommunityReply[];
  discussionId: string;
  currentUserId?: string;
}

export function InteractiveReplies({ 
  replies, 
  discussionId,
  currentUserId 
}: InteractiveRepliesProps) {
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyCard
          key={reply.id}
          reply={reply}
          discussionId={discussionId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
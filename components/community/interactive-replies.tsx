"use client";

import { ReplyCard } from "./reply-card";
import { CommunityReply } from "@/types/community";

interface InteractiveRepliesProps {
  replies: CommunityReply[];
  discussionId: string;
  currentUserId?: string;
  /** The instructor of the course the discussion belongs to: their answers are marked. */
  instructorId?: string | null;
}

export function InteractiveReplies({ 
  replies, 
  discussionId,
  currentUserId,
  instructorId = null,
}: InteractiveRepliesProps) {
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyCard
          key={reply.id}
          reply={reply}
          discussionId={discussionId}
          currentUserId={currentUserId}
          instructorId={instructorId}
        />
      ))}
    </div>
  );
}
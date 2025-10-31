"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ReplyEditor } from "./reply-editor";

interface ReplyComposerProps {
  discussionId: string;
  parentReplyId?: string;
  currentUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  onSuccess?: (replyId: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export function ReplyComposer({
  discussionId,
  parentReplyId,
  currentUser,
  onCancel,
  placeholder = "Write your reply...",
  className,
}: ReplyComposerProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={currentUser.image || undefined} />
            <AvatarFallback className="text-sm">
              {currentUser.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <ReplyEditor
              discussionId={discussionId}
              parentId={parentReplyId}
              placeholder={placeholder}
              onCancel={onCancel}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact inline reply composer
interface InlineReplyComposerProps {
  discussionId: string;
  parentReplyId?: string;
  currentUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  placeholder?: string;
}

export function InlineReplyComposer({
  discussionId,
  parentReplyId,
  currentUser,
  placeholder = "Write a reply...",
}: InlineReplyComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded) {
    return (
      <ReplyComposer
        discussionId={discussionId}
        parentReplyId={parentReplyId}
        currentUser={currentUser}
        onCancel={() => setIsExpanded(false)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div 
      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
      onClick={() => setIsExpanded(true)}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentUser.image || undefined} />
        <AvatarFallback className="text-sm">
          {currentUser.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 text-sm text-muted-foreground">
        {placeholder}
      </div>
      
      <Send className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
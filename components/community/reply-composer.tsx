"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { createReplySchema } from "@/types/community";
import { createReply } from "@/app/actions/community-actions";

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

type FormData = {
  content: string;
  discussionId: string;
  parentReplyId?: string;
};

export function ReplyComposer({
  discussionId,
  parentReplyId,
  currentUser,
  onSuccess,
  onCancel,
  placeholder = "Write your reply...",
  className,
}: ReplyComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createReplySchema),
    defaultValues: {
      content: "",
      discussionId,
      parentReplyId,
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", data.content);
      formData.append("discussionId", data.discussionId);
      if (data.parentReplyId) {
        formData.append("parentReplyId", data.parentReplyId);
      }

      const result = await createReply(formData);
      
      if (result.success && result.data) {
        toast.success("Reply posted successfully!");
        
        form.reset();
        onSuccess?.(result.data.id);
      } else {
        toast.error(result.error || "Failed to post reply. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create reply:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const content = form.watch("content");
  const isContentEmpty = !content?.trim();

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={currentUser.image || undefined} />
                <AvatarFallback className="text-sm">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={placeholder}
                          className="min-h-[80px] resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {parentReplyId ? "Replying to comment" : "Replying to discussion"}
                  </div>

                  <div className="flex items-center gap-2">
                    {onCancel && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={isSubmitting || isContentEmpty}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
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
  onSuccess?: (replyId: string) => void;
  placeholder?: string;
}

export function InlineReplyComposer({
  discussionId,
  parentReplyId,
  currentUser,
  onSuccess,
  placeholder = "Write a reply...",
}: InlineReplyComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded) {
    return (
      <ReplyComposer
        discussionId={discussionId}
        parentReplyId={parentReplyId}
        currentUser={currentUser}
        onSuccess={(replyId) => {
          setIsExpanded(false);
          onSuccess?.(replyId);
        }}
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
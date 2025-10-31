"use client";

import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createReply } from "@/app/actions/community-actions";
import { toast } from "sonner";

interface ReplyEditorProps {
  discussionId?: string;
  parentId?: string;
  initialContent?: string;
  onSubmit?: (content: string) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  placeholder?: string;
  className?: string;
  onChange?: (content: string) => void;
}

export function ReplyEditor({
  discussionId,
  parentId,
  initialContent = "",
  onSubmit,
  onCancel,
  submitLabel = "Post Reply",
  placeholder = "Write your reply...",
  className,
  onChange,
}: ReplyEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (value: string) => {
    setContent(value);
    onChange?.(value);
  };

  const handleSubmit = async () => {
    if (!content || content.trim().length === 0) {
      toast.error("Please write something before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(content);
        setContent("");
        toast.success("Posted successfully!");
        onCancel?.();
      } else if (discussionId) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("discussionId", discussionId);
        if (parentId) {
          formData.append("parentId", parentId);
        }

        const result = await createReply(formData);

        if (result.success) {
          setContent("");
          toast.success("Reply posted successfully!");
          onCancel?.();
        } else {
          toast.error(result.error || "Failed to post reply");
        }
      }
    } catch {
      toast.error("An error occurred while posting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <ScrollArea className="h-[180px] rounded-t-lg">
          <Textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={isSubmitting}
            className="min-h-[180px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none rounded-b-none"
          />
        </ScrollArea>

        <div className="flex items-center justify-between p-3 border-t bg-slate-50 dark:bg-slate-900">
          <div className="text-xs text-muted-foreground">
            Supports <strong>Markdown</strong> formatting
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}

            <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting ? "Posting..." : submitLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

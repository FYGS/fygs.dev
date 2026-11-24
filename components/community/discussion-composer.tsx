"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ReplyEditor } from "@/components/community/reply-editor";
import { CommunityTopic, createDiscussionSchema } from "@/types/community";
import { createDiscussion } from "@/app/actions/community-actions";

interface DiscussionComposerProps {
  topics: CommunityTopic[];
  courseId?: string;
  onSuccess?: (discussionId: string) => void;
  onCancel?: () => void;
  className?: string;
}

type FormData = {
  title: string;
  content: string;
  topicId: string;
  courseId?: string;
};

export function DiscussionComposer({
  topics,
  courseId,
  onSuccess,
  onCancel,
  className,
}: DiscussionComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createDiscussionSchema),
    defaultValues: {
      title: "",
      content: "",
      topicId: "",
      courseId: courseId || undefined,
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("topicId", data.topicId);
      if (data.courseId) {
        formData.append("courseId", data.courseId);
      }

      const result = await createDiscussion(formData);
      
      if (result.success && result.data) {
        toast.success("Discussion created successfully!");
        
        form.reset();
        onSuccess?.(result.data.id);
      } else {
        toast.error(result.error || "Failed to create discussion. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create discussion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Start a Discussion</CardTitle>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Topic Selection */}
            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Select a topic for your discussion">
                        <SelectValue placeholder="Select a topic for your discussion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          <div className="flex items-center gap-2">
                            {topic.icon && (
                              <span className="text-lg">{topic.icon}</span>
                            )}
                            <span>{topic.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({topic._count?.discussions || 0})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="What would you like to discuss?"
                      className="text-base"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <ReplyEditor
                      initialContent={field.value}
                      onChange={(content) => {
                        field.onChange(content);
                      }}
                      placeholder="Provide more details about your discussion... (Supports Markdown)"
                      onCancel={handleCancel}
                      submitLabel="Create Discussion"
                      onSubmit={async (content) => {
                        field.onChange(content);
                        await form.handleSubmit(handleSubmit)();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Compact version for inline use
interface CompactDiscussionComposerProps {
  topics: CommunityTopic[];
  courseId?: string;
  onSuccess?: (discussionId: string) => void;
  placeholder?: string;
}

export function CompactDiscussionComposer({
  topics,
  courseId,
  onSuccess,
  placeholder = "Start a discussion...",
}: CompactDiscussionComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded) {
    return (
      <DiscussionComposer
        topics={topics}
        courseId={courseId}
        onSuccess={(discussionId) => {
          setIsExpanded(false);
          onSuccess?.(discussionId);
        }}
        onCancel={() => setIsExpanded(false)}
      />
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div
          className="flex items-center gap-3"
          onClick={() => setIsExpanded(true)}
        >
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Send className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">
              {placeholder}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
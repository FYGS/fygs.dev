"use client";

import { useRouter } from "next/navigation";
import { DiscussionComposer } from "@/components/community/discussion-composer";
import { CommunityTopic } from "@/types/community";

interface NewDiscussionClientProps {
  topics: CommunityTopic[];
  courseId?: string;
}

export function NewDiscussionClient({ topics, courseId }: NewDiscussionClientProps) {
  const router = useRouter();

  return (
    <DiscussionComposer
      topics={topics}
      courseId={courseId}
      onSuccess={(discussionId) => {
        router.push(`/community/discussions/${discussionId}`);
      }}
      onCancel={() => {
        router.push("/community");
      }}
    />
  );
}
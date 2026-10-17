"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { TopicFilter } from "./topic-filter";
import { CompactDiscussionComposer } from "./discussion-composer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommunityTopic } from "@/types/community";

interface CommunityFiltersProps {
  topics: CommunityTopic[];
  selectedTopics: string[];
  sortBy: string;
  filterBy: string;
  session: any;
}

export function CommunityFilters({
  topics,
  selectedTopics,
  sortBy,
  filterBy,
  session,
}: CommunityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearchParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams?.toString());
      
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      
      // Reset to page 1 when filters change
      if (key !== "page") {
        params.delete("page");
      }
      
      router.push(`/community?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleTopicsChange = useCallback(
    (newTopicIds: string[]) => {
      const topicId = newTopicIds.length > 0 ? newTopicIds[0] : null;
      updateSearchParams("topic", topicId);
    },
    [updateSearchParams]
  );

  const handleDiscussionSuccess = useCallback(
    (_discussionId: string) => {
      // Refresh the page to show the new discussion
      router.refresh();
    },
    [router]
  );

  return (
    <>
      {/* Quick Post Composer */}
      {session?.user && (
        <CompactDiscussionComposer
          topics={topics}
          onSuccess={handleDiscussionSuccess}
        />
      )}

      {/* Filters and Sorting */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Topic Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Topics</label>
              <TopicFilter
                topics={topics}
                selectedTopics={selectedTopics}
                onTopicsChange={handleTopicsChange}
              />
            </div>

            <Separator />

            {/* Sort and Filter Options */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <Select value={sortBy} onValueChange={(value) => updateSearchParams("sort", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="top">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter</label>
                <Select value={filterBy} onValueChange={(value) => updateSearchParams("filter", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unanswered">Unanswered</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { TopicFilter } from "./topic-filter";
import { CompactDiscussionComposer } from "./discussion-composer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSearchParams("sort", e.target.value);
    },
    [updateSearchParams]
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSearchParams("filter", e.target.value);
    },
    [updateSearchParams]
  );

  const handleDiscussionSuccess = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="recent">Most Recent</option>
                  <option value="trending">Trending</option>
                  <option value="top">Top Rated</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter:</span>
                <select
                  value={filterBy}
                  onChange={handleFilterChange}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="solved">Solved</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
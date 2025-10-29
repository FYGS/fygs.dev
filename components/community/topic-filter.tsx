"use client";

import { Check, Filter, Tag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CommunityTopic } from "@/types/community";

interface TopicFilterProps {
  topics: CommunityTopic[];
  selectedTopics: string[];
  onTopicsChange: (topicIds: string[]) => void;
  maxVisible?: number;
  className?: string;
}

export function TopicFilter({
  topics,
  selectedTopics,
  onTopicsChange,
  maxVisible = 5,
  className,
}: TopicFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleTopics = topics.slice(0, maxVisible);
  const hiddenTopicsCount = Math.max(0, topics.length - maxVisible);

  const toggleTopic = (topicId: string) => {
    const newSelectedTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter((id) => id !== topicId)
      : [...selectedTopics, topicId];
    
    onTopicsChange(newSelectedTopics);
  };

  const clearAllTopics = () => {
    onTopicsChange([]);
  };

  const getSelectedTopicNames = () => {
    return topics
      .filter((topic) => selectedTopics.includes(topic.id))
      .map((topic) => topic.name);
  };

  const selectedTopicNames = getSelectedTopicNames();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Visible topic badges */}
      <div className="flex items-center gap-1 flex-wrap">
        {visibleTopics.map((topic) => {
          const isSelected = selectedTopics.includes(topic.id);
          return (
            <Badge
              key={topic.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:bg-primary/80 transition-colors",
                "flex items-center gap-1 text-xs"
              )}
              onClick={() => toggleTopic(topic.id)}
            >
              <Tag className="h-3 w-3" />
              {topic.name}
              {isSelected && <Check className="h-3 w-3" />}
            </Badge>
          );
        })}
      </div>

      {/* Filter popover for all topics */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {selectedTopics.length > 0 && (
              <Badge variant="secondary" className="h-5 text-xs">
                {selectedTopics.length}
              </Badge>
            )}
            {hiddenTopicsCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{hiddenTopicsCount} more
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Filter by Topics</h4>
              {selectedTopics.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllTopics}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>

          <ScrollArea className="max-h-64">
            <div className="p-2">
              {filteredTopics.length > 0 ? (
                <div className="space-y-1">
                  {filteredTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <div
                        key={topic.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer",
                          "hover:bg-accent transition-colors",
                          isSelected && "bg-accent"
                        )}
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium truncate">
                              {topic.name}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          {topic.description && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {topic.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{topic._count?.discussions || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No topics found
                </div>
              )}
            </div>
          </ScrollArea>

          {selectedTopics.length > 0 && (
            <div className="p-4 border-t">
              <div className="text-xs text-muted-foreground mb-2">
                Selected topics:
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedTopicNames.map((name) => (
                  <Badge key={name} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
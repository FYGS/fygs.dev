"use client";

import { useState } from "react";
import { Heart, HeartOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleTopicFollow } from "@/app/actions/community-actions";

interface FollowTopicButtonProps {
  topicId: string;
  topicName: string;
  isFollowing: boolean;
  variant?: "default" | "icon";
  size?: "sm" | "default";
  onToggle?: (isFollowing: boolean) => void;
}

export function FollowTopicButton({ 
  topicId, 
  topicName, 
  isFollowing, 
  variant = "default",
  size = "sm",
  onToggle 
}: FollowTopicButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await toggleTopicFollow(topicId);

      if (result.success) {
        const newFollowingState = !following;
        setFollowing(newFollowingState);
        onToggle?.(newFollowingState);
        
        toast.success(
          newFollowingState 
            ? `Following ${topicName}` 
            : `Unfollowed ${topicName}`
        );
      } else {
        toast.error(result.error || "Failed to update follow status");
      }
    } catch {
      toast.error("An error occurred while updating follow status");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        disabled={isLoading}
        className="h-6 w-6 p-0"
        aria-label={following ? "Ne plus suivre ce sujet" : "Suivre ce sujet"}
        aria-pressed={following}
      >
        {following ? (
          <Heart className="h-3 w-3 fill-current text-red-500" />
        ) : (
          <HeartOff className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={following ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
    >
      {following ? (
        <>
          <Heart className="h-4 w-4 mr-2 fill-current" />
          Following
        </>
      ) : (
        <>
          <HeartOff className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
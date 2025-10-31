"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleUserFollow, checkUserFollow } from "@/app/actions/community-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FollowUserButtonProps {
  userId: string;
  userName: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showText?: boolean;
}

export function FollowUserButton({
  userId,
  userName,
  className,
  variant = "default",
  size = "default",
  showText = true,
}: FollowUserButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const result = await checkUserFollow(userId);
        if (result.success && result.data) {
          setIsFollowing(result.data.isFollowing);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowStatus();
  }, [userId]);

  const handleToggleFollow = async () => {
    setIsSubmitting(true);
    try {
      const result = await toggleUserFollow(userId);
      
      if (result.success) {
        setIsFollowing(result.data?.isFollowing ?? !isFollowing);
        toast.success(result.message || (isFollowing ? "Unfollowed user" : "Following user"));
      } else {
        toast.error(result.error || "Failed to follow/unfollow user");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={isSubmitting}
      className={cn(className)}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && <span className="ml-2">Loading...</span>}
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          {showText && <span className="ml-2">Unfollow</span>}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {showText && <span className="ml-2">Follow {userName}</span>}
        </>
      )}
    </Button>
  );
}

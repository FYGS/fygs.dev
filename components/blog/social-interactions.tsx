"use client";

import { handleLike, handleShare } from "@/app/(main)/blog/actions/social-interactions";
import { SocialInteractionsClient } from "./social-interactions-client";

interface SocialInteractionsProps {
  slug: string;
  initialLikes: number;
  shareCount: number;
  variant?: "default" | "large";
}

export function SocialInteractions({
  variant,
  ...props
}: SocialInteractionsProps) {
  return (
    <SocialInteractionsClient
      {...props}
      variant={variant}
      onLike={(userId) => handleLike(props.slug, userId)}
      onShare={() => handleShare(props.slug)}
    />
  );
}

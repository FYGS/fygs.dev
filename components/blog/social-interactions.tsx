"use client";

import {
  handleLike,
  handleShare,
} from "@/app/[locale]/(main)/blog/actions/social-interactions";
import { SocialInteractionsClient } from "./social-interactions-client";

interface SocialInteractionsProps {
  slug: string;
  variant?: "default" | "large";
}

export function SocialInteractions({ slug, variant }: SocialInteractionsProps) {
  return (
    <SocialInteractionsClient
      slug={slug}
      variant={variant}
      onLike={(userId) => handleLike(slug, userId)}
      onShare={() => handleShare(slug)}
    />
  );
}

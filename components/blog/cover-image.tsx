"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface CoverImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function CoverImage({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1280px) 1200px, (min-width: 780px) 80vw, 100vw",
  className,
}: CoverImageProps) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className={cn(
      "relative aspect-video sm:aspect-2/1 w-full overflow-hidden bg-background/50 rounded-lg",
      className
    )}>
      {/* Placeholder shimmer effect */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent",
          "animate-shimmer",
          imageLoading ? "opacity-100" : "opacity-0"
        )}
        style={{
          backgroundSize: "200% 100%",
          transition: "opacity 0.3s ease-in-out",
        }}
      />

      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-all duration-500",
          imageLoading
            ? "scale-105 blur-xl opacity-50"
            : "scale-100 blur-0 opacity-100"
        )}
        sizes={sizes}
        priority={priority}
        onLoad={() => setImageLoading(false)}
        quality={90}
      />
    </div>
  );
}

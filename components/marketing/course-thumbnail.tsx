import Image from "next/image";
import { cn } from "@/lib/utils";

interface CourseThumbnailProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function CourseThumbnail({
  src,
  alt,
  width = 800,
  height = 450,
  priority = false,
  className,
}: CourseThumbnailProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center rounded-lg aspect-video",
          className,
        )}
      >
        <span className="text-muted-foreground text-sm">Pas de miniature</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
      className={cn("rounded-lg object-cover", className)}
    />
  );
}

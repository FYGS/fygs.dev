"use client";

import { useState, useRef } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseTrailerProps {
  trailerUrl: string;
  thumbnail?: string | null;
  title: string;
}

export function CourseTrailer({
  trailerUrl,
  thumbnail,
  title,
}: CourseTrailerProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  return (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={trailerUrl}
        poster={thumbnail || undefined}
        controls={playing}
        className="w-full h-full object-cover"
        preload="metadata"
        aria-label={`Bande-annonce : ${title}`}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            onClick={handlePlay}
            size="lg"
            className="rounded-full w-16 h-16 p-0"
            aria-label="Lancer la bande-annonce"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

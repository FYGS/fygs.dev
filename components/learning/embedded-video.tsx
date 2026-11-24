"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { VideoSource } from "@/lib/learning/video-source";

interface EmbeddedVideoProps {
  title: string;
  source: Extract<VideoSource, { kind: "youtube" | "vimeo" }>;
}

const PROVIDER = { youtube: "YouTube", vimeo: "Vimeo" } as const;

/**
 * A YouTube or Vimeo video, loaded only when the learner asks for it: until then nothing is fetched from the
 * provider (no cookie, no tracking), and the frame then uses the privacy-enhanced player. The provider's own
 * controls, captions and keyboard shortcuts apply; the lesson is marked as done with its button.
 */
export function EmbeddedVideo({ title, source }: EmbeddedVideoProps) {
  const [loaded, setLoaded] = useState(false);
  const provider = PROVIDER[source.kind];

  if (!loaded) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group flex h-full w-full flex-col items-center justify-center gap-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25">
            <Play className="ml-1 h-8 w-8" aria-hidden />
          </span>
          <span className="text-sm font-medium">Lire la vidéo</span>
          <span className="max-w-md px-4 text-center text-xs text-white/80">
            La vidéo est hébergée par {provider} : elle se charge quand vous la lancez.
          </span>
          <span className="sr-only">: {title}</span>
        </button>
      </div>
    );
  }

  const src = new URL(source.embedUrl);
  src.searchParams.set("autoplay", "1");
  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-black">
      <iframe
        src={src.toString()}
        title={`Vidéo (${provider}) : ${title}`}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

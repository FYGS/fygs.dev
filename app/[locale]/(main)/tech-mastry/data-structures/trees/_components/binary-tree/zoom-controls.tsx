"use client";

import { Button } from "@/components/ui/button";
import type { Dispatch, SetStateAction } from "react";

interface ZoomControlsProps {
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
}

export function ZoomControls({ zoom, setZoom }: ZoomControlsProps) {
  return (
    <div className="absolute top-2 right-2 flex items-center gap-2 z-10 bg-background/80 p-1 rounded-md">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setZoom((prev) => Math.max(0.3, prev - 0.05))}
        className="h-7 w-7"
        title="Zoom out"
      >
        <span className="text-xs">-</span>
      </Button>
      <span className="text-xs">{Math.round(zoom * 100)}%</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setZoom((prev) => Math.min(2, prev + 0.05))}
        className="h-7 w-7"
        title="Zoom in"
      >
        <span className="text-xs">+</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setZoom(0.6)}
        className="h-7 w-7"
        title="Fit to view"
      >
        <span className="text-xs">↺</span>
      </Button>
    </div>
  );
}

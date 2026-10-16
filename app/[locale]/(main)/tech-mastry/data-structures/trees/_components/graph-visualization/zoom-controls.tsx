"use client";

import { Button } from "@/components/ui/button";

export function ZoomControls() {
  return (
    <div className="absolute top-2 right-2 flex items-center gap-2 z-10 bg-background/80 p-1 rounded-md">
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          const zoomElement = document.getElementById("graph-zoom");
          if (zoomElement) {
            zoomElement.style.transform = `scale(${Math.max(
              0.6,
              parseFloat(
                zoomElement.style.transform
                  .replace("scale(", "")
                  .replace(")", "")
              ) - 0.05
            )})`;
          }
        }}
        className="h-7 w-7"
        title="Zoom out"
      >
        <span className="text-xs">-</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          const zoomElement = document.getElementById("graph-zoom");
          if (zoomElement) {
            zoomElement.style.transform = `scale(${Math.min(
              2,
              parseFloat(
                zoomElement.style.transform
                  .replace("scale(", "")
                  .replace(")", "")
              ) + 0.05
            )})`;
          }
        }}
        className="h-7 w-7"
        title="Zoom in"
      >
        <span className="text-xs">+</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          const zoomElement = document.getElementById("graph-zoom");
          if (zoomElement) {
            zoomElement.style.transform = "scale(1)";
          }
        }}
        className="h-7 w-7"
        title="Reset zoom"
      >
        <span className="text-xs">↺</span>
      </Button>
    </div>
  );
}

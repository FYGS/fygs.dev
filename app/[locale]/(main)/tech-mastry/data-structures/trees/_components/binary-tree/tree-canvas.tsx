"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Dispatch, SetStateAction } from "react";
import { renderTreeNode } from "./tree-node";
import type { TreeNode } from "./types";
import { ZoomControls } from "./zoom-controls";

interface TreeCanvasProps {
  tree: TreeNode | null;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
}

export function TreeCanvas({ tree, zoom, setZoom }: TreeCanvasProps) {
  return (
    <div className="relative w-full h-[500px] border rounded-lg bg-background/50">
      {/* Zoom controls */}
      <ZoomControls zoom={zoom} setZoom={setZoom} />

      <ScrollArea className="h-full w-full">
        <div className="h-full min-w-[1000px]">
          <div
            className="h-full w-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
              overflow: "visible",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="-450 -100 900 550"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: "visible" }}
            >
              {tree && renderTreeNode(tree, 0, 30)}
            </svg>
          </div>
        </div>
        <ScrollBar orientation="horizontal" className="h-3" />
      </ScrollArea>
    </div>
  );
}

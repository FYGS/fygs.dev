"use client";

import { glassCard } from "@/app/_lib/theme-utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CodeEditor } from "./code-editor";
import { FileExplorer } from "./file-explorer";
import { OutputPanel } from "./output-panel";

export function ResizableEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorWidth, setEditorWidth] = useState<number>(70); // Default 70% width for editor
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [showFileExplorer, setShowFileExplorer] = useState<boolean>(true);
  const [fileExplorerWidth, setFileExplorerWidth] = useState<number>(20); // Default 20% width for file explorer
  const fileExplorerDragHandleRef = useRef<HTMLDivElement>(null);
  const [isFileExplorerDragging, setIsFileExplorerDragging] =
    useState<boolean>(false);

  // Handle main resize drag
  useEffect(() => {
    const container = containerRef.current;
    const dragHandle = dragHandleRef.current;

    if (!container || !dragHandle) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !container) return;

      const containerRect = container.getBoundingClientRect();
      const newEditorWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit the width between 30% and 90%
      if (newEditorWidth >= 30 && newEditorWidth <= 90) {
        setEditorWidth(newEditorWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    dragHandle.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      dragHandle.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Handle file explorer resize drag
  useEffect(() => {
    const container = containerRef.current;
    const dragHandle = fileExplorerDragHandleRef.current;

    if (!container || !dragHandle || !showFileExplorer) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsFileExplorerDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isFileExplorerDragging || !container) return;

      const containerRect = container.getBoundingClientRect();
      const newFileExplorerWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit the width between 10% and 30%
      if (newFileExplorerWidth >= 10 && newFileExplorerWidth <= 30) {
        setFileExplorerWidth(newFileExplorerWidth);
        // Adjust editor width accordingly
        setEditorWidth(Math.min(90 - newFileExplorerWidth, editorWidth));
      }
    };

    const handleMouseUp = () => {
      setIsFileExplorerDragging(false);
    };

    dragHandle.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      dragHandle.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isFileExplorerDragging, showFileExplorer, editorWidth]);

  // Toggle file explorer
  const toggleFileExplorer = () => {
    setShowFileExplorer((prev) => !prev);
  };

  return (
    <div className="relative flex-1 flex flex-col">
      {/* File Explorer Toggle Button */}
      <div className="absolute top-2 left-2 z-10">
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFileExplorer}
              >
                {showFileExplorer ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{showFileExplorer ? "Hide" : "Show"} File Explorer</p>
            </TooltipContent>
          </Tooltip>
      </div>

      {/* Main Editor Layout */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-row gap-0 overflow-hidden relative"
      >
        {/* File Explorer */}
        {showFileExplorer && (
          <>
            <div
              className="h-full overflow-hidden"
              style={{ width: `${fileExplorerWidth}%` }}
            >
              <Card className={`${glassCard} h-full`}>
                <FileExplorer />
              </Card>
            </div>

            {/* File Explorer Drag Handle */}
            <div
              ref={fileExplorerDragHandleRef}
              className="w-2 h-full cursor-col-resize bg-border/30 hover:bg-primary/50 transition-colors"
              style={{
                cursor: isFileExplorerDragging ? "col-resize" : "default",
              }}
            />
          </>
        )}

        {/* Editor Panel */}
        <div
          className="h-full overflow-hidden"
          style={{
            width: `${
              showFileExplorer ? editorWidth : editorWidth + fileExplorerWidth
            }%`,
          }}
        >
          <Card className={`${glassCard} h-full p-4`}>
            <CodeEditor />
          </Card>
        </div>

        {/* Drag Handle */}
        <div
          ref={dragHandleRef}
          className="w-2 h-full cursor-col-resize bg-border/30 hover:bg-primary/50 transition-colors"
          style={{
            cursor: isDragging ? "col-resize" : "default",
          }}
        />

        {/* Output Panel */}
        <div
          className="h-full overflow-hidden"
          style={{
            width: `${
              100 -
              editorWidth -
              fileExplorerWidth -
              (showFileExplorer ? 1 : 0.5)
            }%`,
          }}
        >
          <Card className={`${glassCard} h-full`}>
            <OutputPanel />
          </Card>
        </div>
      </div>
    </div>
  );
}

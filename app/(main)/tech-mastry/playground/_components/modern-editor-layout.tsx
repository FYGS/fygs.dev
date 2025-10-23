"use client";

import { glassCard } from "@/app/_lib/theme-utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Columns,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Rows,
  Settings,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CodeEditor } from "./dynamic-code-editor";
import { FileExplorer } from "./file-explorer";
import { OutputPanel } from "./output-panel";

type LayoutMode = "horizontal" | "vertical" | "editor-only" | "output-only";
type ControlsPosition = "top-right" | "bottom-left" | "collapsed";

export function ModernEditorLayout() {
  // Layout state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("horizontal");
  const [showFileExplorer, setShowFileExplorer] = useState<boolean>(true);
  const [fileExplorerWidth, setFileExplorerWidth] = useState<number>(20);
  const [editorOutputRatio, setEditorOutputRatio] = useState<number>(65);
  const [controlsPosition, setControlsPosition] =
    useState<ControlsPosition>("collapsed");

  // Drag state
  const containerRef = useRef<HTMLDivElement>(null);
  const fileExplorerDragRef = useRef<HTMLDivElement>(null);
  const mainDragRef = useRef<HTMLDivElement>(null);
  const [isDraggingFileExplorer, setIsDraggingFileExplorer] = useState(false);
  const [isDraggingMain, setIsDraggingMain] = useState(false);

  // Handle file explorer resize
  useEffect(() => {
    if (!showFileExplorer) return;

    const container = containerRef.current;
    const dragHandle = fileExplorerDragRef.current;

    if (!container || !dragHandle) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsDraggingFileExplorer(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingFileExplorer || !container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit width between 10% and 30%
      if (newWidth >= 10 && newWidth <= 30) {
        setFileExplorerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingFileExplorer(false);
    };

    dragHandle.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      dragHandle.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingFileExplorer, showFileExplorer]);

  // Handle main content resize
  useEffect(() => {
    if (layoutMode === "editor-only" || layoutMode === "output-only") return;

    const container = containerRef.current;
    const dragHandle = mainDragRef.current;

    if (!container || !dragHandle) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsDraggingMain(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingMain || !container) return;

      const containerRect = container.getBoundingClientRect();
      let newRatio;

      if (layoutMode === "horizontal") {
        newRatio =
          ((e.clientX - containerRect.left) / containerRect.width) * 100;
        // Adjust for file explorer if visible
        if (showFileExplorer) {
          newRatio =
            ((newRatio - fileExplorerWidth) / (100 - fileExplorerWidth)) * 100;
        }
      } else {
        // vertical
        newRatio =
          ((e.clientY - containerRect.top) / containerRect.height) * 100;
      }

      // Limit ratio between 30% and 80%
      if (newRatio >= 30 && newRatio <= 80) {
        setEditorOutputRatio(newRatio);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingMain(false);
    };

    dragHandle.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      dragHandle.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingMain, layoutMode, showFileExplorer, fileExplorerWidth]);

  // Toggle file explorer
  const toggleFileExplorer = () => {
    setShowFileExplorer((prev) => !prev);
  };

  // Reset layout to default
  const resetLayout = () => {
    setLayoutMode("horizontal");
    setShowFileExplorer(true);
    setFileExplorerWidth(20);
    setEditorOutputRatio(65);
  };

  // Toggle controls position
  const toggleControlsPosition = () => {
    setControlsPosition((prev) => {
      if (prev === "collapsed") return "top-right";
      if (prev === "top-right") return "bottom-left";
      return "collapsed";
    });
  };

  // Render layout controls
  const renderLayoutControls = () => {
    if (controlsPosition === "collapsed") {
      return (
        <div className="absolute top-2 right-2 z-20">
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-xs"
                  onClick={toggleControlsPosition}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Show Layout Controls</p>
              </TooltipContent>
            </Tooltip>
        </div>
      );
    }

    const positionClasses = {
      "top-right": "top-2 right-2",
      "bottom-left": "bottom-2 left-2",
    };

    return (
      <div
        className={`absolute ${positionClasses[controlsPosition]} z-20 glass-effect p-1`}
      >
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-xs font-medium">Layout</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleControlsPosition}
          >
            {controlsPosition === "top-right" ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleFileExplorer}
                  data-active={showFileExplorer}
                >
                  {showFileExplorer ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeftOpen className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{showFileExplorer ? "Hide" : "Show"} File Explorer</p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setLayoutMode("horizontal")}
                  data-active={layoutMode === "horizontal"}
                >
                  <Columns className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Horizontal Layout</p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setLayoutMode("vertical")}
                  data-active={layoutMode === "vertical"}
                >
                  <Rows className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Vertical Layout</p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setLayoutMode("editor-only")}
                  data-active={layoutMode === "editor-only"}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Editor Only</p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setLayoutMode("output-only")}
                  data-active={layoutMode === "output-only"}
                >
                  <Terminal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Output Only</p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={resetLayout}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Reset Layout</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex-1 flex flex-col h-full">
      {/* Layout Controls */}
      {renderLayoutControls()}

      {/* Main Layout Container */}
      <div
        ref={containerRef}
        className={`flex-1 ${
          layoutMode === "vertical" ? "flex flex-col" : "flex flex-row"
        } gap-0 overflow-hidden h-full full-height-container`}
      >
        {/* File Explorer */}
        {showFileExplorer && layoutMode !== "output-only" && (
          <>
            <div
              className="h-full overflow-hidden transition-all duration-300 ease-in-out full-height-container"
              style={{
                width:
                  layoutMode === "vertical" ? "100%" : `${fileExplorerWidth}%`,
                height: layoutMode === "vertical" ? "30%" : "100%",
              }}
            >
              <Card
                className={`${glassCard} h-full neon-border full-height-container`}
              >
                <FileExplorer />
              </Card>
            </div>

            {/* File Explorer Drag Handle */}
            {layoutMode !== "vertical" && (
              <div
                ref={fileExplorerDragRef}
                className="drag-handle-horizontal"
                style={{
                  cursor: isDraggingFileExplorer ? "col-resize" : "default",
                }}
              />
            )}
          </>
        )}

        {/* Editor and Output Container */}
        <div
          className={`
            flex-1
            ${layoutMode === "vertical" ? "flex flex-col" : "flex flex-row"}
            gap-0 overflow-hidden layout-transition full-height-container
          `}
        >
          {/* Editor Panel */}
          {layoutMode !== "output-only" && (
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out full-height-container"
              style={{
                width:
                  layoutMode === "vertical" ? "100%" : `${editorOutputRatio}%`,
                height:
                  layoutMode === "vertical" ? `${editorOutputRatio}%` : "100%",
              }}
            >
              <Card
                className={`${glassCard} h-full p-0 neon-border full-height-container`}
              >
                <CodeEditor />
              </Card>
            </div>
          )}

          {/* Main Drag Handle */}
          {layoutMode !== "editor-only" && layoutMode !== "output-only" && (
            <div
              ref={mainDragRef}
              className={`
                ${
                  layoutMode === "vertical"
                    ? "drag-handle-vertical"
                    : "drag-handle-horizontal"
                }
              `}
              style={{
                cursor: isDraggingMain
                  ? layoutMode === "vertical"
                    ? "row-resize"
                    : "col-resize"
                  : "default",
              }}
            />
          )}

          {/* Output Panel */}
          {layoutMode !== "editor-only" && (
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out full-height-container"
              style={{
                width:
                  layoutMode === "vertical"
                    ? "100%"
                    : `${100 - editorOutputRatio}%`,
                height:
                  layoutMode === "vertical"
                    ? `${100 - editorOutputRatio}%`
                    : "100%",
              }}
            >
              <Card
                className={`${glassCard} h-full neon-border overflow-hidden full-height-container`}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <OutputPanel />
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

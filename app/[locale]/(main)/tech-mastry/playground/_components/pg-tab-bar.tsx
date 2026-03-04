"use client";

import { cn } from "@/lib/utils";
import { FileCode, Pin, X } from "lucide-react";
import { usePlaygroundStore } from "../_stores/playground-store";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  const colors: Record<string, string> = {
    ts: "text-blue-400",
    tsx: "text-cyan-400",
    js: "text-yellow-400",
    jsx: "text-yellow-300",
    html: "text-orange-400",
    htm: "text-orange-400",
    css: "text-purple-400",
    scss: "text-pink-400",
    json: "text-green-400",
    md: "text-gray-400",
    py: "text-blue-300",
    rs: "text-orange-300",
    go: "text-cyan-300",
  };
  return <FileCode className={cn("h-3.5 w-3.5 shrink-0", colors[ext ?? ""] || "text-gray-400")} />;
}

export function PgTabBar() {
  const openTabs = usePlaygroundStore((s) => s.openTabs);
  const activeFileId = usePlaygroundStore((s) => s.activeFileId);
  const files = usePlaygroundStore((s) => s.files);
  const setActiveFile = usePlaygroundStore((s) => s.setActiveFile);
  const closeTab = usePlaygroundStore((s) => s.closeTab);
  const pinTab = usePlaygroundStore((s) => s.pinTab);

  if (openTabs.length === 0) {
    return (
      <div className="flex h-9 items-center border-b border-border/30 bg-[#252526] px-4">
        <span className="text-xs text-muted-foreground">No files open</span>
      </div>
    );
  }

  return (
    <div className="flex h-9 items-center overflow-x-auto border-b border-border/30 bg-[#252526] scrollbar-none">
      {openTabs.map((tab) => {
        const file = files.find((f) => f.id === tab.fileId);
        if (!file) return null;

        const isActive = activeFileId === tab.fileId;

        return (
          <div
            key={tab.fileId}
            className={cn(
              "group relative flex h-full items-center gap-1.5 border-r border-border/20 px-3 text-xs transition-colors select-none cursor-pointer min-w-0 max-w-[180px]",
              isActive
                ? "bg-[#1e1e1e] text-foreground"
                : "bg-[#2d2d2d] text-muted-foreground hover:bg-[#2a2a2a]",
              tab.isPreview && "italic"
            )}
            onClick={() => setActiveFile(tab.fileId)}
            onDoubleClick={() => {
              if (tab.isPreview) pinTab(tab.fileId);
            }}
            title={file.path}
          >
            {/* Active tab top indicator */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
            )}

            {getFileIcon(file.name)}

            <span className="truncate">
              {file.name}
              {file.isDirty && <span className="ml-0.5 text-primary">●</span>}
            </span>

            {tab.isPinned && (
              <Pin className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
            )}

            <button
              className={cn(
                "ml-auto shrink-0 rounded p-0.5 hover:bg-foreground/10",
                !isActive && "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.fileId);
              }}
              aria-label={`Close ${file.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

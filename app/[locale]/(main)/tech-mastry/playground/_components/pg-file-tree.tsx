"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FilePlus,
  FolderOpen,
  FolderClosed,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { FileTreeNode } from "../_types";
import { usePlaygroundStore } from "../_stores/playground-store";

function getFileIconColor(name: string): string {
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
    svg: "text-yellow-500",
    env: "text-yellow-600",
  };
  return colors[ext ?? ""] || "text-gray-400";
}

interface TreeNodeProps {
  node: FileTreeNode;
  depth: number;
  expandedDirs: Set<string>;
  toggleDir: (path: string) => void;
}

function TreeNode({ node, depth, expandedDirs, toggleDir }: TreeNodeProps) {
  const activeFileId = usePlaygroundStore((s) => s.activeFileId);
  const setActiveFile = usePlaygroundStore((s) => s.setActiveFile);
  const deleteFile = usePlaygroundStore((s) => s.deleteFile);
  const setEntryPoint = usePlaygroundStore((s) => s.setEntryPoint);
  const files = usePlaygroundStore((s) => s.files);

  const isDir = node.type === "directory";
  const isExpanded = expandedDirs.has(node.path);
  const isActive = node.fileId === activeFileId;
  const file = node.fileId ? files.find((f) => f.id === node.fileId) : null;

  const handleClick = () => {
    if (isDir) {
      toggleDir(node.path);
    } else if (node.fileId) {
      setActiveFile(node.fileId);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1 py-[3px] px-2 cursor-pointer rounded-sm text-xs transition-colors",
          isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
        role="treeitem"
        aria-expanded={isDir ? isExpanded : undefined}
        aria-selected={isActive}
      >
        {/* Expand/Collapse Icon */}
        {isDir ? (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5" /> // Spacer for alignment
        )}

        {/* Icon */}
        {isDir ? (
          isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
          ) : (
            <FolderClosed className="h-3.5 w-3.5 shrink-0 text-yellow-600" />
          )
        ) : (
          <FileCode
            className={cn("h-3.5 w-3.5 shrink-0", getFileIconColor(node.name))}
          />
        )}

        {/* Name */}
        <span className="truncate flex-1">{node.name}</span>

        {/* Entry point indicator */}
        {file?.isEntryPoint && (
          <Star className="h-3 w-3 shrink-0 text-yellow-500 fill-yellow-500" />
        )}

        {/* Actions (visible on hover) */}
        {!isDir && node.fileId && (
          <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
            {!file?.isEntryPoint && (
              <button
                className="rounded p-0.5 hover:bg-foreground/10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.fileId) setEntryPoint(node.fileId);
                  toast.success(`${node.name} set as entry point`);
                }}
                title="Set as entry point"
              >
                <Star className="h-3 w-3" />
              </button>
            )}
            <button
              className="rounded p-0.5 hover:bg-destructive/20 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                if (node.fileId) deleteFile(node.fileId);
                toast.success(`${node.name} deleted`);
              }}
              title="Delete file"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Children (for directories) */}
      {isDir &&
        isExpanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            expandedDirs={expandedDirs}
            toggleDir={toggleDir}
          />
        ))}
    </>
  );
}

export function PgFileTree() {
  const getFileTree = usePlaygroundStore((s) => s.getFileTree);
  const createFile = usePlaygroundStore((s) => s.createFile);
  const files = usePlaygroundStore((s) => s.files);

  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(
    new Set(["src"]),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // files is included intentionally to trigger recomputation when files change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tree = useMemo(() => getFileTree(), [files, getFileTree]);

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleCreate = () => {
    const name = newFileName.trim();
    if (!name) {
      toast.error("File name cannot be empty");
      return;
    }
    if (files.some((f) => f.path === name)) {
      toast.error("A file with that name already exists");
      return;
    }

    // If it's package.json, add default content
    let content = "";
    if (name === "package.json") {
      content = JSON.stringify(
        {
          name: "playground",
          version: "1.0.0",
          scripts: { start: "node index.js" },
          dependencies: {},
        },
        null,
        2,
      );
    }

    createFile(name, content);
    setNewFileName("");
    setIsCreating(false);
    toast.success(`Created ${name}`);
  };

  return (
    <div className="flex h-full flex-col bg-[#252526]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => setIsCreating(true)}
          title="New file"
        >
          <FilePlus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* New file input */}
      {isCreating && (
        <div className="flex items-center gap-1 border-b border-border/20 px-2 py-1.5">
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="file.ts"
            className="h-6 text-xs bg-background/50 border-primary/30"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setIsCreating(false);
                setNewFileName("");
              }
            }}
          />
          <button
            className="rounded p-0.5 hover:bg-foreground/10"
            onClick={() => {
              setIsCreating(false);
              setNewFileName("");
            }}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="py-1" role="tree">
          {tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              expandedDirs={expandedDirs}
              toggleDir={toggleDir}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

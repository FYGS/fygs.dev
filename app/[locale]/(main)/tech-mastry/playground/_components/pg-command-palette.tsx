"use client";

import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import {
  Code2,
  Download,
  Layers,
  Play,
  RotateCcw,
  Settings,
  Share2,
  Trash2,
  Wand2,
  Bot,
  Swords,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { globalEditorRef } from "./pg-code-editor";
import { usePlaygroundStore } from "../_stores/playground-store";

interface PaletteAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
  shortcut?: string;
  execute: () => void;
}

export function PgCommandPalette() {
  const [open, setOpen] = useState(false);
  const executeCode = usePlaygroundStore((s) => s.executeCode);
  const clearConsole = usePlaygroundStore((s) => s.clearConsole);
  const formatCode = usePlaygroundStore((s) => s.formatCode);
  const resetPlayground = usePlaygroundStore((s) => s.resetPlayground);
  const createSnapshot = usePlaygroundStore((s) => s.createSnapshot);
  const exportAsUrl = usePlaygroundStore((s) => s.exportAsUrl);

  // Listen for open event from toolbar
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("pg-open-command-palette", handler);
    return () => window.removeEventListener("pg-open-command-palette", handler);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const actions: PaletteAction[] = [
    {
      id: "run",
      label: "Run Code",
      icon: <Play className="h-4 w-4" />,
      group: "Execution",
      shortcut: "Ctrl+Enter",
      execute: () => {
        clearConsole();
        executeCode();
        close();
      },
    },
    {
      id: "format",
      label: "Format Code",
      icon: <Wand2 className="h-4 w-4" />,
      group: "Editor",
      shortcut: "Ctrl+Shift+F",
      execute: () => {
        formatCode();
        close();
      },
    },
    {
      id: "save-snapshot",
      label: "Save Snapshot",
      icon: <Download className="h-4 w-4" />,
      group: "Editor",
      shortcut: "Ctrl+S",
      execute: () => {
        createSnapshot("From command palette");
        toast.success("Snapshot saved");
        close();
      },
    },
    {
      id: "share",
      label: "Share via URL",
      icon: <Share2 className="h-4 w-4" />,
      group: "Sharing",
      execute: async () => {
        const encoded = exportAsUrl();
        const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied!");
        close();
      },
    },
    {
      id: "templates",
      label: "Browse Templates",
      icon: <Layers className="h-4 w-4" />,
      group: "Project",
      execute: () => {
        close();
        setTimeout(
          () => window.dispatchEvent(new Event("pg-open-templates")),
          100,
        );
      },
    },
    {
      id: "settings",
      label: "Open Settings",
      icon: <Settings className="h-4 w-4" />,
      group: "Preferences",
      execute: () => {
        close();
        setTimeout(
          () => window.dispatchEvent(new Event("pg-open-settings")),
          100,
        );
      },
    },
    {
      id: "clear-console",
      label: "Clear Console",
      icon: <Trash2 className="h-4 w-4" />,
      group: "Console",
      execute: () => {
        clearConsole();
        close();
      },
    },
    {
      id: "reset",
      label: "Reset Playground",
      icon: <RotateCcw className="h-4 w-4" />,
      group: "Project",
      execute: () => {
        resetPlayground();
        toast.success("Playground reset");
        close();
      },
    },
    {
      id: "goto-line",
      label: "Go to Line...",
      icon: <Code2 className="h-4 w-4" />,
      group: "Editor",
      shortcut: "Ctrl+G",
      execute: () => {
        close();
        const editor = globalEditorRef.current;
        if (editor) {
          editor.focus();
          editor.getAction("editor.action.gotoLine")?.run();
        }
      },
    },
    {
      id: "find-replace",
      label: "Find and Replace",
      icon: <Code2 className="h-4 w-4" />,
      group: "Editor",
      shortcut: "Ctrl+H",
      execute: () => {
        close();
        const editor = globalEditorRef.current;
        if (editor) {
          editor.focus();
          editor.getAction("editor.action.startFindReplaceAction")?.run();
        }
      },
    },
    {
      id: "interview",
      label: "Interview Mode",
      icon: <Swords className="h-4 w-4" />,
      group: "Features",
      execute: () => {
        close();
        setTimeout(
          () => window.dispatchEvent(new Event("pg-open-interview")),
          100,
        );
      },
    },
    {
      id: "collaborate",
      label: "Collaborative Coding",
      icon: <Users className="h-4 w-4" />,
      group: "Features",
      execute: () => {
        close();
        setTimeout(
          () => window.dispatchEvent(new Event("pg-open-collaborate")),
          100,
        );
      },
    },
    {
      id: "ai-assistant",
      label: "AI Learning Assistant",
      icon: <Bot className="h-4 w-4" />,
      group: "Features",
      execute: () => {
        close();
        setTimeout(
          () => window.dispatchEvent(new Event("pg-open-ai-assistant")),
          100,
        );
      },
    },
  ];

  const groups = Array.from(new Set(actions.map((a) => a.group)));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Palette */}
      <Command
        className={cn(
          "relative w-full max-w-lg rounded-xl border border-border/30",
          "bg-[#1e1e1e] shadow-2xl overflow-hidden",
        )}
        loop
      >
        <Command.Input
          placeholder="Type a command..."
          className={cn(
            "w-full border-b border-border/20 bg-transparent px-4 py-3",
            "text-sm text-white placeholder:text-muted-foreground",
            "outline-none",
          )}
          autoFocus
        />
        <Command.List className="max-h-80 overflow-auto p-2">
          <Command.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">
            No commands found.
          </Command.Empty>

          {groups.map((group) => (
            <Command.Group key={group} heading={group}>
              {actions
                .filter((a) => a.group === group)
                .map((action) => (
                  <Command.Item
                    key={action.id}
                    value={action.label}
                    onSelect={action.execute}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                      "cursor-pointer text-white/90",
                      "data-[selected=true]:bg-white/10",
                    )}
                  >
                    <span className="text-muted-foreground">{action.icon}</span>
                    <span className="flex-1">{action.label}</span>
                    {action.shortcut && (
                      <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {action.shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}

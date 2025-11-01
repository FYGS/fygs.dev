"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Code2,
  Copy,
  History,
  Play,
  Save,
  Share2,
  StopCircle,
  Wand2,
} from "lucide-react";
import { SHORTCUTS } from "../_hooks/use-shortcuts";
import { useEditorStore } from "../_stores/editor-store";
import { CollaborationPanel } from "./collaboration-panel";
import { InterviewMode } from "./interview-mode";
import { SettingsPanel } from "./settings-panel";
import { TemplateSelector } from "./template-selector";
import { useLanguage } from "../_hooks/use-language";

export function ToolbarActions() {
  const {
    executeCode,
    status,
    history,
    createSnapshot,
    restoreSnapshot,
    formatCode,
    getPackageJson,
    clearOutput,
  } = useEditorStore();
  const { language } = useLanguage(); // Language is now read-only, determined by template

  const handleCopyCode = async () => {
    const code = useEditorStore.getState().code;
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard", {
      description: "You can now paste it anywhere",
    });
  };

  const handleSaveCode = () => {
    createSnapshot();
    toast.success("Code saved", {
      description: "Your code has been saved to history",
    });
  };

  const handleShareCode = () => {
    toast.success("Share feature coming soon", {
      description: "This feature is not yet implemented",
    });
  };

  const handleFormatCode = () => {
    formatCode();
    toast.success("Code formatted", {
      description: "Your code has been formatted",
    });
  };

  return (
    <div className="flex flex-col gap-2 p-2 border-b border-border/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={status === "running"}
                  className={cn(
                    "h-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90",
                    status === "running" && "animate-pulse"
                  )}
                  onClick={() => {
                    clearOutput();
                    // Check if there's a package.json with scripts
                    const packageJson = getPackageJson();
                    if (packageJson) {
                      try {
                        const pkg = JSON.parse(packageJson);
                        // If there's a start script, use it
                        if (pkg && pkg.scripts && pkg.scripts.start) {
                          executeCode({ runScript: "start" });
                          return;
                        }
                      } catch (error) {
                        console.error("Invalid package.json:", error);
                      }
                    }

                    // Get all files to check if we have CSS and HTML files
                    const files = useEditorStore.getState().files;
                    const htmlFile = files.find(
                      (f) => f.name.endsWith(".html") || f.name.endsWith(".htm")
                    );
                    const cssFile = files.find((f) => f.name.endsWith(".css"));

                    // If we have both HTML and CSS files, make sure to execute with the HTML file as active
                    if (htmlFile && cssFile) {
                      // Set the HTML file as active before executing
                      useEditorStore.getState().setActiveFile(htmlFile.id);
                    }

                    // Execute the code normally
                    executeCode();
                  }}
                >
                  {status === "running" ? (
                    <>
                      <StopCircle className="h-4 w-4" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Code
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="tooltip-content">
                <p>
                  Run Code
                  <kbd className="shortcut-kbd">{SHORTCUTS.RUN.key}</kbd>
                </p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="h-8 w-8 ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="tooltip-content">
                <p>Copy Code</p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSaveCode}
                  className="h-8 w-8 ml-2"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="tooltip-content">
                <p>
                  Save Code
                  <kbd className="shortcut-kbd">{SHORTCUTS.SAVE.key}</kbd>
                </p>
              </TooltipContent>
            </Tooltip>

          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFormatCode}
                  className="h-8 w-8 ml-2"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="tooltip-content">
                <p>
                  Format Code
                  <kbd className="shortcut-kbd">{SHORTCUTS.FORMAT.key}</kbd>
                </p>
              </TooltipContent>
            </Tooltip>

          {/* Template Selector */}
          <TemplateSelector />

          {/* Interview Mode */}
          <InterviewMode />

          {/* Collaboration Panel */}
          <CollaborationPanel />
        </div>

        <div className="flex items-center gap-2">
          {/* Language Indicator (Read-only) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-muted/30 text-sm">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            <span className="capitalize text-muted-foreground">{language}</span>
          </div>

          {/* History */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {history.snapshots.length === 0 ? (
                <DropdownMenuItem disabled>No history</DropdownMenuItem>
              ) : (
                history.snapshots.map((snapshot) => (
                  <DropdownMenuItem
                    key={snapshot.id}
                    onClick={() => restoreSnapshot(snapshot.id)}
                  >
                    {new Date(snapshot.timestamp).toLocaleString()} -{" "}
                    {snapshot.language}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Panel */}
          <SettingsPanel />

          {/* Share Button */}
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShareCode}
                  className="h-8 w-8"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="tooltip-content">
                <p>Share Code</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </div>
    </div>
  );
}

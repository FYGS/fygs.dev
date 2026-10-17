"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Code2,
  Copy,
  Download,
  FolderTree,
  History,
  Layers,
  Monitor,
  MoreHorizontal,
  Package,
  Play,
  RotateCcw,
  Search,
  Settings,
  Share2,
  Sparkles,
  StopCircle,
  Terminal,
  Wand2,
} from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { toast } from "sonner";
import { usePlaygroundStore } from "../_stores/playground-store";

// ── Language icon mapping ────────────────────────────────────────────────────

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: "text-blue-400",
  javascript: "text-yellow-400",
  python: "text-green-400",
  html: "text-orange-400",
  css: "text-purple-400",
  jsx: "text-cyan-400",
  tsx: "text-blue-300",
  json: "text-yellow-300",
  markdown: "text-gray-400",
};

export function PgToolbar() {
  const executeCode = usePlaygroundStore((s) => s.executeCode);
  const stopExecution = usePlaygroundStore((s) => s.stopExecution);
  const status = usePlaygroundStore((s) => s.status);
  const wcStatus = usePlaygroundStore((s) => s.wcStatus);
  const installPackages = usePlaygroundStore((s) => s.installPackages);
  const formatCode = usePlaygroundStore((s) => s.formatCode);
  const createSnapshot = usePlaygroundStore((s) => s.createSnapshot);
  const restoreSnapshot = usePlaygroundStore((s) => s.restoreSnapshot);
  const history = usePlaygroundStore((s) => s.history);
  const exportAsUrl = usePlaygroundStore((s) => s.exportAsUrl);
  const resetPlayground = usePlaygroundStore((s) => s.resetPlayground);
  const clearConsole = usePlaygroundStore((s) => s.clearConsole);
  const getCurrentLanguage = usePlaygroundStore((s) => s.getCurrentLanguage);
  const toggleFileExplorer = usePlaygroundStore((s) => s.toggleFileExplorer);
  const toggleConsole = usePlaygroundStore((s) => s.toggleConsole);
  const togglePreview = usePlaygroundStore((s) => s.togglePreview);
  const layout = usePlaygroundStore((s) => s.layout);
  const aiPanelOpen = usePlaygroundStore((s) => s.aiPanelOpen);
  const setAiPanelOpen = usePlaygroundStore((s) => s.setAiPanelOpen);
  const aiText = useIntlayer("ai-assistant");
  const getPackageJson = usePlaygroundStore((s) => {
    const file = s.files.find((f) => f.name === "package.json");
    return file?.content ?? null;
  });

  const language = getCurrentLanguage();

  const handleRun = async () => {
    clearConsole();

    // Check for package.json with start script
    if (getPackageJson) {
      try {
        const pkg = JSON.parse(getPackageJson);
        if (pkg?.scripts?.start) {
          executeCode({ runScript: "start" });
          return;
        }
      } catch {
        // Ignore parse errors
      }
    }

    executeCode();
  };

  const handleCopy = async () => {
    const code = usePlaygroundStore.getState().getActiveFile()?.content ?? "";
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const handleSave = () => {
    createSnapshot("Manual save");
    toast.success("Snapshot saved");
  };

  const handleFormat = () => {
    formatCode();
    toast.success("Code formatted");
  };

  const handleShare = async () => {
    const encoded = exportAsUrl();
    const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;

    if (url.length > 8000) {
      toast.error("Code too large to share via URL", {
        description: "Try reducing the code size",
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  const handleDownload = () => {
    const files = usePlaygroundStore.getState().files;
    if (files.length === 1) {
      const file = files[0];
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Multi-file: download with file markers
      const content = files
        .map((f) => `// ===== ${f.path} =====\n${f.content}`)
        .join("\n\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "playground-project.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success("Project downloaded");
  };

  const handleReset = () => {
    resetPlayground();
    toast.success("Playground reset to default");
  };

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/30 bg-[#252526] px-3 py-1.5">
      {/* Left: Run + Core Actions */}
      <div className="flex items-center gap-1.5">
        {/* Run / Stop Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              disabled={status === "running" && false}
              className={cn(
                "h-7 gap-1.5 px-3 text-xs font-semibold transition-colors",
                status === "running"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-700 hover:bg-green-800",
              )}
              onClick={status === "running" ? stopExecution : handleRun}
            >
              {status === "running" ? (
                <>
                  <StopCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Run</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {status === "running" ? "Stop execution" : "Run code (Ctrl+Enter)"}
          </TooltipContent>
        </Tooltip>

        {/* Install Dependencies */}
        {getPackageJson && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                disabled={wcStatus === "installing" || wcStatus === "booting"}
                className="h-7 gap-1.5 px-2 text-xs"
                onClick={() => installPackages()}
              >
                <Package className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Install</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Install npm dependencies</TooltipContent>
          </Tooltip>
        )}

        <div className="mx-1 h-4 w-px bg-border/30" />

        {/* Format */}
        <ToolbarButton
          icon={Wand2}
          tooltip="Format (Ctrl+Shift+F)"
          onClick={handleFormat}
        />

        {/* Copy */}
        <ToolbarButton icon={Copy} tooltip="Copy code" onClick={handleCopy} />

        {/* Save Snapshot */}
        <ToolbarButton
          icon={Download}
          tooltip="Save snapshot (Ctrl+S)"
          onClick={handleSave}
        />

        <div className="mx-1 h-4 w-px bg-border/30 hidden sm:block" />

        {/* Templates */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs hidden sm:flex"
              onClick={() =>
                window.dispatchEvent(new Event("pg-open-templates"))
              }
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Templates</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Browse project templates</TooltipContent>
        </Tooltip>

        <div className="mx-1 h-4 w-px bg-border/30 hidden sm:block" />

        {/* Panel Toggle Buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                layout.showFileExplorer
                  ? "text-blue-400"
                  : "text-muted-foreground opacity-60",
              )}
              onClick={toggleFileExplorer}
              aria-label="File explorer"
              aria-pressed={layout.showFileExplorer}
            >
              <FolderTree className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {layout.showFileExplorer ? "Hide" : "Show"} Explorer (Ctrl+B)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                layout.showConsole
                  ? "text-blue-400"
                  : "text-muted-foreground opacity-60",
              )}
              onClick={toggleConsole}
              aria-label="Console"
              aria-pressed={layout.showConsole}
            >
              <Terminal className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {layout.showConsole ? "Hide" : "Show"} Console (Ctrl+`)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                layout.showPreview
                  ? "text-blue-400"
                  : "text-muted-foreground opacity-60",
              )}
              onClick={togglePreview}
              aria-label="Preview"
              aria-pressed={layout.showPreview}
            >
              <Monitor className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {layout.showPreview ? "Hide" : "Show"} Preview
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Meta actions */}
      <div className="flex items-center gap-1">
        {/* Language Badge */}
        <div
          className={cn(
            "hidden sm:flex items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium",
            LANGUAGE_COLORS[language] ?? "text-muted-foreground",
          )}
        >
          <Code2 className="h-3 w-3" />
          <span className="capitalize">{language}</span>
        </div>

        {/* AI assistant */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={aiPanelOpen}
              aria-label={aiText.openTooltip.value}
              data-testid="pg-ai-toggle"
              className={cn(
                "h-7 gap-1.5 px-2 text-xs",
                aiPanelOpen ? "bg-primary/15 text-primary" : "text-muted-foreground",
              )}
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{aiText.shortLabel.value}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{aiText.openTooltip.value}</TooltipContent>
        </Tooltip>

        {/* Command Palette */}
        <ToolbarButton
          icon={Search}
          tooltip="Command Palette (Ctrl+K)"
          onClick={() =>
            window.dispatchEvent(new Event("pg-open-command-palette"))
          }
        />

        {/* History */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <History className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="max-h-64 overflow-auto">
            {history.snapshots.length === 0 ? (
              <DropdownMenuItem disabled>No history yet</DropdownMenuItem>
            ) : (
              history.snapshots
                .slice()
                .reverse()
                .map((snap) => (
                  <DropdownMenuItem
                    key={snap.id}
                    onClick={() => restoreSnapshot(snap.id)}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs">
                        {new Date(snap.timestamp).toLocaleString()}
                      </span>
                      {snap.label && (
                        <span className="text-[10px] text-muted-foreground">
                          {snap.label}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Share */}
        <ToolbarButton
          icon={Share2}
          tooltip="Share (copy link)"
          onClick={handleShare}
        />

        {/* More Menu: Settings, Download, Reset */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(new Event("pg-open-settings"))
              }
            >
              <Settings className="mr-2 h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-3.5 w-3.5" />
              Download project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleReset}
              className="text-red-400 focus:text-red-300"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset playground
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ── Reusable toolbar icon button ─────────────────────────────────────────────

function ToolbarButton({
  icon: Icon,
  tooltip,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClick}
          aria-label={tooltip}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

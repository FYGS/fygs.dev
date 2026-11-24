"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  FolderTree,
  Globe,
  Loader2,
  Monitor,
  Terminal,
  XCircle,
  Zap,
} from "lucide-react";
import { usePlaygroundStore } from "../_stores/playground-store";

export function PgStatusBar() {
  const status = usePlaygroundStore((s) => s.status);
  const wcStatus = usePlaygroundStore((s) => s.wcStatus);
  const serverUrl = usePlaygroundStore((s) => s.serverUrl);
  const activeFileId = usePlaygroundStore((s) => s.activeFileId);
  const files = usePlaygroundStore((s) => s.files);
  const consoleEntries = usePlaygroundStore((s) => s.consoleEntries);
  const getCurrentLanguage = usePlaygroundStore((s) => s.getCurrentLanguage);
  const toggleFileExplorer = usePlaygroundStore((s) => s.toggleFileExplorer);
  const toggleConsole = usePlaygroundStore((s) => s.toggleConsole);
  const togglePreview = usePlaygroundStore((s) => s.togglePreview);
  const layout = usePlaygroundStore((s) => s.layout);

  const activeFile = files.find((f) => f.id === activeFileId);
  const language = getCurrentLanguage();
  const errorCount = consoleEntries.filter(
    (e: { type: string }) => e.type === "error",
  ).length;
  const warnCount = consoleEntries.filter(
    (e: { type: string }) => e.type === "warn",
  ).length;

  // WebContainer status indicator
  const wcIndicator = (() => {
    switch (wcStatus) {
      case "booting":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: "Booting...",
          color: "text-yellow-300",
        };
      case "ready":
        return {
          icon: <Zap className="h-3 w-3" />,
          label: "Node.js",
          color: "text-green-200",
        };
      case "installing":
        return {
          icon: <Cloud className="h-3 w-3 animate-pulse" />,
          label: "Installing...",
          color: "text-blue-300",
        };
      case "running":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: "Running",
          color: "text-cyan-300",
        };
      case "error":
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: "Error",
          color: "text-red-300",
        };
      default:
        return null;
    }
  })();

  return (
    <div className="flex h-6 items-center justify-between border-t border-border/20 bg-[#005a9e] px-3 text-[11px] text-white select-none">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Execution Status */}
        <div className="flex items-center gap-1">
          {status === "running" ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Running...</span>
            </>
          ) : status === "error" ? (
            <>
              <XCircle className="h-3 w-3" />
              <span>Error</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3 w-3" />
              <span>Ready</span>
            </>
          )}
        </div>

        {/* WebContainer status */}
        {wcIndicator && (
          <div className={cn("flex items-center gap-1", wcIndicator.color)}>
            {wcIndicator.icon}
            <span className="text-[10px]">{wcIndicator.label}</span>
          </div>
        )}

        {/* Server URL indicator */}
        {serverUrl && (
          <div className="flex items-center gap-1 text-green-200">
            <Globe className="h-3 w-3" />
            <span className="text-[10px] font-mono max-w-[150px] truncate">
              {serverUrl}
            </span>
          </div>
        )}

        {/* Error / Warning counts */}
        {(errorCount > 0 || warnCount > 0) && (
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="flex items-center gap-0.5">
                <XCircle className="h-3 w-3" />
                {errorCount}
              </span>
            )}
            {warnCount > 0 && (
              <span className="flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3" />
                {warnCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Panel toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFileExplorer}
            className={cn(
              "flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-white/15",
              layout.showFileExplorer ? "opacity-100" : "opacity-50",
            )}
            title={`${layout.showFileExplorer ? "Hide" : "Show"} Explorer`}
          >
            <FolderTree className="h-3 w-3" />
          </button>
          <button
            onClick={toggleConsole}
            className={cn(
              "flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-white/15",
              layout.showConsole ? "opacity-100" : "opacity-50",
            )}
            title={`${layout.showConsole ? "Hide" : "Show"} Console`}
          >
            <Terminal className="h-3 w-3" />
          </button>
          <button
            onClick={togglePreview}
            className={cn(
              "flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-white/15",
              layout.showPreview ? "opacity-100" : "opacity-50",
            )}
            title={`${layout.showPreview ? "Hide" : "Show"} Preview`}
          >
            <Monitor className="h-3 w-3" />
          </button>
        </div>

        <div className="h-3 w-px bg-white/20" />

        {/* File path */}
        {activeFile && (
          <span className="max-w-[200px] truncate">
            {activeFile.path}
          </span>
        )}

        {/* Language */}
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
            "bg-white/15",
          )}
        >
          {language}
        </span>

        {/* Encoding */}
        <span>UTF-8</span>

        {/* File count */}
        <span className="">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

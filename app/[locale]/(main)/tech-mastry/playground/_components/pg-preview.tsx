"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Globe,
  Loader2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePlaygroundStore } from "../_stores/playground-store";

type DeviceMode = "responsive" | "mobile" | "tablet" | "desktop";

const deviceWidths: Record<DeviceMode, string> = {
  responsive: "100%",
  mobile: "375px",
  tablet: "768px",
  desktop: "1280px",
};

export function PgPreview() {
  const previewHtml = usePlaygroundStore((s) => s.previewHtml);
  const serverUrl = usePlaygroundStore((s) => s.serverUrl);
  const wcStatus = usePlaygroundStore((s) => s.wcStatus);
  const addConsoleEntry = usePlaygroundStore((s) => s.addConsoleEntry);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("responsive");
  const [isLoading, setIsLoading] = useState(false);

  // Listen for console messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only the preview iframe may write to the console: any other window that
      // can post a message to this page (opener, parent frame) is ignored.
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "console") {
        const method = event.data.method as string;
        const type =
          method === "error" ? "error" : method === "warn" ? "warn" : "log";
        // The previewed page is user code: bound what it can push into the console
        addConsoleEntry({
          type,
          content: String(event.data.message ?? "").slice(0, 5000),
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [addConsoleEntry]);

  // Create blob URL from preview HTML (for static HTML preview)
  useEffect(() => {
    if (!previewHtml || serverUrl) {
      setBlobUrl(null);
      return;
    }

    setIsLoading(true);

    try {
      // Clean up previous blob
      if (blobUrl) URL.revokeObjectURL(blobUrl);

      const htmlContent = previewHtml.startsWith("data:text/html")
        ? decodeURIComponent(previewHtml.split(",")[1])
        : previewHtml;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (error) {
      console.error("Preview error:", error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewHtml, serverUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      if (serverUrl) {
        iframeRef.current.src = serverUrl;
      } else if (blobUrl) {
        iframeRef.current.src = blobUrl;
      }
    }
  };

  const handleOpenExternal = () => {
    const url = serverUrl || blobUrl;
    if (url) window.open(url, "_blank");
  };

  // Determine what to show
  const activeUrl = serverUrl || blobUrl;
  const hasContent = !!activeUrl;

  // Show booting/installing state
  if (wcStatus === "booting" || wcStatus === "installing") {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <div className="text-center text-muted-foreground/60">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-400" />
          <p className="text-xs font-medium">
            {wcStatus === "booting"
              ? "Booting WebContainer..."
              : "Installing dependencies..."}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/40">
            Real Node.js environment loading
          </p>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <div className="text-center text-muted-foreground/50">
          <Monitor className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p className="text-xs">Preview will appear here</p>
          <p className="mt-1 text-[10px]">
            {serverUrl === null
              ? "Run code to see output"
              : "Waiting for server..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between border-b border-border/20 px-3 py-1.5 bg-[#252526]">
        <div className="flex items-center gap-1">
          {/* Server URL indicator if WebContainer server is running */}
          {serverUrl && (
            <div className="flex items-center gap-1.5 mr-2 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
              <Globe className="h-3 w-3 text-green-400" />
              <span className="text-[10px] text-green-400 font-mono max-w-[200px] truncate">
                {serverUrl}
              </span>
            </div>
          )}

          {/* Device mode toggles */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6",
              deviceMode === "responsive" && "bg-muted/50",
            )}
            onClick={() => setDeviceMode("responsive")}
            title="Responsive"
          >
            <Monitor className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", deviceMode === "mobile" && "bg-muted/50")}
            onClick={() => setDeviceMode("mobile")}
            title="Mobile (375px)"
          >
            <Smartphone className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", deviceMode === "tablet" && "bg-muted/50")}
            onClick={() => setDeviceMode("tablet")}
            title="Tablet (768px)"
          >
            <Tablet className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-[#0d1117] p-2">
        <div
          className={cn(
            "h-full bg-white transition-all duration-200 rounded overflow-hidden shadow-lg",
            deviceMode !== "responsive" && "border border-border/30",
          )}
          style={{
            width: deviceWidths[deviceMode],
            maxWidth: "100%",
          }}
        >
          {activeUrl && (
            <iframe
              ref={iframeRef}
              src={activeUrl}
              className="h-full w-full border-0"
              sandbox={
                serverUrl
                  ? "allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
                  : "allow-scripts allow-modals allow-forms"
              }
              title="Preview"
              onLoad={() => setIsLoading(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

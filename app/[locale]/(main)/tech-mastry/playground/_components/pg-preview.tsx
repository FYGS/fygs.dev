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

/** Page that shows the learner's HTML in an opaque origin (public/sandbox/preview.js documents the protocol). */
export const PREVIEW_HOST_URL = "/sandbox/preview.html";

/** 128 random bits as hex: one per render, in the address fragment of the preview frame. */
function newNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The HTML to show: the store keeps it as a `data:text/html` address or as plain HTML. */
function previewDocument(previewHtml: string | null, serverUrl: string | null): string | null {
  if (!previewHtml || serverUrl) return null;
  try {
    return previewHtml.startsWith("data:text/html") ? decodeURIComponent(previewHtml.split(",")[1]) : previewHtml;
  } catch (error) {
    console.error("Preview error:", error);
    return null;
  }
}

export function PgPreview() {
  const previewHtml = usePlaygroundStore((s) => s.previewHtml);
  const serverUrl = usePlaygroundStore((s) => s.serverUrl);
  const wcStatus = usePlaygroundStore((s) => s.wcStatus);
  const addConsoleEntry = usePlaygroundStore((s) => s.addConsoleEntry);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("responsive");
  const [isLoading, setIsLoading] = useState(false);
  // A new static preview starts loading (state adjusted during render)
  const [seenInputs, setSeenInputs] = useState<{ previewHtml: string | null; serverUrl: string | null } | null>(null);
  if (!seenInputs || seenInputs.previewHtml !== previewHtml || seenInputs.serverUrl !== serverUrl) {
    setSeenInputs({ previewHtml, serverUrl });
    if (previewHtml && !serverUrl) setIsLoading(true);
  }

  // One render = one fresh frame with its own nonce (a new `key` re-creates the frame, so nothing of the previous
  // page survives a refresh). Adjusted during render, like the loading state above.
  const html = previewDocument(previewHtml, serverUrl);
  const [render, setRender] = useState<{ nonce: string; html: string } | null>(null);
  if (html !== null && html !== render?.html) setRender({ nonce: newNonce(), html });
  if (html === null && render !== null) setRender(null);
  const renderRef = useRef(render);
  useEffect(() => {
    renderRef.current = render;
  });

  // Messages from the preview frame: its console, and the handshake that hands it the HTML
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only the preview iframe may speak here: any other window that can post a message to this page
      // (opener, parent frame) is ignored.
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { type?: string; nonce?: string; method?: string; message?: unknown } | null;
      const current = renderRef.current;
      if (data?.type === "preview-ready") {
        if (current && data.nonce === current.nonce) {
          iframeRef.current?.contentWindow?.postMessage({ type: "render", nonce: current.nonce, html: current.html }, "*");
        }
        return;
      }
      if (data?.type === "console") {
        const method = data.method as string;
        const type = method === "error" ? "error" : method === "warn" ? "warn" : "log";
        // The previewed page is user code: bound what it can push into the console
        addConsoleEntry({
          type,
          content: String(data.message ?? "").slice(0, 5000),
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [addConsoleEntry]);

  const handleRefresh = () => {
    setIsLoading(true);
    if (serverUrl && iframeRef.current) {
      iframeRef.current.src = serverUrl;
    } else if (render) {
      setRender({ nonce: newNonce(), html: render.html });
    }
  };

  // Only a WebContainer dev server has an origin of its own and can be opened as a page. The learner's own HTML
  // is never offered as a top-level page: opened that way it would no longer be sandboxed.
  const handleOpenExternal = () => {
    if (serverUrl) window.open(serverUrl, "_blank", "noopener,noreferrer");
  };

  const activeUrl = serverUrl || (render ? `${PREVIEW_HOST_URL}#${render.nonce}` : null);

  // Determine what to show
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
          {serverUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleOpenExternal}
              title="Open in new tab"
              aria-label="Open the dev server in a new tab"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
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
              key={serverUrl ?? render?.nonce}
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

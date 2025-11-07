"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../_stores/editor-store";

interface HtmlPreviewProps {
  dataUrl: string;
}

export function HtmlPreview({ dataUrl }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "console") {
        const { method, message } = event.data;

        // Update the store based on the message type
        const store = useEditorStore.getState();
        if (method === "log") {
          // Use the store's method to add logs
          store.addLog(message);
        } else if (method === "error") {
          // Use the store's method to add errors
          store.addError(message);
        } else if (method === "warn") {
          // Handle warnings
          store.addLog(message);
        } else if (method === "info") {
          // Handle info messages
          store.addLog(message);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Create a blob URL from the data URL for better iframe handling
  useEffect(() => {
    if (!dataUrl) return;

    try {
      // Clean up previous blob URL if it exists
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      // Extract the HTML content from the data URL
      const htmlContent = dataUrl.startsWith("data:text/html")
        ? decodeURIComponent(dataUrl.split(",")[1])
        : dataUrl;

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: "text/html" });

      // Create a URL for the blob
      const newBlobUrl = URL.createObjectURL(blob);

      // Store the blob URL
      setBlobUrl(newBlobUrl);
      setError(null);

      // Log success for debugging
      console.log("Created blob URL for HTML preview");
    } catch (error) {
      console.error("Error creating blob URL:", error);
      setError("Failed to create preview");
    }
    // Only depend on dataUrl, not blobUrl to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl]);

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Open preview in new tab
  const openInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
    } else if (dataUrl) {
      // Fallback to the original data URL if there's no blob URL
      window.open(dataUrl, "_blank");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-md overflow-hidden">
      <div className="flex justify-between p-2 border-b border-border/30 bg-muted/30">
        <div className="flex items-center">
          <span className="text-xs text-green-500 font-semibold">
            HTML Preview
            {isLoading && " (Loading...)"}
            {error && " (Error)"}
          </span>
        </div>
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="text-xs gap-1 bg-primary hover:bg-primary/90"
                onClick={openInNewTab}
                disabled={!blobUrl && !dataUrl}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in New Tab
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View this HTML in a larger browser window</p>
            </TooltipContent>
          </Tooltip>
      </div>
      <div className="preview-container">
        {error ? (
          <div className="p-4 text-destructive">{error}</div>
        ) : (
          <iframe
            ref={iframeRef}
            src={blobUrl || dataUrl}
            className="preview-iframe"
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
            title="HTML Preview"
            height="100%"
            width="100%"
            onLoad={() => {
              setIsLoading(false);
              console.log("HTML preview loaded successfully");
            }}
            onError={() => {
              setIsLoading(false);
              setError("Failed to load HTML preview");
              console.error("Failed to load HTML preview");
            }}
          />
        )}
      </div>
    </div>
  );
}

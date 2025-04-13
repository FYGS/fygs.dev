"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  const editorStore = useEditorStore();
  // Height is controlled by CSS
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_iframeHeight, setIframeHeight] = useState<string>("100%");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "console") {
        const { method, message } = event.data;

        // Update the store based on the message type
        if (method === "log") {
          // Add to logs array - using mutable approach since this is how the store is designed
          editorStore.logs.push(message);
        } else if (method === "error") {
          // Add to errors array
          editorStore.errors.push(message);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [editorStore]);

  // Adjust iframe height based on content
  useEffect(() => {
    const adjustHeight = () => {
      if (iframeRef.current) {
        try {
          // Use a safer approach that doesn't require accessing the document
          // Just set the iframe to 100% height of its container
          setIframeHeight("100%");
        } catch (error) {
          console.error("Error adjusting iframe height:", error);
        }
      }
    };

    // Adjust height when iframe loads
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = adjustHeight;
    }

    // Initial adjustment
    adjustHeight();
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
    // Create a blob URL from the HTML content to avoid cross-origin issues
    try {
      // Extract the HTML content from the data URL
      const htmlContent = decodeURIComponent(dataUrl.split(",")[1]);

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: "text/html" });

      // Create a URL for the blob
      const newBlobUrl = URL.createObjectURL(blob);

      // Store the blob URL for cleanup
      setBlobUrl(newBlobUrl);

      // Open the blob URL in a new tab
      window.open(newBlobUrl, "_blank");
    } catch (error) {
      console.error("Error opening preview in new tab:", error);
      // Fallback to the original data URL if there's an error
      window.open(dataUrl, "_blank");
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-white dark:bg-gray-900 rounded-md overflow-hidden"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div className="flex justify-between p-2 border-b border-border/30 bg-muted/30">
        <div className="flex items-center">
          <span className="text-xs text-green-500 font-semibold">
            HTML Preview
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="text-xs gap-1 bg-primary hover:bg-primary/90"
                onClick={openInNewTab}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in New Tab
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View this HTML in a larger browser window</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="preview-iframe-container w-full h-full overflow-hidden">
        <iframe
          ref={iframeRef}
          src={dataUrl}
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
      </div>
    </div>
  );
}

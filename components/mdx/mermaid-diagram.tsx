"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  caption?: string;
  className?: string;
}

// Sanitize chart to fix common Mermaid parse issues
function sanitizeChart(raw: string): string {
  return raw.replace(/\\n/g, "<br/>").replace(/\n\n+/g, "\n");
}

export function MermaidDiagram({
  chart,
  caption,
  className,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const uniqueId = useId().replace(/:/g, "mermaid");

  const renderChart = useCallback(async () => {
    try {
      setSvg("");
      setError(null);
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#6366f1",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#818cf8",
          lineColor: "#94a3b8",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          background: "#020617",
          mainBkg: "#1e293b",
          nodeBorder: "#6366f1",
          clusterBkg: "#0f172a",
          titleColor: "#e2e8f0",
          edgeLabelBackground: "#1e293b",
        },
        fontFamily: "inherit",
        fontSize: 14,
        securityLevel: "loose",
      });

      const sanitized = sanitizeChart(chart);
      const renderId = `${uniqueId}-${retryCount}`;
      const { svg: renderedSvg } = await mermaid.render(renderId, sanitized);
      setSvg(renderedSvg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Diagram render failed");
    }
  }, [chart, uniqueId, retryCount]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 2.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleFullscreen = () => setIsFullscreen((f) => !f);

  if (error) {
    return (
      <div className="my-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-300">
              Erreur de rendu du diagramme
            </p>
            <pre className="mt-2 text-xs text-amber-400/70 whitespace-pre-wrap break-words overflow-hidden">
              {error}
            </pre>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="mt-3 text-xs font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors"
            >
              Réessayer le rendu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <figure className={cn("my-10 space-y-3", className)}>
        {/* Zoom controls */}
        {svg && (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground/50 tabular-nums w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Plein écran"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <div
          ref={containerRef}
          className={cn(
            "overflow-x-auto rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm",
            "p-4 sm:p-6",
            "flex items-center justify-center",
            "[&_svg]:max-w-full [&_svg]:h-auto",
            "touch-pan-x touch-pan-y",
            !svg && "min-h-[120px] animate-pulse",
          )}
        >
          {svg ? (
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center top",
                transition: "transform 0.2s ease",
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Génération du diagramme…
            </div>
          )}
        </div>
        {caption && (
          <figcaption className="text-center text-xs sm:text-sm text-muted-foreground/70 italic px-2">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Fullscreen overlay */}
      {isFullscreen && svg && (
        <div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={handleFullscreen}
        >
          <div className="relative w-full h-full overflow-auto flex items-center justify-center">
            <button
              onClick={handleFullscreen}
              className="absolute top-2 right-2 p-2 rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors z-10"
              aria-label="Fermer"
            >
              ✕
            </button>
            <div
              className="[&_svg]:max-w-full [&_svg]:max-h-[85vh] [&_svg]:w-auto [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
          {caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-foreground/70 italic">
              {caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  caption?: string;
  className?: string;
}

export function MermaidDiagram({
  chart,
  caption,
  className,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, "mermaid");

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      try {
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
        });

        const { svg: renderedSvg } = await mermaid.render(uniqueId, chart);
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Diagram render failed");
        }
      }
    }

    renderChart();
    return () => {
      cancelled = true;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-8 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
        <p className="font-medium">Diagram Error</p>
        <pre className="mt-2 text-xs opacity-70">{error}</pre>
      </div>
    );
  }

  return (
    <figure className={cn("my-10 space-y-3", className)}>
      <div
        ref={containerRef}
        className={cn(
          "overflow-x-auto rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-6",
          "flex items-center justify-center",
          "[&_svg]:max-w-full [&_svg]:h-auto",
        )}
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground/70 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
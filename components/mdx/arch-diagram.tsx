import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PropsWithChildren } from "react";

interface ArchDiagramProps {
  title?: string;
  caption?: string;
  className?: string;
}

export function ArchDiagram({
  title,
  caption,
  children,
  className,
}: PropsWithChildren<ArchDiagramProps>) {
  return (
    <figure className={cn("my-10 space-y-3", className)}>
      <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm">
        {title && (
          <div className="border-b border-border/30 px-5 py-3 bg-muted/30">
            <span className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {title}
            </span>
          </div>
        )}
        <CardContent className="p-6 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre [&>strong]:text-primary [&>strong]:font-bold [&>em]:text-emerald-400 [&>em]:not-italic">
            {children}
          </pre>
        </CardContent>
      </Card>
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground/70 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

interface DiagramBoxProps {
  label: string;
  variant?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

export function DiagramBox({
  label,
  variant = "primary",
  children,
  className,
}: PropsWithChildren<DiagramBoxProps>) {
  const variants = {
    primary: "border-primary/40 bg-primary/10 text-primary",
    secondary: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    accent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    muted: "border-border/40 bg-muted/30 text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-1 rounded-lg border px-4 py-3",
        variants[variant],
        className,
      )}
    >
      <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
      {children && (
        <span className="text-[10px] opacity-70">{children}</span>
      )}
    </div>
  );
}
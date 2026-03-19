import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { MDXPre } from "./mdx-pre";
import { MermaidDiagram } from "./mermaid-diagram";
import { ArchDiagram, DiagramBox } from "./arch-diagram";
import { HeadingAnchor } from "./heading-anchor";

/* ------------------------------------------------------------------ */
/*  Custom MDX components for blog posts                              */
/*  Passed to compileMDX in lib/mdx.ts for rich rendering            */
/* ------------------------------------------------------------------ */

export const components = {
  /* ── Headings ─────────────────────────────────────────────────── */
  /* h1 is hidden in blog posts because the page header already renders the title.
     This prevents the ugly duplicate-title issue when MDX starts with `# Title`. */
  h1: ({ children }: PropsWithChildren<{ className?: string }>) => (
    <h1 className="sr-only" aria-hidden="true">
      {children}
    </h1>
  ),

  h2: ({
    className,
    children,
    id,
    ...props
  }: PropsWithChildren<{ className?: string; id?: string }>) => (
    <h2
      className={cn(
        "group scroll-m-24 text-2xl sm:text-3xl font-bold tracking-tight mt-16 mb-6 pb-3",
        "border-b-2 border-primary/20",
        className,
      )}
      id={id}
      {...props}
    >
      <span className="text-gradient-accent">{children}</span>
      {id && (
        <HeadingAnchor
          id={id}
          className="ml-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-muted-foreground"
        />
      )}
    </h2>
  ),

  h3: ({
    className,
    children,
    id,
    ...props
  }: PropsWithChildren<{ className?: string; id?: string }>) => (
    <h3
      className={cn(
        "group scroll-m-24 text-xl sm:text-2xl font-semibold tracking-tight mt-12 mb-4 flex items-center gap-3",
        className,
      )}
      id={id}
      {...props}
    >
      <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/40 rounded-full shrink-0" />
      <span>{children}</span>
      {id && (
        <HeadingAnchor
          id={id}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-muted-foreground text-lg"
        />
      )}
    </h3>
  ),

  h4: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string; id?: string }>) => (
    <h4
      className={cn(
        "scroll-m-24 text-lg sm:text-xl font-semibold text-foreground mt-10 mb-3",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  ),

  /* ── Code blocks ──────────────────────────────────────────────── */
  pre: MDXPre,

  code: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => {
    // If inside a <pre> (fenced code block), rehype-highlight adds language-* class
    const isBlock =
      className?.includes("hljs") || className?.includes("language-");
    if (isBlock) {
      return (
        <code className={cn(className, "text-sm")} {...props}>
          {children}
        </code>
      );
    }
    // Inline code
    return (
      <code
        className={cn(
          "relative rounded-md px-1.5 py-0.5 font-mono text-[0.85em]",
          "bg-primary/10 text-primary border border-primary/20",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },

  /* ── Paragraphs ───────────────────────────────────────────────── */
  p: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <p
      className={cn(
        "leading-7 text-muted-foreground [&:not(:first-child)]:mt-5",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),

  /* ── Links ────────────────────────────────────────────────────── */
  a: ({
    className,
    children,
    href,
    ...props
  }: PropsWithChildren<{ className?: string; href?: string }>) => (
    <a
      href={href}
      className={cn(
        "font-medium text-primary underline decoration-primary/30 underline-offset-4",
        "hover:decoration-primary transition-all duration-200",
        className,
      )}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  /* ── Lists ────────────────────────────────────────────────────── */
  ul: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <ul className={cn("my-6 space-y-2", className)} {...props}>
      {children}
    </ul>
  ),

  ol: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <ol
      className={cn("my-6 space-y-2 list-none counter-reset-list", className)}
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <li
      className={cn(
        "flex items-start gap-3 text-muted-foreground leading-7",
        className,
      )}
      {...props}
    >
      <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),

  /* ── Blockquote ───────────────────────────────────────────────── */
  blockquote: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <Card
      className={cn(
        "my-8 border-l-4 border-primary bg-primary/5 overflow-hidden",
        className,
      )}
    >
      <CardContent className="p-5">
        <blockquote
          className="text-muted-foreground italic [&>p]:mt-0 [&>p]:text-muted-foreground"
          {...props}
        >
          {children}
        </blockquote>
      </CardContent>
    </Card>
  ),

  /* ── Horizontal rule ──────────────────────────────────────────── */
  hr: () => (
    <Separator className="my-10 bg-gradient-to-r from-transparent via-border to-transparent" />
  ),

  /* ── Tables ───────────────────────────────────────────────────── */
  table: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <Card
      className={cn("my-8 overflow-hidden border border-border/50", className)}
    >
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" {...props}>
            {children}
          </table>
        </div>
      </CardContent>
    </Card>
  ),

  thead: ({ children, ...props }: PropsWithChildren) => (
    <thead className="bg-muted/50 border-b border-border" {...props}>
      {children}
    </thead>
  ),

  tbody: ({ children, ...props }: PropsWithChildren) => (
    <tbody className="divide-y divide-border/50" {...props}>
      {children}
    </tbody>
  ),

  tr: ({ children, ...props }: PropsWithChildren) => (
    <tr className="transition-colors hover:bg-muted/30" {...props}>
      {children}
    </tr>
  ),

  th: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <th
      className={cn(
        "px-3 sm:px-4 py-2.5 sm:py-3 text-left font-semibold text-foreground text-xs sm:text-sm whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  ),

  td: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <td
      className={cn(
        "px-3 sm:px-4 py-2.5 sm:py-3 text-left text-muted-foreground text-xs sm:text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  ),

  /* ── Images ───────────────────────────────────────────────────── */
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn(
        "rounded-xl border border-border/50 shadow-lg my-8 mx-auto",
        "transition-transform duration-300 hover:scale-[1.01]",
        className,
      )}
      alt={alt}
      loading="lazy"
      {...props}
    />
  ),

  /* ── Strong & Emphasis ────────────────────────────────────────── */
  strong: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <strong
      className={cn("font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </strong>
  ),

  em: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <em className={cn("italic text-muted-foreground/90", className)} {...props}>
      {children}
    </em>
  ),

  /* ── Custom components ────────────────────────────────────────── */
  Callout: ({
    children,
    type = "info",
  }: PropsWithChildren<{ type?: "info" | "warning" | "error" | "tip" }>) => {
    const styles = {
      info: "border-blue-500/50 bg-blue-500/5 [&>svg]:text-blue-500",
      warning: "border-amber-500/50 bg-amber-500/5 [&>svg]:text-amber-500",
      error: "border-red-500/50 bg-red-500/5 [&>svg]:text-red-500",
      tip: "border-emerald-500/50 bg-emerald-500/5 [&>svg]:text-emerald-500",
    };
    const icons = {
      info: "💡",
      warning: "⚠️",
      error: "🚨",
      tip: "✅",
    };
    return (
      <Card className={cn("my-8 border-l-4 overflow-hidden", styles[type])}>
        <CardContent className="p-5 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">{icons[type]}</span>
          <div className="flex-1 [&>p]:mt-0 [&>p]:text-sm">{children}</div>
        </CardContent>
      </Card>
    );
  },

  Step: ({
    className,
    children,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <div
      className={cn(
        "step relative ml-4 border-l-2 border-primary/30 pl-8 pb-8 [counter-increment:step]",
        "before:absolute before:left-[-13px] before:top-0 before:flex before:h-6 before:w-6",
        "before:items-center before:justify-center before:rounded-full before:bg-primary",
        "before:text-xs before:font-bold before:text-primary-foreground",
        "before:content-[counter(step)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),

  /* ── Diagrams ─────────────────────────────────────────────────── */
  Mermaid: MermaidDiagram,
  ArchDiagram,
  DiagramBox,
};

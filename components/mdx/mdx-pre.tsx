"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import {
  Children,
  isValidElement,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
} from "react";

/**
 * Enhanced <pre> wrapper for MDX code blocks.
 * Extracts language from the child <code> className and adds:
 * - macOS-style traffic-light dots
 * - Language badge
 * - Copy-to-clipboard button
 */
export function MDXPre({
  className,
  children,
  ...props
}: PropsWithChildren<{ className?: string }>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // Extract language from child <code> element className (e.g. "hljs language-typescript")
  const language = (() => {
    const child = Children.toArray(children)[0];
    if (isValidElement(child)) {
      const childProps = child.props as { className?: string };
      const match = childProps.className?.match(/language-(\w+)/);
      return match?.[1] ?? "";
    }
    return "";
  })();

  const langLabel =
    {
      typescript: "TypeScript",
      javascript: "JavaScript",
      tsx: "TSX",
      jsx: "JSX",
      python: "Python",
      bash: "Bash",
      sh: "Shell",
      css: "CSS",
      html: "HTML",
      json: "JSON",
      yaml: "YAML",
      yml: "YAML",
      sql: "SQL",
      graphql: "GraphQL",
      rust: "Rust",
      go: "Go",
      java: "Java",
      csharp: "C#",
      cpp: "C++",
      ruby: "Ruby",
      php: "PHP",
      swift: "Swift",
      kotlin: "Kotlin",
      dart: "Dart",
      markdown: "Markdown",
      xml: "XML",
      plaintext: "Text",
      text: "Text",
      prisma: "Prisma",
      dockerfile: "Dockerfile",
      nginx: "Nginx",
    }[language] ?? language.toUpperCase();

  const handleCopy = useCallback(async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-border/60 bg-[#1e1e2e] shadow-lg transition-shadow hover:shadow-xl max-w-full min-w-0">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.03]">
        <div className="flex items-center gap-3">
          {/* macOS dots */}
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          {langLabel && (
            <span className="text-xs font-medium text-muted-foreground/70 select-none">
              {langLabel}
            </span>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200",
            copied
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5",
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre
        ref={preRef}
        tabIndex={0}
        className={cn(
          "overflow-x-auto overflow-y-auto max-h-[80vh] p-4 text-sm leading-relaxed",
          "[&>code]:bg-transparent [&>code]:p-0 [&>code]:border-0",
          "[&>code]:block [&>code]:w-max [&>code]:min-w-full",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

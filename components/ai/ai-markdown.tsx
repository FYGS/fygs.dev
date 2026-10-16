"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ClipboardCopy, CornerDownLeft, Play, Replace } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { Children, createContext, isValidElement, useContext, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

const LANGUAGES: Record<string, unknown> = {
  bash, css, diff, go, java, javascript, json, jsx, markup, python, rust, sql, tsx, typescript, yaml,
};
for (const [name, grammar] of Object.entries(LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, grammar as never);
}

const ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  python3: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  html: "markup",
  xml: "markup",
  svg: "markup",
  yml: "yaml",
  rs: "rust",
  golang: "go",
  mjs: "javascript",
  cjs: "javascript",
};

/** Canonical language name for a fence tag ("TS" -> "typescript"). */
export function normalizeLanguage(tag: string | undefined): string {
  const lower = (tag ?? "").toLowerCase().trim();
  return ALIASES[lower] ?? lower;
}

export interface CodeActions {
  /** Actions are disabled while the answer is still streaming. */
  enabled: boolean;
  insert?: (code: string) => void;
  replace?: (code: string) => void;
  run?: (code: string) => void;
  /** Whether "Run" makes sense for a block in this (normalized) language. */
  canRun?: (language: string) => boolean;
}

const CodeActionsContext = createContext<CodeActions | null>(null);

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) return extractText((node.props as { children?: ReactNode }).children);
  return "";
}

function CodeBlock({ code, language, light }: { code: string; language: string; light: boolean }) {
  const t = useIntlayer("ai-assistant");
  const actions = useContext(CodeActionsContext);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: nothing sensible to do
    }
  };

  const enabled = actions?.enabled ?? false;
  const canRun = !!actions?.run && (actions.canRun?.(language) ?? true);
  const highlighted = language in LANGUAGES;

  return (
    <div
      className={cn(
        "not-prose my-2 overflow-hidden rounded-lg border text-xs",
        light ? "border-zinc-200 bg-zinc-50" : "border-white/10 bg-[#1e1e1e]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b px-2 py-1",
          light ? "border-zinc-200 bg-zinc-100" : "border-white/10 bg-[#252526]",
        )}
      >
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {language || "code"}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[11px]"
            onClick={copy}
            aria-label={`${t.code.copy.value}${copied ? ` (${t.code.copied.value})` : ""}`}
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <ClipboardCopy className="h-3 w-3" />}
            {copied ? t.code.copied.value : t.code.copy.value}
          </Button>
          {actions?.insert && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[11px]"
              disabled={!enabled}
              title={t.code.insertTitle.value}
              onClick={() => actions.insert?.(code)}
            >
              <CornerDownLeft className="h-3 w-3" />
              {t.code.insert.value}
            </Button>
          )}
          {actions?.replace && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[11px]"
              disabled={!enabled}
              title={t.code.replaceTitle.value}
              onClick={() => actions.replace?.(code)}
            >
              <Replace className="h-3 w-3" />
              {t.code.replace.value}
            </Button>
          )}
          {canRun && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[11px] text-green-500 hover:text-green-400"
              disabled={!enabled}
              title={t.code.runTitle.value}
              onClick={() => actions?.run?.(code)}
            >
              <Play className="h-3 w-3" />
              {t.code.run.value}
            </Button>
          )}
        </div>
      </div>
      {highlighted ? (
        <SyntaxHighlighter
          language={language}
          style={light ? vs : vscDarkPlus}
          PreTag="div"
          wrapLongLines
          customStyle={{ margin: 0, padding: "0.625rem 0.75rem", background: "transparent", fontSize: "0.75rem" }}
          codeTagProps={{ style: { fontFamily: "var(--font-mono, ui-monospace, monospace)" } }}
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-xs">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function buildComponents(light: boolean): Components {
  return {
    pre({ children }) {
      const child = Children.toArray(children)[0] as ReactElement<{ className?: string; children?: ReactNode }> | undefined;
      const className = isValidElement(child) ? (child.props.className ?? "") : "";
      const language = normalizeLanguage(/language-([\w+#-]+)/.exec(className)?.[1]);
      const code = extractText(isValidElement(child) ? child.props.children : children).replace(/\n$/, "");
      return <CodeBlock code={code} language={language} light={light} />;
    },
    code({ children, className }) {
      return (
        <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]", className)}>{children}</code>
      );
    },
    a({ href, children }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-2">
          {children}
        </a>
      );
    },
    p: ({ children }) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }) => <h3 className="mb-1 mt-3 text-base font-semibold">{children}</h3>,
    h2: ({ children }) => <h3 className="mb-1 mt-3 text-base font-semibold">{children}</h3>,
    h3: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-semibold">{children}</h4>,
    h4: ({ children }) => <h4 className="mb-1 mt-2 text-sm font-semibold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-2 border-primary/50 pl-3 text-muted-foreground">{children}</blockquote>
    ),
    hr: () => <hr className="my-3 border-border" />,
    table: ({ children }) => (
      <div className="my-2 overflow-x-auto">
        <table className="w-full border-collapse text-xs">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
  };
}

const COMPONENTS = { dark: buildComponents(false), light: buildComponents(true) } as const;

/**
 * Renders model output as Markdown. Raw HTML is never interpreted (no rehype-raw:
 * react-markdown escapes it) and unsafe URL schemes are dropped by react-markdown.
 */
export function AiMarkdown({
  content,
  actions,
  light = false,
}: {
  content: string;
  actions?: CodeActions;
  light?: boolean;
}) {
  return (
    <CodeActionsContext.Provider value={actions ?? null}>
      <div className="break-words text-sm [overflow-wrap:anywhere]">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={light ? COMPONENTS.light : COMPONENTS.dark}>
          {content}
        </ReactMarkdown>
      </div>
    </CodeActionsContext.Provider>
  );
}

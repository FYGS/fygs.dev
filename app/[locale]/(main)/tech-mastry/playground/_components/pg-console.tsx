"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Info,
  Sparkles,
  Terminal,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIntlayer } from "next-intlayer";
import { toast } from "sonner";
import type { ConsoleEntry } from "../_types";
import { usePlaygroundStore } from "../_stores/playground-store";

function ConsoleEntryRow({ entry }: { entry: ConsoleEntry }) {
  const [expanded, setExpanded] = useState(false);
  const aiText = useIntlayer("ai-assistant");
  const askAi = usePlaygroundStore((s) => s.askAi);

  const isMultiLine = entry.content.includes("\n");
  const isJson = entry.content.startsWith("{") || entry.content.startsWith("[");
  const isExpandable = isMultiLine || isJson;

  const icon = {
    log: <Terminal className="h-3 w-3 text-foreground/60" />,
    info: <Info className="h-3 w-3 text-blue-400" />,
    warn: <AlertTriangle className="h-3 w-3 text-yellow-400" />,
    error: <AlertCircle className="h-3 w-3 text-red-400" />,
    debug: <Terminal className="h-3 w-3 text-gray-400" />,
    clear: <Ban className="h-3 w-3 text-gray-400" />,
    result: <CheckCircle2 className="h-3 w-3 text-green-400" />,
  }[entry.type];

  const textColor = {
    log: "text-foreground/80",
    info: "text-blue-300",
    warn: "text-yellow-300",
    error: "text-red-300",
    debug: "text-gray-400",
    clear: "text-gray-400",
    result: "text-green-300",
  }[entry.type];

  let displayContent = entry.content;
  if (isJson && !expanded) {
    try {
      const parsed = JSON.parse(entry.content);
      displayContent = JSON.stringify(parsed);
      if (displayContent.length > 80) {
        displayContent = displayContent.slice(0, 80) + "...";
      }
    } catch {
      // Not valid JSON, show as-is
    }
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-2 px-3 py-1 text-xs font-mono border-b border-border/10 hover:bg-muted/30 transition-colors",
        entry.type === "error" && "bg-red-500/5",
      )}
    >
      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        {isExpandable ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded hover:bg-foreground/10 p-0.5"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {icon}
      </div>

      <pre
        className={cn(
          "flex-1 whitespace-pre-wrap break-all leading-relaxed min-w-0",
          textColor,
        )}
      >
        {expanded ? entry.content : displayContent}
      </pre>

      {entry.count && entry.count > 1 && (
        <span className="shrink-0 rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {entry.count}
        </span>
      )}

      {entry.type === "error" && (
        <button
          type="button"
          onClick={() => askAi("debug", aiText.explainError.prompt.value)}
          title={aiText.explainError.title.value}
          className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-primary opacity-0 transition-opacity hover:bg-primary/10 focus-visible:opacity-100 group-hover:opacity-100"
        >
          {aiText.explainError.button.value}
        </button>
      )}

      <span className="shrink-0 text-[10px] text-muted-foreground/50 pt-0.5 opacity-0 group-hover:opacity-100">
        {new Date(entry.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
}

export function PgConsole() {
  const consoleEntries = usePlaygroundStore((s) => s.consoleEntries);
  const clearConsole = usePlaygroundStore((s) => s.clearConsole);
  const status = usePlaygroundStore((s) => s.status);
  const askAi = usePlaygroundStore((s) => s.askAi);
  const aiText = useIntlayer("ai-assistant");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [consoleEntries.length]);

  const handleCopy = async () => {
    const text = consoleEntries
      .map((e) => `[${e.type.toUpperCase()}] ${e.content}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Console output copied");
  };

  const errorCount = consoleEntries.filter((e) => e.type === "error").length;
  const warnCount = consoleEntries.filter((e) => e.type === "warn").length;

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-border/20 px-3 py-1.5 bg-[#252526]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Console
            </span>
          </div>

          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-red-400">
              <AlertCircle className="h-3 w-3" />
              {errorCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              {warnCount}
            </span>
          )}

          {errorCount > 0 && status !== "running" && (
            <Button
              variant="ghost"
              size="sm"
              data-testid="pg-explain-error"
              className="h-5 gap-1 px-1.5 text-[10px] text-primary hover:text-primary"
              title={aiText.explainError.title.value}
              onClick={() => askAi("debug", aiText.explainError.prompt.value)}
            >
              <Sparkles className="h-3 w-3" />
              {aiText.explainError.button.value}
            </Button>
          )}

          {status === "running" && (
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Running...
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
            disabled={consoleEntries.length === 0}
            title="Copy output"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearConsole}
            disabled={consoleEntries.length === 0}
            title="Clear console"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Console Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted/30"
      >
        {consoleEntries.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground/50">
              <Terminal className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <p className="text-xs">Console output will appear here</p>
              <p className="mt-1 text-[10px]">Press Ctrl+Enter to run</p>
            </div>
          </div>
        ) : (
          consoleEntries.map((entry) => (
            <ConsoleEntryRow key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

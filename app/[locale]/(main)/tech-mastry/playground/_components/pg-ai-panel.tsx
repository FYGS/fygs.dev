"use client";

import { AiChat } from "@/components/ai/ai-chat";
import { useAiChat } from "@/components/ai/use-ai-chat";
import { useBackendMode } from "@/components/ai/use-backend-mode";
import { cn } from "@/lib/utils";
import { toAssistantLocale, type AssistantMode } from "@/lib/ai/schema";
import { useIntlayer, useLocale } from "next-intlayer";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePlaygroundStore } from "../_stores/playground-store";
import { buildPlaygroundContext } from "../_utils/ai-context";
import {
  focusEditor,
  getEditorSelection,
  insertAtCursor,
  replaceSelectionOrFile,
  type EditorSelectionInfo,
} from "../_utils/ai-editor";

const QUICK_MODES: AssistantMode[] = ["explain", "debug", "review", "optimize", "tests", "refactor", "hint"];

/** "tsx" and "typescript" run the same way: compare by family. */
function languageFamily(lang: string): string {
  const l = lang.toLowerCase();
  if (l === "ts" || l === "tsx" || l === "typescript") return "ts";
  if (l === "js" || l === "jsx" || l === "javascript") return "js";
  if (l === "py" || l === "python") return "py";
  if (l === "html" || l === "markup") return "html";
  return l;
}

const RUNNABLE = new Set(["ts", "js", "py", "html"]);

export function PgAiPanel() {
  const t = useIntlayer("ai-assistant");
  const { locale } = useLocale();

  const projectId = usePlaygroundStore((s) => s.projectId);
  const theme = usePlaygroundStore((s) => s.theme);
  const status = usePlaygroundStore((s) => s.status);
  const aiAsk = usePlaygroundStore((s) => s.aiAsk);
  const clearAiAsk = usePlaygroundStore((s) => s.clearAiAsk);
  const setAiPanelOpen = usePlaygroundStore((s) => s.setAiPanelOpen);
  const activeFile = usePlaygroundStore((s) => s.getActiveFile());
  const entryId = usePlaygroundStore((s) => s.files.find((f) => f.isEntryPoint)?.id);

  const light = theme === "vs-light";
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const chat = useAiChat({
    scopeKey: `playground:${projectId}`,
    surface: "playground",
    locale: toAssistantLocale(locale),
    getContext: buildPlaygroundContext,
  });
  const backend = useBackendMode(chat.messages, true);

  // What the assistant will see: shown so there are no surprises
  const [selection, setSelection] = useState<EditorSelectionInfo | null>(null);
  useEffect(() => {
    const timer = setInterval(() => {
      const next = getEditorSelection();
      setSelection((prev) =>
        prev?.startLine === next?.startLine && prev?.endLine === next?.endLine && prev?.text === next?.text
          ? prev
          : next,
      );
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // Ctrl+I, the command palette and the toolbar all end up here
  useEffect(() => {
    const focus = () => requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    focus();
    window.addEventListener("pg-focus-ai-assistant", focus);
    return () => window.removeEventListener("pg-focus-ai-assistant", focus);
  }, []);

  // A queued question (e.g. "Explain this error" in the console)
  const { send } = chat;
  const handledAsk = useRef<number | null>(null);
  useEffect(() => {
    if (!aiAsk || handledAsk.current === aiAsk.id) return;
    handledAsk.current = aiAsk.id;
    clearAiAsk();
    void send(aiAsk.prompt, { mode: aiAsk.mode as AssistantMode });
  }, [aiAsk, clearAiAsk, send]);

  const close = useCallback(() => {
    setAiPanelOpen(false);
    focusEditor();
  }, [setAiPanelOpen]);

  const codeActions = {
    insert: (code: string) => {
      if (insertAtCursor(code)) toast.success(t.code.inserted.value);
      else toast.error(t.code.noEditor.value);
    },
    replace: (code: string) => {
      const result = replaceSelectionOrFile(code);
      if (result === "replaced-selection") toast.success(t.code.replacedSelection.value);
      else if (result === "replaced-file") toast.success(t.code.replacedFile.value);
      else toast.error(t.code.noEditor.value);
    },
    run: (code: string) => {
      const state = usePlaygroundStore.getState();
      state.clearConsole();
      void state.executeCode({ snippet: code });
    },
    canRun: (language: string) => {
      if (!activeFile) return false;
      if (entryId && entryId !== activeFile.id) return false;
      const family = languageFamily(activeFile.language);
      if (!RUNNABLE.has(family)) return false;
      if (!language) return true;
      const block = languageFamily(language);
      // plain JavaScript is valid TypeScript
      return block === family || (block === "js" && family === "ts");
    },
  };

  const scope = (
    <span className="flex flex-wrap items-center gap-x-1.5">
      {activeFile ? (
        <>
          <span className="font-medium text-foreground/80">
            {selection
              ? `${t.scope.selection.value} ${selection.startLine}-${selection.endLine}`
              : `${t.scope.file.value} : ${activeFile.path}`}
          </span>
          {status === "error" && <span className="text-red-500">{t.scope.consoleError.value}</span>}
        </>
      ) : (
        t.scope.none.value
      )}
    </span>
  );

  return (
    <aside
      aria-label={t.title.value}
      data-testid="pg-ai-panel"
      className={cn(
        light ? "light" : "dark",
        "relative z-10 flex shrink-0 flex-col overflow-hidden border-l border-border bg-background text-foreground",
        "animate-in fade-in slide-in-from-right-4 duration-200",
        // Wide screens: docked next to the preview. Narrow: a bottom sheet.
        "md:w-[clamp(320px,26vw,400px)]",
        "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-50 max-md:h-[70vh] max-md:rounded-t-xl max-md:border-t max-md:shadow-2xl",
      )}
    >
      <AiChat
        chat={chat}
        variant="playground"
        backend={backend}
        quickModes={QUICK_MODES}
        highlightMode={status === "error" ? "debug" : undefined}
        scope={scope}
        codeActions={codeActions}
        light={light}
        onClose={close}
        onEscape={focusEditor}
        inputRef={inputRef}
        idPrefix="pg-ai"
        reserveCorner
      />
    </aside>
  );
}

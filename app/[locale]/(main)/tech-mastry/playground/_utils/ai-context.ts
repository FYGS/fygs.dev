import type { AssistantContext } from "@/lib/ai/schema";
import { AI_LIMITS } from "@/lib/ai/schema";
import { usePlaygroundStore } from "../_stores/playground-store";
import type { ConsoleEntry } from "../_types";
import { getEditorSelection } from "./ai-editor";

/** What the assistant gets to see of the playground. Capped here and again on the server. */

const OTHER_FILE_HEAD = 600;

export function formatConsole(entries: ConsoleEntry[]): string {
  const lines = entries
    .slice(-200)
    .filter((e) => e.type !== "info" && e.type !== "clear")
    .map((e) => {
      const prefix = e.type === "error" ? "[error] " : e.type === "warn" ? "[warn] " : "";
      return `${prefix}${e.content}${e.count && e.count > 1 ? ` (x${e.count})` : ""}`;
    });
  const text = lines.join("\n");
  return text.length > AI_LIMITS.maxConsoleChars ? text.slice(-AI_LIMITS.maxConsoleChars) : text;
}

export function buildPlaygroundContext(): AssistantContext {
  const state = usePlaygroundStore.getState();
  const active = state.getActiveFile();
  const selection = getEditorSelection();

  return {
    surface: "playground",
    // Code received through a link was written by someone else: the assistant is told to be suspicious of it
    origin: state.projectId === "shared" ? "shared-link" : "own",
    language: active?.language,
    activeFile: active
      ? { name: active.path, content: active.content.slice(0, AI_LIMITS.maxFileChars) }
      : undefined,
    selection: selection
      ? {
          text: selection.text.slice(0, AI_LIMITS.maxSelectionChars),
          startLine: selection.startLine,
          endLine: selection.endLine,
        }
      : undefined,
    otherFiles: state.files
      .filter((f) => f.id !== active?.id)
      .slice(0, AI_LIMITS.maxOtherFiles)
      .map((f) => ({ name: f.path, content: f.content.slice(0, OTHER_FILE_HEAD) })),
    console: {
      status: state.status,
      output: formatConsole(state.consoleEntries),
    },
  };
}

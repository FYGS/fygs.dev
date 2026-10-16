import { executeCode as execCode, type ExecuteCodeParams } from "@/app/_lib/code-execution";
import {
  isWebContainerSupported,
  killCurrentProcess,
  onWebContainerEvent,
} from "@/app/_lib/webcontainer-executor";
import type {
  ConsoleEntry,
  PlaygroundStore,
} from "../../_types";
import { runsInNode } from "../helpers";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** Code execution and console actions. */
export const createExecutionSlice = (
  set: PlaygroundSet,
  get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "executeCode"
  | "stopExecution"
  | "clearConsole"
  | "addConsoleEntry"
> => ({
  // ── Execution Actions ──
  executeCode: async (options) => {
    set({ status: "running" });

    const activeFile = get().getActiveFile();
    const lang = activeFile?.language ?? "typescript";

    // Show language-specific loading message
    if (lang === "python") {
      get().addConsoleEntry({
        type: "info",
        content: "Loading Python runtime (Pyodide)...",
      });
    } else if (isWebContainerSupported() && runsInNode(get().files, lang)) {
      get().addConsoleEntry({
        type: "info",
        content: "Running in WebContainer (real Node.js)...",
      });
    } else {
      get().addConsoleEntry({ type: "info", content: "Running..." });
    }

    try {
      const { files, activeFileId } = get();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      // Build files map
      const fileMap: Record<string, string> = {};
      let entryPoint = "";
      let packageJsonContent = "";

      files.forEach((file) => {
        fileMap[file.path] = file.content;
        if (file.isEntryPoint) entryPoint = file.path;
        if (file.name === "package.json") packageJsonContent = file.content;
      });

      if (!entryPoint && activeFileId) {
        const af = files.find((f) => f.id === activeFileId);
        if (af) entryPoint = af.path;
      }

      // Subscribe to WebContainer events for live output
      let unsubscribe: (() => void) | undefined;
      let streamedViaEvents = false;
      if (isWebContainerSupported()) {
        unsubscribe = onWebContainerEvent((event) => {
          if (event.type === "log" && event.message?.trim()) {
            streamedViaEvents = true;
            get().addConsoleEntry({ type: "log", content: event.message });
          } else if (event.type === "error" && event.message?.trim()) {
            streamedViaEvents = true;
            get().addConsoleEntry({
              type: "error",
              content: event.message,
            });
          } else if (event.type === "server-ready" && event.url) {
            set({ serverUrl: event.url });
            get().addConsoleEntry({
              type: "info",
              content: `🌐 Server ready at ${event.url}`,
            });
            set((state) => ({
              layout: { ...state.layout, activeOutputTab: "preview" },
            }));
          } else if (event.type === "status" && event.status) {
            set({ wcStatus: event.status });
          }
        });
      }

      const params: ExecuteCodeParams = {
        code: activeFile?.content ?? "",
        language: lang,
        signal: controller.signal,
        files: fileMap,
        entryPoint,
        packageJson: packageJsonContent || undefined,
        runScript: options?.runScript,
      };

      const result = await execCode(params);
      clearTimeout(timeoutId);

      // Unsubscribe from WebContainer events
      unsubscribe?.();

      // Add any remaining logs/errors not already streamed via events
      if (!streamedViaEvents) {
        if (result.output) {
          // Check if it's HTML preview output
          if (
            result.output.startsWith("data:text/html") ||
            result.output.includes("<!DOCTYPE html>")
          ) {
            set({ previewHtml: result.output });
            set((state) => ({
              layout: { ...state.layout, activeOutputTab: "preview" },
            }));
          } else {
            get().addConsoleEntry({
              type: "result",
              content: result.output,
            });
          }
        }

        result.logs.forEach((log) => {
          get().addConsoleEntry({ type: "log", content: log });
        });

        result.errors.forEach((err) => {
          get().addConsoleEntry({ type: "error", content: err });
        });
      } else {
        // WebContainer streamed results — only handle preview HTML & serverUrl
        if (result.serverUrl) {
          set({ serverUrl: result.serverUrl });
          set((state) => ({
            layout: { ...state.layout, activeOutputTab: "preview" },
          }));
        } else if (
          result.output &&
          (result.output.startsWith("data:text/html") ||
            result.output.includes("<!DOCTYPE html>"))
        ) {
          set({ previewHtml: result.output });
          set((state) => ({
            layout: { ...state.layout, activeOutputTab: "preview" },
          }));
        }
      }

      if (result.errors.length === 0) {
        get().addConsoleEntry({
          type: "info",
          content: "✅ Execution completed successfully",
        });
      }

      set({
        status: result.errors.length > 0 ? "error" : "success",
      });

      // Auto-create snapshot on successful execution
      if (result.errors.length === 0) {
        get().createSnapshot("Auto-save after execution");
      }
    } catch (error) {
      get().addConsoleEntry({
        type: "error",
        content:
          error instanceof Error ? error.message : "Execution failed",
      });
      set({ status: "error" });
    }
  },

  stopExecution: () => {
    killCurrentProcess();
    set({ status: "idle", serverUrl: null });
    get().addConsoleEntry({ type: "warn", content: "Execution stopped" });
  },

  clearConsole: () => {
    set({ consoleEntries: [], previewHtml: null, serverUrl: null });
  },

  addConsoleEntry: (entry) => {
    set((state) => {
      const newEntry: ConsoleEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      // Deduplicate consecutive identical messages
      const lastEntry =
        state.consoleEntries[state.consoleEntries.length - 1];
      if (
        lastEntry &&
        lastEntry.content === newEntry.content &&
        lastEntry.type === newEntry.type
      ) {
        const updated = [...state.consoleEntries];
        updated[updated.length - 1] = {
          ...lastEntry,
          count: (lastEntry.count || 1) + 1,
        };
        return { consoleEntries: updated };
      }

      // Limit console entries to prevent memory issues
      const entries = [...state.consoleEntries, newEntry];
      if (entries.length > 1000) {
        return { consoleEntries: entries.slice(-500) };
      }
      return { consoleEntries: entries };
    });
  },
});

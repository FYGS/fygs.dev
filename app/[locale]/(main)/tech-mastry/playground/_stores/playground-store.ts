import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  EditorHistory,
  OutputStatus,
  PlaygroundStore,
  WebContainerStatus,
} from "../_types";
import { defaultFiles, defaultLayout, defaultSettings } from "./defaults";
import { createFilesSlice } from "./slices/files";
import { createTabsSlice } from "./slices/tabs";
import { createEditorSlice } from "./slices/editor";
import { createHistorySlice } from "./slices/history";
import { createExecutionSlice } from "./slices/execution";
import { createWebContainerSlice } from "./slices/webcontainer";
import { createWorkspaceSlice } from "./slices/workspace";
import { createCompatSlice } from "./slices/compat";

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set, get) => ({
      // ── File System State ──
      files: defaultFiles,
      activeFileId: defaultFiles[0].id,
      openTabs: [
        { fileId: defaultFiles[0].id, isPinned: false, isPreview: false },
      ],

      // ── Editor State ──
      settings: defaultSettings,
      theme: "vs-dark",

      // ── Output State ──
      consoleEntries: [],
      previewHtml: null,
      serverUrl: null,
      status: "idle" as OutputStatus,
      wcStatus: "idle" as WebContainerStatus,

      // ── Layout State ──
      layout: defaultLayout,

      // ── History ──
      history: { snapshots: [], maxSnapshots: 50 } as EditorHistory,

      // ── Backward Compatibility ──
      get code() {
        const file = get().getActiveFile();
        return file?.content ?? "";
      },
      get language() {
        const file = get().getActiveFile();
        return file?.language ?? "typescript";
      },
      get output() {
        return get()
          .consoleEntries.filter((e) => e.type === "result")
          .map((e) => e.content)
          .join("\n");
      },
      get logs() {
        return get()
          .consoleEntries.filter(
            (e) => e.type !== "error" && e.type !== "result",
          )
          .map((e) => e.content);
      },
      get errors() {
        return get()
          .consoleEntries.filter((e) => e.type === "error")
          .map((e) => e.content);
      },

      ...createFilesSlice(set, get),
      ...createTabsSlice(set, get),
      ...createEditorSlice(set, get),
      ...createHistorySlice(set, get),
      ...createExecutionSlice(set, get),
      ...createWebContainerSlice(set, get),
      ...createWorkspaceSlice(set, get),
      ...createCompatSlice(set, get),
    }),
    {
      name: "playground-v2",
      partialize: (state) => ({
        files: state.files,
        activeFileId: state.activeFileId,
        openTabs: state.openTabs,
        settings: state.settings,
        theme: state.theme,
        layout: state.layout,
        history: state.history,
      }),
    },
  ),
);

// Re-export for backward compatibility
export const useEditorStore = usePlaygroundStore;

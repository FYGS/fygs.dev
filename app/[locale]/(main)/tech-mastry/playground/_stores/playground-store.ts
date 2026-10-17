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
import { withCompatFields } from "./compat-fields";

export const usePlaygroundStore = create<PlaygroundStore>()(
  withCompatFields(
  persist(
    (set, get) => ({
      // ── File System State ──
      files: defaultFiles,
      activeFileId: defaultFiles[0].id,
      projectId: "default",
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

      // ── AI assistant ──
      aiPanelOpen: false,
      aiAsk: null,
      setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
      askAi: (mode, prompt) =>
        set({ aiPanelOpen: true, aiAsk: { id: Date.now(), mode, prompt } }),
      clearAiAsk: () => set({ aiAsk: null }),

      // ── History ──
      history: { snapshots: [], maxSnapshots: 50 } as EditorHistory,

      // ── Backward Compatibility ──
      // Derived from the files and the console by withCompatFields on every update
      code: "",
      language: "typescript",
      output: "",
      logs: [],
      errors: [],

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
      // Saved state has never been restored at load: the old compatibility getters
      // threw while persist merged the stored state into the initial one (the error
      // is swallowed by the middleware), so the store always started from its
      // defaults. That behaviour is kept explicitly. Restoring the saved playground
      // means calling usePlaygroundStore.persist.rehydrate() after mount (a
      // synchronous hydration at import would mismatch the server markup).
      skipHydration: true,
      partialize: (state) => ({
        files: state.files,
        activeFileId: state.activeFileId,
        projectId: state.projectId,
        openTabs: state.openTabs,
        settings: state.settings,
        theme: state.theme,
        layout: state.layout,
        history: state.history,
      }),
    },
    ),
  ),
);

// Re-export for backward compatibility
export const useEditorStore = usePlaygroundStore;

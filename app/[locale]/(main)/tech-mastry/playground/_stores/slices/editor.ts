import type {
  PlaygroundStore,
} from "../../_types";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** Editor settings, formatting and layout actions. */
export const createEditorSlice = (
  set: PlaygroundSet,
  get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "setTheme"
  | "updateSettings"
  | "formatCode"
  | "setLayout"
  | "toggleFileExplorer"
  | "toggleConsole"
  | "togglePreview"
> => ({
  // ── Editor Actions ──
  setTheme: (theme) => set({ theme }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  formatCode: async () => {
    try {
      const { formatCode: formatMonaco } =
        await import("@/app/_lib/editor-utils");
      const { globalEditorRef } =
        await import("../../_components/pg-code-editor");

      if (!globalEditorRef.current) return;

      const success = await formatMonaco(globalEditorRef.current);
      if (success) {
        const formattedCode = globalEditorRef.current.getValue();
        const { activeFileId } = get();
        if (activeFileId) {
          get().updateFileContent(activeFileId, formattedCode);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("format-success"));
          }
        }
      }
    } catch (error) {
      console.error("Error formatting code:", error);
    }
  },

  // ── Layout Actions ──
  setLayout: (partial) => {
    set((state) => ({
      layout: { ...state.layout, ...partial },
    }));
  },

  toggleFileExplorer: () => {
    set((state) => ({
      layout: {
        ...state.layout,
        showFileExplorer: !state.layout.showFileExplorer,
      },
    }));
  },

  toggleConsole: () => {
    set((state) => ({
      layout: { ...state.layout, showConsole: !state.layout.showConsole },
    }));
  },

  togglePreview: () => {
    set((state) => ({
      layout: { ...state.layout, showPreview: !state.layout.showPreview },
    }));
  },
});

import type {
  EditorFile,
  PlaygroundStore,
} from "../../_types";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** Snapshot history actions. */
export const createHistorySlice = (
  set: PlaygroundSet,
  get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "createSnapshot"
  | "restoreSnapshot"
> => ({
  // ── History Actions ──
  createSnapshot: (label) => {
    set((state) => {
      const snapshot = {
        id: crypto.randomUUID(),
        files: state.files.map((f) => ({
          name: f.name,
          path: f.path,
          content: f.content,
          language: f.language,
        })),
        timestamp: Date.now(),
        label,
      };

      const snapshots = [...state.history.snapshots, snapshot];
      // Keep only the latest N snapshots
      const trimmed = snapshots.slice(-state.history.maxSnapshots);

      return { history: { ...state.history, snapshots: trimmed } };
    });
  },

  restoreSnapshot: (id) => {
    const { history } = get();
    const snapshot = history.snapshots.find((s) => s.id === id);
    if (!snapshot) return;

    const files: EditorFile[] = snapshot.files.map((f) => ({
      ...f,
      id: crypto.randomUUID(),
    }));

    set({
      files,
      activeFileId: files[0]?.id || null,
      openTabs:
        files.length > 0
          ? [{ fileId: files[0].id, isPinned: false, isPreview: false }]
          : [],
      consoleEntries: [],
      previewHtml: null,
      serverUrl: null,
      status: "idle",
    });
  },
});

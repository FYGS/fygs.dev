import type {
  PlaygroundStore,
} from "../../_types";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** Editor tab actions. */
export const createTabsSlice = (
  set: PlaygroundSet,
  _get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "openTab"
  | "closeTab"
  | "closeOtherTabs"
  | "closeAllTabs"
  | "pinTab"
  | "reorderTabs"
> => ({
  // ── Tab Actions ──
  openTab: (fileId, preview = false) => {
    set((state) => {
      const exists = state.openTabs.find((t) => t.fileId === fileId);
      if (exists) {
        // If it was a preview tab, make it permanent now
        if (exists.isPreview && !preview) {
          return {
            openTabs: state.openTabs.map((t) =>
              t.fileId === fileId ? { ...t, isPreview: false } : t,
            ),
          };
        }
        return state;
      }

      // Replace existing preview tab if opening as preview
      if (preview) {
        const withoutPreview = state.openTabs.filter((t) => !t.isPreview);
        return {
          openTabs: [
            ...withoutPreview,
            { fileId, isPinned: false, isPreview: true },
          ],
        };
      }

      return {
        openTabs: [
          ...state.openTabs,
          { fileId, isPinned: false, isPreview: false },
        ],
      };
    });
  },

  closeTab: (fileId) => {
    set((state) => {
      const idx = state.openTabs.findIndex((t) => t.fileId === fileId);
      if (idx === -1) return state;

      const updatedTabs = state.openTabs.filter((t) => t.fileId !== fileId);
      let newActiveId = state.activeFileId;

      if (state.activeFileId === fileId) {
        // Activate the next tab or previous
        const nextTab = updatedTabs[Math.min(idx, updatedTabs.length - 1)];
        newActiveId = nextTab?.fileId || null;
      }

      return { openTabs: updatedTabs, activeFileId: newActiveId };
    });
  },

  closeOtherTabs: (fileId) => {
    set((state) => ({
      openTabs: state.openTabs.filter(
        (t) => t.fileId === fileId || t.isPinned,
      ),
      activeFileId: fileId,
    }));
  },

  closeAllTabs: () => {
    set((state) => {
      const pinnedTabs = state.openTabs.filter((t) => t.isPinned);
      return {
        openTabs: pinnedTabs,
        activeFileId: pinnedTabs[0]?.fileId || null,
      };
    });
  },

  pinTab: (fileId) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.fileId === fileId
          ? { ...t, isPinned: !t.isPinned, isPreview: false }
          : t,
      ),
    }));
  },

  reorderTabs: (fromIndex, toIndex) => {
    set((state) => {
      const tabs = [...state.openTabs];
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { openTabs: tabs };
    });
  },
});

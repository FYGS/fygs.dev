import type {
  PlaygroundStore,
} from "../../_types";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** Backward-compatible methods (the getters stay in the store itself). */
export const createCompatSlice = (
  _set: PlaygroundSet,
  get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "setCode"
  | "setLanguage"
  | "addLog"
  | "addError"
  | "clearOutput"
  | "resetCode"
> => ({
  // ── Backward Compatibility Methods ──
  setCode: (code) => {
    const { activeFileId } = get();
    if (activeFileId) get().updateFileContent(activeFileId, code);
  },

  setLanguage: () => {
    // Language is determined by file extension - no-op for compatibility
  },

  addLog: (log) => get().addConsoleEntry({ type: "log", content: log }),

  addError: (error) =>
    get().addConsoleEntry({ type: "error", content: error }),

  clearOutput: () => get().clearConsole(),

  resetCode: () => get().resetPlayground(),
});

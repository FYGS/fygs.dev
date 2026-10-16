import type {
  PlaygroundStore,
} from "../../_types";
import { buildFileTree, detectLanguage } from "../helpers";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** Active-file accessors and file CRUD actions. */
export const createFilesSlice = (
  set: PlaygroundSet,
  get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "getActiveFile"
  | "getFileById"
  | "getFileByPath"
  | "getEntryPointFile"
  | "getFileTree"
  | "getCurrentLanguage"
  | "createFile"
  | "updateFileContent"
  | "renameFile"
  | "deleteFile"
  | "setActiveFile"
  | "setEntryPoint"
> => ({
  // ── Computed Accessors ──
  getActiveFile: () => {
    const { files, activeFileId } = get();
    return files.find((f) => f.id === activeFileId);
  },

  getFileById: (id) => get().files.find((f) => f.id === id),

  getFileByPath: (path) => get().files.find((f) => f.path === path),

  getEntryPointFile: () => {
    const { files } = get();
    return files.find((f) => f.isEntryPoint) || files[0];
  },

  getFileTree: () => buildFileTree(get().files),

  getCurrentLanguage: () => {
    const file = get().getActiveFile();
    return file?.language ?? "typescript";
  },

  // ── File Actions ──
  createFile: (path, content = "", language) => {
    const id = crypto.randomUUID();
    const name = path.split("/").pop() || path;
    const lang = language || detectLanguage(path);

    set((state) => {
      // Check for duplicate paths
      if (state.files.some((f) => f.path === path)) return state;
      return {
        files: [
          ...state.files,
          { id, name, path, content, language: lang },
        ],
      };
    });

    // Auto-open the file
    get().openTab(id);
    get().setActiveFile(id);

    return id;
  },

  updateFileContent: (id, content) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, content, isDirty: true } : f,
      ),
    }));
  },

  renameFile: (id, newPath) => {
    const newName = newPath.split("/").pop() || newPath;
    const newLang = detectLanguage(newPath);
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id
          ? { ...f, path: newPath, name: newName, language: newLang }
          : f,
      ),
    }));
  },

  deleteFile: (id) => {
    set((state) => {
      const updatedFiles = state.files.filter((f) => f.id !== id);
      if (updatedFiles.length === 0) return state; // Don't delete the last file

      const updatedTabs = state.openTabs.filter((t) => t.fileId !== id);
      let newActiveId = state.activeFileId;

      if (state.activeFileId === id) {
        newActiveId = updatedTabs[0]?.fileId || updatedFiles[0]?.id || null;
      }

      return {
        files: updatedFiles,
        openTabs: updatedTabs,
        activeFileId: newActiveId,
      };
    });
  },

  setActiveFile: (id) => {
    const file = get().files.find((f) => f.id === id);
    if (!file) return;
    set({ activeFileId: id });
    // Ensure the file has an open tab
    get().openTab(id);
  },

  setEntryPoint: (id) => {
    set((state) => ({
      files: state.files.map((f) => ({
        ...f,
        isEntryPoint: f.id === id,
      })),
    }));
  },
});

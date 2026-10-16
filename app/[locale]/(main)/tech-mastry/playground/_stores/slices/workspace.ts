import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type {
  EditorFile,
  PlaygroundStore,
} from "../../_types";
import { defaultFiles, defaultLayout } from "../defaults";
import { detectLanguage } from "../helpers";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** Template loading, reset and URL sharing actions. */
export const createWorkspaceSlice = (
  set: PlaygroundSet,
  get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "loadTemplate"
  | "resetPlayground"
  | "exportAsUrl"
  | "importFromUrl"
> => ({
  // ── Template Actions ──
  loadTemplate: (template) => {
    const files: EditorFile[] = template.files.map((f) => ({
      ...f,
      id: crypto.randomUUID(),
      isDirty: false,
    }));

    const mainFile =
      files.find((f) => f.path === template.mainFile) || files[0];

    set({
      projectId: template.id,
      files,
      activeFileId: mainFile?.id || null,
      openTabs: mainFile
        ? [{ fileId: mainFile.id, isPinned: false, isPreview: false }]
        : [],
      consoleEntries: [],
      previewHtml: null,
      serverUrl: null,
      status: "idle",
    });
  },

  resetPlayground: () => {
    const freshFiles = defaultFiles.map((f) => ({
      ...f,
      id: crypto.randomUUID(),
    }));

    set({
      projectId: "default",
      files: freshFiles,
      activeFileId: freshFiles[0].id,
      openTabs: [
        { fileId: freshFiles[0].id, isPinned: false, isPreview: false },
      ],
      consoleEntries: [],
      previewHtml: null,
      serverUrl: null,
      status: "idle",
      layout: defaultLayout,
    });
  },

  // ── Sharing Actions ──
  exportAsUrl: () => {
    const { files } = get();
    const payload = JSON.stringify(
      files.map((f) => ({
        p: f.path,
        c: f.content,
        e: f.isEntryPoint || false,
      })),
    );
    return compressToEncodedURIComponent(payload);
  },

  importFromUrl: (encoded) => {
    try {
      const decompressed = decompressFromEncodedURIComponent(encoded);
      if (!decompressed) return;

      const data = JSON.parse(decompressed) as Array<{
        p: string;
        c: string;
        e?: boolean;
      }>;

      const files: EditorFile[] = data.map((d) => ({
        id: crypto.randomUUID(),
        name: d.p.split("/").pop() || d.p,
        path: d.p,
        content: d.c,
        language: detectLanguage(d.p),
        isEntryPoint: d.e || false,
      }));

      if (files.length === 0) return;

      set({
        projectId: "shared",
        files,
        activeFileId: files[0].id,
        openTabs: [
          { fileId: files[0].id, isPinned: false, isPreview: false },
        ],
        consoleEntries: [],
        previewHtml: null,
        serverUrl: null,
        status: "idle",
      });
    } catch (error) {
      console.error("Failed to import from URL:", error);
    }
  },
});

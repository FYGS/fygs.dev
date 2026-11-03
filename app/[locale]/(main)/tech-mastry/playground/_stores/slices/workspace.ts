import { compressToEncodedURIComponent } from "lz-string";
import type {
  EditorFile,
  PlaygroundStore,
} from "../../_types";
import { SHARED_PROJECT_ERRORS, parseSharedProject } from "../../_utils/shared-project";
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
  | "dismissSharedNotice"
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
      sharedNotice: null,
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
      sharedNotice: null,
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
    // The link was made by someone else: validate everything, run nothing (the learner reads the code and decides)
    const parsed = parseSharedProject(encoded);
    if (!parsed.ok) {
      set({ sharedNotice: { kind: "invalid", message: SHARED_PROJECT_ERRORS[parsed.reason] } });
      return;
    }

    const files: EditorFile[] = parsed.files.map((d) => ({
      id: crypto.randomUUID(),
      name: d.path.split("/").pop() || d.path,
      path: d.path,
      content: d.content,
      language: detectLanguage(d.path),
      isEntryPoint: d.isEntryPoint,
    }));

    set({
      // "shared" marks code written by someone else: the assistant is told to be suspicious of it (ai-context.ts)
      projectId: "shared",
      files,
      activeFileId: files[0].id,
      openTabs: [{ fileId: files[0].id, isPinned: false, isPreview: false }],
      consoleEntries: [],
      previewHtml: null,
      serverUrl: null,
      status: "idle",
      sharedNotice: { kind: "review", files: files.length },
    });
  },

  dismissSharedNotice: () => set({ sharedNotice: null }),
});

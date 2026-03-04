import {
  executeCode as execCode,
  type ExecuteCodeParams,
} from "@/app/_lib/code-execution";
import {
  getWebContainer,
  isWebContainerSupported,
  killCurrentProcess,
  onWebContainerEvent,
  installDependencies as wcInstallDeps,
  mountFiles as wcMountFiles,
} from "@/app/_lib/webcontainer-executor";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ConsoleEntry,
  EditorFile,
  EditorHistory,
  EditorSettings,
  FileTreeNode,
  LayoutState,
  OutputStatus,
  PlaygroundStore,
  WebContainerStatus,
} from "../_types";

// ─── Utilities ───────────────────────────────────────────────────────────────

function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    json: "json",
    md: "markdown",
    py: "python",
    rs: "rust",
    go: "go",
    svg: "xml",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sh: "shell",
    bash: "shell",
    env: "plaintext",
    txt: "plaintext",
  };
  return langMap[ext] || "plaintext";
}

function buildFileTree(files: EditorFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const dirMap = new Map<string, FileTreeNode>();

  // Sort files so directories come first, then alphabetically
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const parts = file.path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (i === parts.length - 1) {
        // File node
        const fileNode: FileTreeNode = {
          name: part,
          path: currentPath,
          type: "file",
          fileId: file.id,
        };

        if (parentPath) {
          const parent = dirMap.get(parentPath);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(fileNode);
          }
        } else {
          root.push(fileNode);
        }
      } else if (!dirMap.has(currentPath)) {
        // Directory node
        const dirNode: FileTreeNode = {
          name: part,
          path: currentPath,
          type: "directory",
          children: [],
        };
        dirMap.set(currentPath, dirNode);

        if (parentPath) {
          const parent = dirMap.get(parentPath);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(dirNode);
          }
        } else {
          root.push(dirNode);
        }
      }
    }
  }

  // Sort children: directories first, then files, both alphabetically
  const sortChildren = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => {
      if (n.children) sortChildren(n.children);
    });
  };
  sortChildren(root);

  return root;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultSettings: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  minimap: false,
  wordWrap: "on",
  autoComplete: true,
  lineNumbers: "on",
  bracketPairColorization: true,
  formatOnSave: false,
  formatOnPaste: false,
  cursorBlinking: "smooth",
  cursorStyle: "line",
  renderWhitespace: "selection",
  smoothScrolling: true,
  stickyScroll: true,
};

const defaultLayout: LayoutState = {
  layout: "default",
  showFileExplorer: true,
  showConsole: true,
  showPreview: true,
  activeOutputTab: "console",
};

const defaultFiles: EditorFile[] = [
  {
    id: "default-ts",
    name: "index.ts",
    path: "index.ts",
    content: `// Welcome to FYGS Playground!
// Start coding in TypeScript here.

interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user: User = { name: "Developer", age: 25 };
console.log(greet(user));

// Try pressing Ctrl/Cmd + Enter to run your code!
`,
    language: "typescript",
    isEntryPoint: true,
  },
];

// ─── Store ───────────────────────────────────────────────────────────────────

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
            await import("../_components/pg-code-editor");

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
        } else if (isWebContainerSupported()) {
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
            timeout: 60000,
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

      // ── WebContainer Actions ──
      bootWebContainer: async () => {
        if (!isWebContainerSupported()) return;

        try {
          set({ wcStatus: "booting" });
          get().addConsoleEntry({
            type: "info",
            content: "Booting WebContainer (real Node.js runtime)...",
          });

          await getWebContainer();
          set({ wcStatus: "ready" });
          get().addConsoleEntry({
            type: "info",
            content: "✅ WebContainer ready — real Node.js environment active",
          });
        } catch (error) {
          set({ wcStatus: "error" });
          get().addConsoleEntry({
            type: "error",
            content: `WebContainer boot failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      },

      setServerUrl: (url) => set({ serverUrl: url }),

      setWcStatus: (status) => set({ wcStatus: status }),

      installPackages: async () => {
        if (!isWebContainerSupported()) {
          get().addConsoleEntry({
            type: "error",
            content: "WebContainer not available — cannot install packages",
          });
          return;
        }

        try {
          set({ wcStatus: "installing" });
          get().addConsoleEntry({
            type: "info",
            content: "Installing dependencies with npm...",
          });

          // Mount current files first
          const { files } = get();
          const fileMap: Record<string, string> = {};
          files.forEach((f) => {
            fileMap[f.path] = f.content;
          });
          await wcMountFiles(fileMap);

          // Subscribe to events for live streaming during install
          const unsubscribe = onWebContainerEvent((event) => {
            if (event.type === "log" && event.message?.trim()) {
              get().addConsoleEntry({ type: "log", content: event.message });
            } else if (event.type === "error" && event.message?.trim()) {
              get().addConsoleEntry({ type: "error", content: event.message });
            } else if (event.type === "status" && event.status) {
              set({ wcStatus: event.status });
            }
          });

          const result = await wcInstallDeps();
          unsubscribe();

          if (result.success) {
            set({ wcStatus: "ready" });
            get().addConsoleEntry({
              type: "info",
              content: "✅ Dependencies installed successfully",
            });
          } else {
            set({ wcStatus: "error" });
          }
        } catch (error) {
          set({ wcStatus: "error" });
          get().addConsoleEntry({
            type: "error",
            content: `Install failed: ${error instanceof Error ? error.message : String(error)}`,
          });
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

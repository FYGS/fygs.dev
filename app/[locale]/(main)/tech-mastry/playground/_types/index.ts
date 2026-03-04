// ─── File System Types ───────────────────────────────────────────────────────

export interface EditorFile {
  id: string;
  name: string;
  path: string; // Full path like "src/index.ts"
  content: string;
  language: string;
  isEntryPoint?: boolean;
  isDirty?: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
  fileId?: string; // Reference to EditorFile.id for file nodes
}

// ─── Editor Types ────────────────────────────────────────────────────────────

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  wordWrap: "on" | "off" | "wordWrapColumn" | "bounded";
  autoComplete: boolean;
  lineNumbers: "on" | "off" | "relative";
  bracketPairColorization: boolean;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  cursorBlinking: "blink" | "smooth" | "phase" | "expand" | "solid";
  cursorStyle:
    | "line"
    | "block"
    | "underline"
    | "line-thin"
    | "block-outline"
    | "underline-thin";
  renderWhitespace: "none" | "boundary" | "selection" | "trailing" | "all";
  smoothScrolling: boolean;
  stickyScroll: boolean;
}

export interface EditorTab {
  fileId: string;
  isPinned: boolean;
  isPreview: boolean; // Preview tabs get replaced when opening another file
}

// ─── Output Types ────────────────────────────────────────────────────────────

export type OutputStatus = "idle" | "running" | "error" | "success";

export type WebContainerStatus =
  | "idle"
  | "booting"
  | "ready"
  | "installing"
  | "running"
  | "error";

export interface ConsoleEntry {
  id: string;
  type: "log" | "warn" | "error" | "info" | "debug" | "clear" | "result";
  content: string;
  timestamp: number;
  count?: number; // For repeated messages
}

export interface OutputState {
  consoleEntries: ConsoleEntry[];
  previewHtml: string | null;
  serverUrl: string | null;
  status: OutputStatus;
  wcStatus: WebContainerStatus;
}

// ─── History Types ───────────────────────────────────────────────────────────

export interface CodeSnapshot {
  id: string;
  files: Pick<EditorFile, "name" | "path" | "content" | "language">[];
  timestamp: number;
  label?: string;
}

export interface EditorHistory {
  snapshots: CodeSnapshot[];
  maxSnapshots: number;
}

// ─── Template Types ──────────────────────────────────────────────────────────

export type TemplateCategory =
  | "language"
  | "frontend"
  | "backend"
  | "fullstack";

export interface PlaygroundTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: TemplateCategory;
  files: Omit<EditorFile, "id" | "isDirty">[];
  mainFile: string; // Path to the main/entry file
  tags: string[];
}

// ─── Layout Types ────────────────────────────────────────────────────────────

export type PanelLayout =
  | "default"
  | "preview-right"
  | "preview-bottom"
  | "editor-only"
  | "preview-only";

export interface LayoutState {
  layout: PanelLayout;
  showFileExplorer: boolean;
  showConsole: boolean;
  showPreview: boolean;
  activeOutputTab: "console" | "preview" | "problems";
}

// ─── Store Interface ─────────────────────────────────────────────────────────

export interface PlaygroundStore {
  // ── File System ──
  files: EditorFile[];
  activeFileId: string | null;
  openTabs: EditorTab[];

  // ── Editor State ──
  settings: EditorSettings;
  theme: string;

  // ── Output State ──
  consoleEntries: ConsoleEntry[];
  previewHtml: string | null;
  serverUrl: string | null;
  status: OutputStatus;
  wcStatus: WebContainerStatus;

  // ── Layout State ──
  layout: LayoutState;

  // ── History ──
  history: EditorHistory;

  // ── Computed ──
  getActiveFile: () => EditorFile | undefined;
  getFileById: (id: string) => EditorFile | undefined;
  getFileByPath: (path: string) => EditorFile | undefined;
  getEntryPointFile: () => EditorFile | undefined;
  getFileTree: () => FileTreeNode[];
  getCurrentLanguage: () => string;

  // ── File Actions ──
  createFile: (path: string, content?: string, language?: string) => string;
  updateFileContent: (id: string, content: string) => void;
  renameFile: (id: string, newPath: string) => void;
  deleteFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  setEntryPoint: (id: string) => void;

  // ── Tab Actions ──
  openTab: (fileId: string, preview?: boolean) => void;
  closeTab: (fileId: string) => void;
  closeOtherTabs: (fileId: string) => void;
  closeAllTabs: () => void;
  pinTab: (fileId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;

  // ── Editor Actions ──
  setTheme: (theme: string) => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  formatCode: () => void;

  // ── Execution Actions ──
  executeCode: (options?: { runScript?: string }) => Promise<void>;
  stopExecution: () => void;
  clearConsole: () => void;
  addConsoleEntry: (entry: Omit<ConsoleEntry, "id" | "timestamp">) => void;

  // ── WebContainer Actions ──
  bootWebContainer: () => Promise<void>;
  setServerUrl: (url: string | null) => void;
  setWcStatus: (status: WebContainerStatus) => void;
  installPackages: () => Promise<void>;

  // ── Layout Actions ──
  setLayout: (layout: Partial<LayoutState>) => void;
  toggleFileExplorer: () => void;
  toggleConsole: () => void;
  togglePreview: () => void;

  // ── History Actions ──
  createSnapshot: (label?: string) => void;
  restoreSnapshot: (id: string) => void;

  // ── Template Actions ──
  loadTemplate: (template: PlaygroundTemplate) => void;
  resetPlayground: () => void;

  // ── Sharing Actions ──
  exportAsUrl: () => string;
  importFromUrl: (encoded: string) => void;

  // ── Backward Compatibility ──
  code: string;
  language: string;
  output: string;
  logs: string[];
  errors: string[];
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  addLog: (log: string) => void;
  addError: (error: string) => void;
  clearOutput: () => void;
  resetCode: () => void;
}

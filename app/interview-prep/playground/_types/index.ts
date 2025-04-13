export interface EditorProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  theme?: string;
  onChange?: (value: string) => void;
}

export interface OutputState {
  output: string;
  logs: string[];
  errors: string[];
  status: "idle" | "running" | "error" | "success";
}

export interface CodeFile {
  id: string;
  name: string;
  code: string;
  language: string;
  isEntryPoint?: boolean;
}

export interface CodeSnapshot {
  id: string;
  code: string;
  timestamp: number;
  language: string;
  files?: CodeFile[];
}

export interface EditorHistory {
  snapshots: CodeSnapshot[];
  currentIndex: number;
}

export interface EditorSettings {
  fontSize: number;
  minimap: boolean;
  wordWrap: boolean;
  autoComplete: boolean;
}

export interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
  isEntryPoint?: boolean;
}

export interface EditorStore extends OutputState {
  code: string;
  language: string;
  theme: string;
  files: EditorFile[];
  activeFileId: string | null;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  resetCode: () => void;
  executeCode: (options?: { runScript?: string }) => Promise<void>;
  clearOutput: () => void;
  addLog: (log: string) => void;
  addError: (error: string) => void;
  history: EditorHistory;
  createSnapshot: () => void;
  restoreSnapshot: (id: string) => void;
  formatCode: () => void;
  settings: EditorSettings;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  // File operations
  addFile: (
    name: string,
    content: string,
    language: string,
    isEntryPoint?: boolean
  ) => string;
  updateFile: (id: string, updates: Partial<Omit<EditorFile, "id">>) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  getFileById: (id: string) => EditorFile | undefined;
  getFileByName: (name: string) => EditorFile | undefined;
  getEntryPointFile: () => EditorFile | undefined;
  setEntryPoint: (id: string) => void;
  getPackageJson: () => string | null;
  updatePackageJson: (content: string) => void;
  loadTemplate: (
    files: Omit<EditorFile, "id">[],
    activeFileName: string
  ) => void;
}

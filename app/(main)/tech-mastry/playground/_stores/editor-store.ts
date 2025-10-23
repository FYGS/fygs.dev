import { executeCode, type ExecuteCodeParams } from "@/app/_lib/code-execution";
import { languageDefaults } from "@/app/(main)/tech-mastry/playground/_config/languages";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EditorFile, EditorStore } from "../_types";

type LanguageDefaults = typeof languageDefaults;
type LanguageKey = keyof Omit<LanguageDefaults, "defaultLanguage">;

function getDefaultCode(language: string) {
  if (
    language in languageDefaults &&
    language !== "defaultLanguage" &&
    typeof languageDefaults[language as LanguageKey] === "object" &&
    "code" in languageDefaults[language as LanguageKey]
  ) {
    return (languageDefaults[language as LanguageKey] as { code: string }).code;
  }
  return "";
}

interface CodeSnapshot {
  id: string;
  code: string;
  timestamp: number;
  language: string;
}

interface EditorSettings {
  fontSize: number;
  minimap: boolean;
  wordWrap: boolean;
  autoComplete: boolean;
}

const defaultSettings: EditorSettings = {
  fontSize: 14,
  minimap: true,
  wordWrap: true,
  autoComplete: true,
};

// Create a default file
const defaultFile: EditorFile = {
  id: crypto.randomUUID(),
  name: "index.ts",
  content: getDefaultCode("typescript"),
  language: "typescript",
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // Maintain backward compatibility with single file mode
      code: defaultFile.content,
      language: defaultFile.language,
      theme: "vs-dark",

      // Multi-file support
      files: [defaultFile],
      activeFileId: defaultFile.id,

      // Output state
      output: "",
      logs: [],
      errors: [],
      status: "idle",

      // History
      history: {
        snapshots: [],
        currentIndex: -1,
      },

      // Settings
      settings: defaultSettings,

      // Basic actions
      setCode: (code) => {
        const { activeFileId } = get();

        // Update the active file content
        if (activeFileId) {
          set((state) => ({
            code,
            files: state.files.map((file) =>
              file.id === activeFileId ? { ...file, content: code } : file
            ),
          }));
        } else {
          // Fallback to just updating the code field
          set({ code });
        }
      },

      setLanguage: (language) => {
        const { activeFileId } = get();

        // Update the active file language
        if (activeFileId) {
          set((state) => ({
            language,
            files: state.files.map((file) =>
              file.id === activeFileId ? { ...file, language } : file
            ),
          }));
        } else {
          // Fallback to just updating the language field
          set({ language });
        }
      },

      setTheme: (theme) => set({ theme }),

      resetCode: () => {
        const defaultLang = languageDefaults.defaultLanguage;
        const defaultContent = getDefaultCode(defaultLang);

        const newFile: EditorFile = {
          id: crypto.randomUUID(),
          name: `index.${defaultLang === "typescript" ? "ts" : "js"}`,
          content: defaultContent,
          language: defaultLang,
        };

        set({
          code: defaultContent,
          language: defaultLang,
          files: [newFile],
          activeFileId: newFile.id,
          output: "",
          logs: [],
          errors: [],
          status: "idle",
        });
      },

      clearOutput: () =>
        set({
          output: "",
          logs: [],
          errors: [],
          status: "idle",
        }),

      addLog: (log: string) =>
        set((state) => ({
          logs: [...state.logs, log],
        })),

      addError: (error: string) =>
        set((state) => ({
          errors: [...state.errors, error],
        })),

      createSnapshot: () => {
        const { code, language } = get();
        const snapshot: CodeSnapshot = {
          id: crypto.randomUUID(),
          code,
          language,
          timestamp: Date.now(),
        };
        set((state) => ({
          history: {
            snapshots: [...state.history.snapshots, snapshot],
            currentIndex: state.history.snapshots.length,
          },
        }));
      },

      restoreSnapshot: (id: string) => {
        const { snapshots } = get().history;
        const snapshot = snapshots.find((s) => s.id === id);
        if (snapshot) {
          set({ code: snapshot.code, language: snapshot.language });
        }
      },

      executeCode: async (options?: { runScript?: string }) => {
        set({ status: "running" });
        try {
          // First clear any previous output
          set({
            output: "",
            logs: ["Starting code execution..."],
            errors: [],
          });

          const { code, language, files, activeFileId } = get();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          // Prepare files for execution
          const fileMap: Record<string, string> = {};
          let entryPoint = "";
          let packageJsonContent = "";

          // Add all files to the file map
          files.forEach((file) => {
            fileMap[file.name] = file.content;
            if (file.isEntryPoint) {
              entryPoint = file.name;
            }
            if (file.name === "package.json") {
              packageJsonContent = file.content;
            }
          });

          // If no entry point is set, use the active file
          if (!entryPoint && activeFileId) {
            const activeFile = files.find((f) => f.id === activeFileId);
            if (activeFile) {
              entryPoint = activeFile.name;
            }
          }

          const params: ExecuteCodeParams = {
            code,
            language,
            signal: controller.signal,
            timeout: 30000,
            files: fileMap,
            entryPoint,
            packageJson: packageJsonContent || undefined,
            runScript: options?.runScript,
          };

          // Add a log to show what's being executed
          set((state) => ({
            logs: [
              ...state.logs,
              `Executing ${
                options?.runScript
                  ? `script '${options.runScript}'`
                  : `${language} code`
              }...`,
            ],
          }));

          const result = await executeCode(params);

          clearTimeout(timeoutId);

          // Process the result
          const finalOutput = result.output;
          const finalLogs = [
            ...get().logs, // Keep existing logs
            ...result.logs.map((log) =>
              log.startsWith("Executing") ? `✓ ${log}` : log
            ), // Add execution logs
          ];

          // Add a success message if there are no errors
          if (result.errors.length === 0) {
            finalLogs.push("✅ Execution completed successfully");
          }

          set({
            output: finalOutput,
            logs: finalLogs,
            errors: result.errors,
            status: result.errors.length ? "error" : "success",
          });

          // Auto-create snapshot on successful execution
          get().createSnapshot();
        } catch (error) {
          set({
            errors: [
              error instanceof Error ? error.message : "Execution failed",
            ],
            status: "error",
            logs: [...get().logs, "❌ Execution failed with an error"],
          });
        }
      },

      formatCode: async () => {
        try {
          // Import the formatCode function and the editor instance
          const { formatCode } = await import("@/app/_lib/editor-utils");
          const { globalEditorInstance } = await import(
            "../_components/code-editor"
          );

          // Check if we have an editor instance
          if (!globalEditorInstance) {
            console.error("No editor instance available for formatting");
            return;
          }

          // Format the code using Monaco's formatter
          const success = await formatCode(globalEditorInstance);

          if (success) {
            // Update the code in the store with the formatted code
            const formattedCode = globalEditorInstance.getValue();
            get().setCode(formattedCode);

            // Update the active file with the formatted code
            const { activeFileId } = get();
            if (activeFileId) {
              const files = get().files.map((file) =>
                file.id === activeFileId
                  ? { ...file, content: formattedCode }
                  : file
              );
              set({ files });

              // Trigger the format success animation
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("format-success"));
              }
            }
          }
        } catch (error) {
          console.error("Error formatting code:", error);
        }
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // File operations - implementation moved to the File management methods section

      // updateFile method moved to the File management methods section

      // removeFile method moved to the File management methods section

      // setActiveFile method moved to the File management methods section

      // File management methods
      addFile: (name, content, language, isEntryPoint = false) => {
        const id = crypto.randomUUID();
        set((state) => {
          // Check if a file with the same name already exists
          const existingFile = state.files.find((f) => f.name === name);
          if (existingFile) {
            return state; // Don't add duplicate file names
          }

          // If this is set as entry point, clear other entry points
          let updatedFiles = [...state.files];
          if (isEntryPoint) {
            updatedFiles = updatedFiles.map((f) => ({
              ...f,
              isEntryPoint: false,
            }));
          }

          return {
            files: [
              ...updatedFiles,
              { id, name, content, language, isEntryPoint },
            ],
          };
        });
        return id;
      },

      updateFile: (id, updates) => {
        set((state) => {
          const fileIndex = state.files.findIndex((f) => f.id === id);
          if (fileIndex === -1) return state;

          const updatedFiles = [...state.files];
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            ...updates,
          };

          // If this is the active file, update code and language
          const isActiveFile = state.activeFileId === id;
          if (isActiveFile) {
            return {
              files: updatedFiles,
              code:
                updates.content !== undefined ? updates.content : state.code,
              language:
                updates.language !== undefined
                  ? updates.language
                  : state.language,
            };
          }

          return { files: updatedFiles };
        });
      },

      removeFile: (id) => {
        set((state) => {
          const fileIndex = state.files.findIndex((f) => f.id === id);
          if (fileIndex === -1) return state;

          const updatedFiles = state.files.filter((f) => f.id !== id);

          // If we're removing the active file, set a new active file
          if (state.activeFileId === id) {
            const newActiveFile = updatedFiles[0] || null;
            return {
              files: updatedFiles,
              activeFileId: newActiveFile?.id || null,
              code: newActiveFile?.content || "",
              language: newActiveFile?.language || "javascript",
            };
          }

          return { files: updatedFiles };
        });
      },

      setActiveFile: (id) => {
        set((state) => {
          const file = state.files.find((f) => f.id === id);
          if (!file) return state;

          return {
            activeFileId: id,
            code: file.content,
            language: file.language,
          };
        });
      },

      getFileById: (id) => {
        const { files } = get();
        return files.find((f) => f.id === id);
      },

      getFileByName: (name) => {
        const { files } = get();
        return files.find((f) => f.name === name);
      },

      getEntryPointFile: () => {
        const { files } = get();
        return files.find((f) => f.isEntryPoint) || files[0];
      },

      setEntryPoint: (id) => {
        set((state) => {
          const updatedFiles = state.files.map((f) => ({
            ...f,
            isEntryPoint: f.id === id,
          }));

          return { files: updatedFiles };
        });
      },

      getPackageJson: () => {
        const { files } = get();
        const packageJsonFile = files.find((f) => f.name === "package.json");
        return packageJsonFile?.content || null;
      },

      updatePackageJson: (content) => {
        const { files } = get();
        const packageJsonFile = files.find((f) => f.name === "package.json");

        if (packageJsonFile) {
          // Update existing package.json
          get().updateFile(packageJsonFile.id, { content });
        } else {
          // Create new package.json
          get().addFile("package.json", content, "json");
        }
      },

      loadTemplate: (templateFiles, activeFileName) => {
        if (!templateFiles.length) return;

        const files: EditorFile[] = templateFiles.map((file) => ({
          ...file,
          id: crypto.randomUUID(),
        }));

        const activeFile =
          files.find((f) => f.name === activeFileName) || files[0];

        set({
          files,
          activeFileId: activeFile.id,
          code: activeFile.content,
          language: activeFile.language,
          // Reset output
          output: "",
          logs: [],
          errors: [],
          status: "idle",
        });
      },
    }),
    {
      name: "editor-storage",
      partialize: (state) => ({
        code: state.code,
        language: state.language,
        theme: state.theme,
        files: state.files,
        activeFileId: state.activeFileId,
        history: state.history,
        settings: state.settings,
      }),
    }
  )
);

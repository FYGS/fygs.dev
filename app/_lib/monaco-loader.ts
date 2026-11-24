// This file provides a custom loader for Monaco Editor with proper web worker support

import { platformConfig } from "../_config/platform-config";

// Define the worker base path
const WORKER_BASE = "/_next/static/monaco";

// Define the Monaco environment interface
interface MonacoEnvironment {
  getWorkerUrl: (moduleId: string, label: string) => string;
}

// Extend the Window interface to include Monaco environment
interface MonacoWindow extends Window {
  MonacoEnvironment: MonacoEnvironment;
}

// Define the worker paths for different languages
const workers: Record<string, string> = {
  typescript: `${WORKER_BASE}/ts.worker.js`,
  javascript: `${WORKER_BASE}/ts.worker.js`, // TypeScript worker handles JavaScript too
  html: `${WORKER_BASE}/html.worker.js`,
  css: `${WORKER_BASE}/css.worker.js`,
  json: `${WORKER_BASE}/json.worker.js`,
  default: `${WORKER_BASE}/editor.worker.js`,
};

// Configure Monaco environment for web workers
export function configureMonacoWorkers(): void {
  if (typeof window === "undefined") return;

  // Only configure workers if enabled in platform config
  if (platformConfig.features.playground.worker) {
    (window as unknown as MonacoWindow).MonacoEnvironment = {
      getWorkerUrl: (_moduleId: string, label: string): string => {
        return workers[label] || workers.default;
      },
    };
  }
}

// Load Monaco editor with proper worker configuration
export async function loadMonaco() {
  // SSR protection
  if (typeof window === "undefined") {
    return null;
  }

  // Configure workers before importing Monaco
  configureMonacoWorkers();

  try {
    // Dynamically import Monaco editor
    const monaco = await import("monaco-editor");

    // Configure TypeScript/JavaScript intellisense
    if (monaco.typescript) {
      monaco.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution:
          monaco.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ["node_modules/@types"],
        jsx: monaco.typescript.JsxEmit.React,
        jsxFactory: "React.createElement",
        jsxFragmentFactory: "React.Fragment",
      });

      // Enable eager model sync for better intellisense across files
      monaco.typescript.javascriptDefaults.setEagerModelSync(true);
      monaco.typescript.typescriptDefaults.setEagerModelSync(true);
    }

    // The stock dark theme writes comments in #6A9955, 4.2:1 on its #1e1e1e background (WCAG 1.4.3 asks 4.5:1)
    monaco.editor.defineTheme("vs-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [{ token: "comment", foreground: "7CA668" }],
      colors: {},
    });

    return monaco;
  } catch (error) {
    console.error("Failed to load Monaco Editor:", error);
    return null; // Return null instead of throwing to prevent crashes
  }
}

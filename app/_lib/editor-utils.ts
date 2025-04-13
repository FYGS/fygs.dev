// Use dynamic import for monaco-editor to avoid SSR issues
import type * as Monaco from "monaco-editor";
import { loadMonaco } from "./monaco-loader";
let editor: typeof Monaco.editor | null = null;

// Initialize editor module on client side only
if (typeof window !== "undefined") {
  import("monaco-editor").then((monaco) => {
    editor = monaco.editor;
  });
}

export async function initializeMonaco() {
  if (typeof window === "undefined") return null;

  try {
    // Use our custom Monaco loader with proper worker configuration
    const monaco = await loadMonaco();
    return monaco;
  } catch (error) {
    console.error("Error initializing Monaco Editor:", error);
    return null;
  }
}

export function createEditorInstance(
  container: HTMLElement,
  options: Monaco.editor.IStandaloneEditorConstructionOptions
) {
  // SSR protection
  if (typeof window === "undefined" || !editor) {
    throw new Error("Cannot create editor instance on server side");
  }

  // Create the editor instance with automatic layout enabled
  const editorInstance = editor.create(container, {
    ...options,
    automaticLayout: true,
  });

  // Add window resize listener to ensure proper layout
  window.addEventListener("resize", () => {
    editorInstance.layout();
  });

  return editorInstance;
}

export async function setLanguage(
  editorInstance: Monaco.editor.IStandaloneCodeEditor,
  language: string
) {
  // SSR protection
  if (typeof window === "undefined" || !editor) return;

  const model = editorInstance.getModel();
  if (model) {
    editor.setModelLanguage(model, language);
  }
}

export function disposeEditor(
  editorInstance: Monaco.editor.IStandaloneCodeEditor
) {
  // SSR protection
  if (typeof window === "undefined") return;

  if (editorInstance) {
    editorInstance.dispose();
  }
}

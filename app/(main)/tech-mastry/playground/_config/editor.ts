import { editor } from "monaco-editor";
import { platformConfig } from "@/app/_config/platform-config";

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  contextmenu: true,
  fontFamily: "monospace",
  fontSize: platformConfig.features.playground.monaco.layout.fontSize,
  lineHeight: 1.5,
  minimap: platformConfig.features.playground.monaco.layout.minimap,
  scrollBeyondLastLine: false,
  tabSize: 2,
  wordWrap: "on",
};

export const editorFeatures = {
  ...platformConfig.features.playground.monaco.features,
  diagnostics: true,
  codeActions: true,
  inlineSuggestions: true,
} as const;

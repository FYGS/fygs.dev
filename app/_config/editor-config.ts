import { editor } from "monaco-editor";
import { platformConfig } from "./platform-config";

export const monacoConfig: editor.IStandaloneEditorConstructionOptions = {
  // Existing config
  ...platformConfig.features.playground.monaco,

  // Enhanced features
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true,
  },
  parameterHints: {
    enabled: true,
  },
  codeLens: true,
  // Lightbulb option removed due to type incompatibility
  bracketPairColorization: {
    enabled: true,
    independentColorPoolPerBracketType: true,
  },
  guides: {
    bracketPairs: true,
    indentation: true,
    highlightActiveIndentation: true,
    bracketPairsHorizontal: true,
  },
  folding: true,
  showFoldingControls: "always",
  unfoldOnClickAfterEndOfLine: true,
  links: true,
  minimap: {
    enabled: true,
    scale: 2,
    showSlider: "mouseover",
    renderCharacters: false,
  },
  // Automatic layout for resizing
  automaticLayout: true,
  suggest: {
    preview: true,
    showMethods: true,
    showFunctions: true,
    showConstructors: true,
    showFields: true,
    showVariables: true,
    showClasses: true,
    showStructs: true,
    showInterfaces: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showEnumMembers: true,
    showKeywords: true,
    showWords: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showTypeParameters: true,
    showSnippets: true,
  },
};

export const editorDefaults = {
  typescript: {
    code: 'console.log("Hello World!");',
    language: "typescript",
  },
  javascript: {
    code: 'console.log("Hello World!");',
    language: "javascript",
  },
  html: {
    code: "<div>Hello World!</div>",
    language: "html",
  },
  css: {
    code: "body { margin: 0; }",
    language: "css",
  },
  // Add more language defaults as needed
} as const;

import type { EditorFile, EditorSettings, LayoutState } from "../_types";

export const defaultSettings: EditorSettings = {
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

export const defaultLayout: LayoutState = {
  layout: "default",
  showFileExplorer: true,
  showConsole: true,
  showPreview: true,
  activeOutputTab: "console",
};

export const defaultFiles: EditorFile[] = [
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

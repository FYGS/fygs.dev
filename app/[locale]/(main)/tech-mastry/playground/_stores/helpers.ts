import type { EditorFile, FileTreeNode } from "../_types";

export function detectLanguage(filePath: string): string {
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

export function buildFileTree(files: EditorFile[]): FileTreeNode[] {
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


/**
 * Whether a run goes through Node.js in the WebContainer. HTML pages, React
 * components and Python render in the preview or Pyodide instead, so the
 * "Running in WebContainer" notice would be wrong for them.
 */
export function runsInNode(
  files: { name: string; language?: string }[],
  language: string,
): boolean {
  const names = files.map((f) => f.name.toLowerCase());
  if (names.includes("package.json")) return true;
  if (names.some((n) => n.endsWith(".html") || n.endsWith(".htm"))) return false;
  if (names.some((n) => n.endsWith(".jsx") || n.endsWith(".tsx"))) return false;
  if (names.some((n) => n.endsWith(".py"))) return false;
  return ["javascript", "typescript", "js", "ts"].includes(language);
}

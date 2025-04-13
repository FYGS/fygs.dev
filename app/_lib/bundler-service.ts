/**
 * Bundler Service for the Playground
 *
 * This module provides bundling capabilities for the playground.
 * It handles:
 *
 * 1. Bundling modules with dependencies
 * 2. Resolving imports and exports
 * 3. Transforming code for browser compatibility
 * 4. Supporting different module formats (ESM, CommonJS)
 */

import {
  generateHtmlWithImportMap,
  generateImportMap,
  parsePackageJson,
} from "./package-manager";
import { transpileTypeScript } from "./typescript-transpiler";

// File types that need processing
export enum FileType {
  JAVASCRIPT = "javascript",
  TYPESCRIPT = "typescript",
  JSX = "jsx",
  TSX = "tsx",
  HTML = "html",
  CSS = "css",
  JSON = "json",
  OTHER = "other",
}

// File entry with metadata
export interface FileEntry {
  name: string;
  content: string;
  type: FileType;
}

// Bundler options
export interface BundlerOptions {
  entryPoint: string;
  minify?: boolean;
  sourceMaps?: boolean;
  target?:
    | "es2015"
    | "es2016"
    | "es2017"
    | "es2018"
    | "es2019"
    | "es2020"
    | "esnext";
}

// Bundler result
export interface BundlerResult {
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
  files?: Record<string, string>;
}

/**
 * Determine file type based on file name
 */
function getFileType(fileName: string): FileType {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  switch (extension) {
    case "js":
      return FileType.JAVASCRIPT;
    case "ts":
      return FileType.TYPESCRIPT;
    case "jsx":
      return FileType.JSX;
    case "tsx":
      return FileType.TSX;
    case "html":
      return FileType.HTML;
    case "css":
      return FileType.CSS;
    case "json":
      return FileType.JSON;
    default:
      return FileType.OTHER;
  }
}

/**
 * Process a single file based on its type
 */
async function processFile(
  file: FileEntry
): Promise<{ content: string; logs: string[]; errors: string[] }> {
  const logs: string[] = [];
  const errors: string[] = [];

  try {
    switch (file.type) {
      case FileType.TYPESCRIPT:
      case FileType.TSX:
        logs.push(`Transpiling TypeScript file: ${file.name}`);
        const transpiledCode = transpileTypeScript(file.content);
        return { content: transpiledCode, logs, errors };

      case FileType.JSX:
        logs.push(`Processing JSX file: ${file.name}`);
        // Simple JSX transformation (in a real implementation, use Babel or similar)
        // This is a placeholder for demonstration
        return { content: file.content, logs, errors };

      case FileType.JSON:
        logs.push(`Processing JSON file: ${file.name}`);
        // Validate JSON
        try {
          JSON.parse(file.content);
          return { content: file.content, logs, errors };
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          errors.push(`Invalid JSON in ${file.name}: ${errorMessage}`);
          return { content: file.content, logs, errors };
        }

      default:
        // For other file types, return as is
        return { content: file.content, logs, errors };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error processing file ${file.name}: ${errorMessage}`);
    return { content: file.content, logs, errors };
  }
}

/**
 * Find dependencies in a file
 * Note: This function is currently not used but kept for future enhancements
 */
/*
function findDependencies(file: FileEntry): string[] {
  const dependencies: string[] = [];

  // Simple regex-based dependency detection
  // In a real implementation, use an AST parser for more accurate results
  const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^'"]+)['"]/g;
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match;

  // Find ES module imports
  while ((match = importRegex.exec(file.content)) !== null) {
    dependencies.push(match[1]);
  }

  // Find CommonJS requires
  while ((match = requireRegex.exec(file.content)) !== null) {
    dependencies.push(match[1]);
  }

  return dependencies;
}
*/

/**
 * Create a dependency graph for the files
 * Note: This function is currently not used but kept for future enhancements
 */
/*
function createDependencyGraph(files: FileEntry[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  files.forEach((file) => {
    const dependencies = findDependencies(file);
    graph.set(file.name, dependencies);
  });

  return graph;
}
*/

/**
 * Bundle files for the browser
 */
export async function bundleFiles(
  files: Record<string, string>,
  options: BundlerOptions
): Promise<BundlerResult> {
  const logs: string[] = [];
  const errors: string[] = [];
  const processedFiles: Record<string, string> = {};

  logs.push(
    `Starting bundling process with entry point: ${options.entryPoint}`
  );

  try {
    // Convert files to FileEntry objects
    const fileEntries: FileEntry[] = Object.entries(files).map(
      ([name, content]) => ({
        name,
        content,
        type: getFileType(name),
      })
    );

    // Find package.json
    const packageJsonEntry = fileEntries.find(
      (file) =>
        file.name === "package.json" || file.name.endsWith("/package.json")
    );

    let packageJson = null;
    if (packageJsonEntry) {
      packageJson = parsePackageJson(packageJsonEntry.content);
      if (packageJson) {
        logs.push("Found valid package.json");
      } else {
        errors.push("Invalid package.json format");
      }
    } else {
      logs.push(
        "No package.json found, proceeding without dependency resolution"
      );
    }

    // Process each file
    for (const file of fileEntries) {
      logs.push(`Processing file: ${file.name}`);
      const {
        content,
        logs: fileLogs,
        errors: fileErrors,
      } = await processFile(file);

      // Add logs and errors
      logs.push(...fileLogs);
      errors.push(...fileErrors);

      // Store processed content
      processedFiles[file.name] = content;
    }

    // Find the entry point
    const entryFile = fileEntries.find(
      (file) => file.name === options.entryPoint
    );
    if (!entryFile) {
      errors.push(`Entry point not found: ${options.entryPoint}`);
      return { success: false, output: "", logs, errors };
    }

    // Find or create index.html
    const indexHtml = fileEntries.find(
      (file) => file.name === "index.html" || file.name.endsWith("/index.html")
    );

    let htmlContent = "";
    if (indexHtml) {
      htmlContent = processedFiles[indexHtml.name];
    } else {
      // Create a basic index.html
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Playground App</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 0; padding: 0; }
            #root { min-height: 100vh; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="./${options.entryPoint}"></script>
        </body>
        </html>
      `;
      processedFiles["index.html"] = htmlContent;
    }

    // Generate import map if package.json exists
    if (packageJson) {
      try {
        // Make sure dependencies exist
        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.peerDependencies,
          ...packageJson.devDependencies,
        };

        if (dependencies && Object.keys(dependencies).length > 0) {
          logs.push(
            `Generating import map for ${
              Object.keys(dependencies).length
            } dependencies`
          );
          const importMap = generateImportMap(dependencies);
          htmlContent = generateHtmlWithImportMap(htmlContent, importMap);

          // Update the index.html in processed files
          processedFiles["index.html"] = htmlContent;
        } else {
          logs.push("No dependencies found in package.json");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push(`Error generating import map: ${errorMessage}`);
        logs.push("Proceeding without import map");
      }
    }

    logs.push("Bundling completed successfully");
    return {
      success: true,
      output: htmlContent,
      logs,
      errors,
      files: processedFiles,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Bundling error: ${errorMessage}`);
    return { success: false, output: "", logs, errors };
  }
}

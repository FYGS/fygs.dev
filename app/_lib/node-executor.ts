/**
 * Node.js Executor for the Playground
 *
 * This module provides Node.js execution capabilities for the playground.
 * It simulates a Node.js environment in the browser by:
 *
 * 1. Resolving module imports
 * 2. Handling require/import statements
 * 3. Supporting CommonJS and ESM modules
 * 4. Providing Node.js-like globals
 */

import { transpileTypeScript } from "./typescript-transpiler";

// File system simulation
interface VirtualFile {
  content: string;
  isDirectory: boolean;
}

interface NodeExecutorOptions {
  cwd?: string;
  timeout?: number;
  args?: string[];
  env?: Record<string, string>;
}

interface NodeExecutorResult {
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
  exitCode: number;
}

// Virtual file system for simulating Node.js fs module
class VirtualFileSystem {
  private files: Record<string, VirtualFile> = {};

  constructor(initialFiles: Record<string, string> = {}) {
    // Initialize with provided files
    Object.entries(initialFiles).forEach(([path, content]) => {
      this.writeFile(path, content);
    });
  }

  // Normalize path (basic implementation)
  private normalizePath(path: string): string {
    // Remove leading ./ if present
    path = path.replace(/^\.\//, "");

    // Handle relative paths
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    // Remove trailing slash
    path = path.replace(/\/$/, "");

    return path;
  }

  // Write a file to the virtual file system
  writeFile(path: string, content: string): void {
    const normalizedPath = this.normalizePath(path);

    // Create directories if needed
    const parts = normalizedPath.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i]) {
        currentPath += "/" + parts[i];
        if (!this.files[currentPath]) {
          this.files[currentPath] = {
            content: "",
            isDirectory: true,
          };
        }
      }
    }

    this.files[normalizedPath] = {
      content,
      isDirectory: false,
    };
  }

  // Read a file from the virtual file system
  readFile(path: string): string {
    const normalizedPath = this.normalizePath(path);

    if (!this.files[normalizedPath]) {
      throw new Error(`File not found: ${path}`);
    }

    if (this.files[normalizedPath].isDirectory) {
      throw new Error(`Cannot read directory as file: ${path}`);
    }

    return this.files[normalizedPath].content;
  }

  // Check if a file exists
  exists(path: string): boolean {
    const normalizedPath = this.normalizePath(path);
    return !!this.files[normalizedPath];
  }

  // List files in a directory
  readdir(path: string): string[] {
    const normalizedPath = this.normalizePath(path);

    if (
      !this.files[normalizedPath] ||
      !this.files[normalizedPath].isDirectory
    ) {
      throw new Error(`Directory not found: ${path}`);
    }

    const result: string[] = [];
    const prefix = normalizedPath === "/" ? "/" : normalizedPath + "/";

    Object.keys(this.files).forEach((filePath) => {
      if (filePath !== normalizedPath && filePath.startsWith(prefix)) {
        const relativePath = filePath.slice(prefix.length);
        if (!relativePath.includes("/")) {
          result.push(relativePath);
        }
      }
    });

    return result;
  }

  // Debug: List all files in the virtual file system
  listAllFiles(): Record<string, string> {
    const result: Record<string, string> = {};

    Object.entries(this.files).forEach(([path, file]) => {
      if (!file.isDirectory) {
        result[path] = file.content;
      }
    });

    return result;
  }
}

// Module resolver for handling require/import
class ModuleResolver {
  private fs: VirtualFileSystem;
  private cache: Record<string, unknown> = {};
  private processedFiles: Set<string> = new Set();
  private logs: string[] = [];
  private errors: string[] = [];

  constructor(fs: VirtualFileSystem) {
    this.fs = fs;
  }

  // Resolve a module path
  private resolvePath(request: string, parent?: string): string {
    // Handle built-in modules
    if (this.isBuiltinModule(request)) {
      return request;
    }

    // Fix for paths starting with // (double slash)
    if (request.startsWith("//")) {
      // For paths like //greeting, treat them as bare module names
      const bareName = request.substring(2);
      this.logs.push(`Treating //greeting as bare module name: ${bareName}`);

      // First try to find the module in the root directory
      try {
        return this.resolveExtension("/" + bareName);
      } catch {
        // If not found in root, try as a bare module name
        try {
          return this.resolveExtension(bareName);
        } catch {
          // If still not found, try in the same directory as parent
          if (parent) {
            const parentDir = parent.split("/").slice(0, -1).join("/") || "/";
            return this.resolveExtension(parentDir + bareName);
          }
          throw new Error(`Cannot resolve module: ${request}`);
        }
      }
    }

    // Handle absolute and relative paths
    if (
      request.startsWith("./") ||
      request.startsWith("../") ||
      request.startsWith("/")
    ) {
      if (!parent) {
        throw new Error(
          `Cannot resolve relative path ${request} without parent`
        );
      }

      const parentDir = parent.split("/").slice(0, -1).join("/") || "/";
      let resolvedPath = request.startsWith("/")
        ? request
        : parentDir + request;

      // Normalize path
      resolvedPath = resolvedPath.replace(/\/\.\//g, "/");

      // Handle ../ paths
      while (resolvedPath.includes("/../")) {
        resolvedPath = resolvedPath.replace(/\/[^\/]+\/\.\.\//g, "/");
      }

      return this.resolveExtension(resolvedPath);
    }

    // Handle bare module names (like 'greeting')
    try {
      // First try to resolve as a file in the root directory
      return this.resolveExtension("/" + request);
    } catch {
      // If not found in root, try in the same directory as parent
      if (parent) {
        const parentDir = parent.split("/").slice(0, -1).join("/") || "/";
        return this.resolveExtension(parentDir + request);
      }
      throw new Error(`Cannot resolve module: ${request}`);
    }
  }

  // Check if a module is built-in
  private isBuiltinModule(request: string): boolean {
    const builtins = [
      "fs",
      "path",
      "os",
      "util",
      "events",
      "stream",
      "buffer",
      "crypto",
      "http",
      "https",
      "url",
      "querystring",
      "zlib",
    ];

    return builtins.includes(request);
  }

  // Resolve file extension
  private resolveExtension(path: string): string {
    // If path has extension, check if it exists
    if (/\.\w+$/.test(path) && this.fs.exists(path)) {
      return path;
    }

    // Try adding extensions
    const extensions = [".js", ".json", ".ts", ".tsx", ".jsx"];

    for (const ext of extensions) {
      const pathWithExt = path + ext;
      if (this.fs.exists(pathWithExt)) {
        return pathWithExt;
      }
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = path + "/index" + ext;
      if (this.fs.exists(indexPath)) {
        return indexPath;
      }
    }

    // Log all available files for debugging
    const allFiles = Object.keys(this.fs.listAllFiles());
    this.logs.push(`Available files: ${allFiles.join(", ")}`);

    throw new Error(`Cannot resolve module: ${path}`);
  }

  // Require a module
  require(request: string, parent?: string): unknown {
    try {
      // Log the require call for debugging
      this.logs.push(`Requiring module: ${request} from ${parent || "root"}`);

      const resolvedPath = this.resolvePath(request, parent);
      this.logs.push(`Resolved to: ${resolvedPath}`);

      // Return from cache if available
      if (this.cache[resolvedPath]) {
        this.logs.push(`Using cached module: ${resolvedPath}`);
        return this.cache[resolvedPath];
      }

      // Handle built-in modules
      if (this.isBuiltinModule(resolvedPath)) {
        return this.mockBuiltinModule(resolvedPath);
      }

      // Read file content
      const content = this.fs.readFile(resolvedPath);

      // Handle JSON files
      if (resolvedPath.endsWith(".json")) {
        const result = JSON.parse(content);
        this.cache[resolvedPath] = result;
        return result;
      }

      // Handle TypeScript files
      if (resolvedPath.endsWith(".ts") || resolvedPath.endsWith(".tsx")) {
        const transpiledContent = transpileTypeScript(content);
        return this.executeModule(transpiledContent, resolvedPath);
      }

      // Handle JavaScript files
      return this.executeModule(content, resolvedPath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.errors.push(`Error requiring module ${request}: ${errorMessage}`);
      throw error;
    }
  }

  // Execute a module
  private executeModule(code: string, path: string): unknown {
    // Avoid circular dependencies
    if (this.processedFiles.has(path)) {
      return this.cache[path] || {};
    }

    this.processedFiles.add(path);

    // Create module object
    // Using a different name to avoid Next.js warning about assigning to 'module'
    const mod = {
      exports: {},
      id: path,
      filename: path,
      loaded: false,
      parent: null,
      children: [],
      paths: [],
    };

    // Create require function for this module
    const requireFn = (request: string) => this.require(request, path);
    requireFn.resolve = (request: string) => this.resolvePath(request, path);
    requireFn.cache = this.cache;

    try {
      // Execute the module code
      const wrappedCode = `
        (function(module, exports, require, __filename, __dirname) {
          ${code}
        })(mod, mod.exports, require, "${path}", "${path
        .split("/")
        .slice(0, -1)
        .join("/")}");
      `;

      // Execute the code
      const fn = new Function("mod", "require", wrappedCode);
      fn(mod, requireFn);

      // Mark as loaded
      mod.loaded = true;

      // Cache the result
      this.cache[path] = mod.exports;

      return mod.exports;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.errors.push(`Error executing module ${path}: ${errorMessage}`);
      throw error;
    }
  }

  // Mock built-in modules
  private mockBuiltinModule(name: string): unknown {
    switch (name) {
      case "fs":
        return {
          readFileSync: (path: string) => {
            try {
              return this.fs.readFile(path);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              this.errors.push(`fs.readFileSync error: ${errorMessage}`);
              throw error;
            }
          },
          writeFileSync: (path: string, content: string) => {
            try {
              this.fs.writeFile(path, content);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              this.errors.push(`fs.writeFileSync error: ${errorMessage}`);
              throw error;
            }
          },
          existsSync: (path: string) => {
            return this.fs.exists(path);
          },
          readdirSync: (path: string) => {
            try {
              return this.fs.readdir(path);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              this.errors.push(`fs.readdirSync error: ${errorMessage}`);
              throw error;
            }
          },
        };

      case "path":
        return {
          join: (...parts: string[]) => parts.join("/").replace(/\/+/g, "/"),
          resolve: (...parts: string[]) => {
            let result = parts.join("/").replace(/\/+/g, "/");
            if (!result.startsWith("/")) {
              result = "/" + result;
            }
            return result;
          },
          dirname: (path: string) => {
            return path.split("/").slice(0, -1).join("/") || "/";
          },
          basename: (path: string, ext?: string) => {
            let base = path.split("/").pop() || "";
            if (ext && base.endsWith(ext)) {
              base = base.slice(0, -ext.length);
            }
            return base;
          },
          extname: (path: string) => {
            const match = path.match(/\.\w+$/);
            return match ? match[0] : "";
          },
        };

      default:
        this.logs.push(
          `Warning: Mock for built-in module '${name}' not implemented`
        );
        return {};
    }
  }

  // Get logs and errors
  getLogs(): string[] {
    return this.logs;
  }

  getErrors(): string[] {
    return this.errors;
  }
}

/**
 * Execute Node.js code in a simulated environment
 */
export async function executeNodeJs(
  files: Record<string, string>,
  entryPoint: string,
  options: NodeExecutorOptions = {}
): Promise<NodeExecutorResult> {
  const logs: string[] = [];
  const errors: string[] = [];
  const output = "";

  // Create virtual file system
  const fs = new VirtualFileSystem(files);

  // Create module resolver
  const resolver = new ModuleResolver(fs);

  // Save original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  try {
    // Override console methods to capture output
    console.log = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(" ");
      logs.push(message);
      originalConsole.log(...args);
    };

    console.error = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(" ");
      errors.push(message);
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(" ");
      logs.push(`[WARN] ${message}`);
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(" ");
      logs.push(`[INFO] ${message}`);
      originalConsole.info(...args);
    };

    // Set up process object
    const process = {
      env: {
        NODE_ENV: "development",
        ...options.env,
      },
      argv: ["node", entryPoint, ...(options.args || [])],
      cwd: () => options.cwd || "/",
      exit: (code: number) => {
        throw new Error(`Process exited with code ${code}`);
      },
    };

    // Set global variables
    (global as Record<string, unknown>).process = process;

    // Log all available files for debugging
    const allFiles = Object.keys(fs.listAllFiles());
    logs.push(`Available files: ${allFiles.join(", ")}`);

    // Execute the entry point
    logs.push(`Executing ${entryPoint}...`);
    const result = resolver.require(entryPoint);

    // If the result is a promise, wait for it
    if (result instanceof Promise) {
      await result;
    }

    // Add resolver logs and errors
    logs.push(...resolver.getLogs());
    errors.push(...resolver.getErrors());

    return {
      success: true,
      output: typeof result !== "undefined" ? String(result) : "",
      logs,
      errors,
      exitCode: 0,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Execution error: ${errorMessage}`);

    return {
      success: false,
      output,
      logs,
      errors,
      exitCode: 1,
    };
  } finally {
    // Restore console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;

    // Clean up global variables
    delete (global as Record<string, unknown>).process;
  }
}

/**
 * TypeScript / JSX / TSX Transpiler
 *
 * Uses Sucrase for fast, reliable transpilation of:
 * - TypeScript → JavaScript
 * - JSX → JavaScript (React.createElement)
 * - TSX → JavaScript (TypeScript + JSX)
 *
 * Sucrase is 20x faster than Babel and handles all common TS/JSX patterns.
 */

import { transform, type Transform } from "sucrase";

export interface TypeScriptCompilerOptions {
  target?: string;
  module?: string;
  jsx?: "react" | "react-jsx" | "preserve";
  transforms?: Transform[];
  jsxRuntime?: "classic" | "automatic";
  [key: string]: unknown;
}

/**
 * Detect which Sucrase transforms to apply based on file extension / language.
 */
function detectTransforms(
  language: string,
  options?: TypeScriptCompilerOptions,
): Transform[] {
  if (options?.transforms) return options.transforms;

  switch (language.toLowerCase()) {
    case "typescript":
    case "ts":
      return ["typescript"];
    case "tsx":
      return ["typescript", "jsx"];
    case "jsx":
      return ["jsx"];
    default:
      return ["typescript"];
  }
}

/**
 * Transpile TypeScript / JSX / TSX code to plain JavaScript.
 */
export function transpileTypeScript(
  code: string,
  options?: TypeScriptCompilerOptions,
): string {
  if (!code || code.trim() === "") return "";

  try {
    const transforms = detectTransforms(
      options?.jsx === "react" ? "tsx" : "typescript",
      options,
    );

    const result = transform(code, {
      transforms,
      jsxRuntime: options?.jsxRuntime ?? "classic",
      production: false,
      disableESTransforms: true, // Keep modern JS as-is (browser supports it)
    });

    return result.code;
  } catch (error) {
    // Provide a helpful error message rather than silently failing
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Transpilation error:", msg);
    return `// Transpilation error: ${msg.replace(/\n/g, "\n// ")}\nthrow new Error(${JSON.stringify("Transpilation failed: " + msg)});`;
  }
}

/**
 * Transpile a file based on its extension.
 */
export function transpileFile(
  code: string,
  filePath: string,
  options?: TypeScriptCompilerOptions,
): string {
  if (!code || code.trim() === "") return "";

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const transforms: Transform[] = [];

  switch (ext) {
    case "ts":
      transforms.push("typescript");
      break;
    case "tsx":
      transforms.push("typescript", "jsx");
      break;
    case "jsx":
      transforms.push("jsx");
      break;
    case "js":
      // Plain JS — no transforms needed
      return code;
    default:
      return code;
  }

  try {
    const result = transform(code, {
      transforms,
      jsxRuntime: options?.jsxRuntime ?? "classic",
      production: false,
      disableESTransforms: true,
      filePath,
    });
    return result.code;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Transpilation error in ${filePath}:`, msg);
    return `// Transpilation error in ${filePath}: ${msg.replace(/\n/g, "\n// ")}\nthrow new Error(${JSON.stringify("Transpilation failed: " + msg)});`;
  }
}

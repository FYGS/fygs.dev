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
  /** Also convert ES module import/export to require/exports. */
  commonjs?: boolean;
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
 * A syntax error found while transpiling, with the location when Sucrase gave one.
 * Lets callers show "index.ts:3:7 - Unexpected token" instead of running broken code.
 */
export class TranspileError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly detail: string,
    public readonly line: number | null,
    public readonly column: number | null,
  ) {
    super(
      `${filePath}${line !== null ? `:${line}${column !== null ? `:${column}` : ""}` : ""} - ${detail}`,
    );
    this.name = "TranspileError";
  }
}

/** Sucrase reports errors as "Error transforming x.ts: Unexpected token (1:7)". */
function toTranspileError(filePath: string, error: unknown): TranspileError {
  const raw = error instanceof Error ? error.message : String(error);
  const location = raw.match(/\((\d+):(\d+)\)\s*$/);
  const detail = raw
    .replace(/^Error transforming [^:]*:\s*/, "")
    .replace(/\s*\(\d+:\d+\)\s*$/, "")
    .trim();
  return new TranspileError(
    filePath,
    detail || raw,
    location ? Number(location[1]) : null,
    location ? Number(location[2]) : null,
  );
}

/**
 * Like transpileFile, but throws a TranspileError on a syntax error instead of
 * returning code that throws when executed.
 */
export function transpileFileStrict(
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
    case "mjs":
      // Plain JS only needs work when ES modules must become CommonJS
      if (!options?.commonjs) return code;
      break;
    default:
      return code;
  }
  if (options?.commonjs) transforms.push("imports");

  try {
    return transform(code, {
      transforms,
      jsxRuntime: options?.jsxRuntime ?? "classic",
      production: false,
      disableESTransforms: true,
      filePath,
    }).code;
  } catch (error) {
    throw toTranspileError(filePath, error);
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

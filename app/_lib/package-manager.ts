/**
 * Package Manager for the Playground
 *
 * This module provides package management capabilities
 * for the playground. It provides functionality to:
 *
 * 1. Parse and validate package.json files
 * 2. Resolve dependencies using a CDN (esm.sh, unpkg, etc.)
 * 3. Execute scripts defined in package.json
 * 4. Handle different build tools and bundlers
 */

import { z } from "zod";
import { transpileTypeScript } from "./typescript-transpiler";

// Schema for package.json
export const PackageJsonSchema = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional(),
  main: z.string().optional(),
  types: z.string().optional(),
  scripts: z.record(z.string(), z.string()).optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
  engines: z.record(z.string(), z.string()).optional(),
  private: z.boolean().optional(),
  license: z.string().optional(),
  author: z.string().optional(),
});

export type PackageJson = z.infer<typeof PackageJsonSchema>;

// CDN providers for resolving dependencies
export enum CdnProvider {
  ESM = "esm.sh",
  UNPKG = "unpkg.com",
  JSPM = "jspm.dev",
  JSDELIVR = "cdn.jsdelivr.net/npm",
}

/**
 * Parse a package.json string into a PackageJson object
 */
export function parsePackageJson(
  packageJsonString: string,
): PackageJson | null {
  try {
    const packageJson = JSON.parse(packageJsonString);
    return PackageJsonSchema.parse(packageJson);
  } catch (error) {
    console.error("Failed to parse package.json:", error);
    return null;
  }
}

/**
 * Generate an import map for dependencies
 */
export function generateImportMap(
  dependencies: Record<string, string>,
  provider: CdnProvider = CdnProvider.ESM,
): Record<string, string> {
  const importMap: Record<string, string> = {};

  for (const [name, version] of Object.entries(dependencies)) {
    // Ensure version is a string and clean up version (remove ^ or ~ prefixes)
    if (!version) {
      console.warn(`Missing version for dependency: ${name}, using 'latest'`);
      const latestVersion = "latest";
      importMap[name] = `https://esm.sh/${name}@${latestVersion}`;
      continue;
    }

    // Make sure version is a string
    const versionStr = String(version);
    const cleanVersion = versionStr.replace(/[\^~]/, "");

    // Generate URL based on provider
    switch (provider) {
      case CdnProvider.ESM:
        importMap[name] = `https://esm.sh/${name}@${cleanVersion}`;
        break;
      case CdnProvider.UNPKG:
        importMap[name] = `https://unpkg.com/${name}@${cleanVersion}?module`;
        break;
      case CdnProvider.JSPM:
        importMap[name] = `https://jspm.dev/${name}@${cleanVersion}`;
        break;
      case CdnProvider.JSDELIVR:
        importMap[name] =
          `https://cdn.jsdelivr.net/npm/${name}@${cleanVersion}/+esm`;
        break;
      default:
        importMap[name] = `https://esm.sh/${name}@${cleanVersion}`;
    }
  }

  return importMap;
}

/**
 * Generate HTML with import map
 */
export function generateHtmlWithImportMap(
  htmlContent: string,
  importMap: Record<string, string>,
): string {
  // Create the import map script
  const importMapScript = `
    <script type="importmap">
      {
        "imports": ${JSON.stringify(importMap, null, 2)}
      }
    </script>
  `;

  // If the HTML content already has a head tag, insert the import map script
  if (htmlContent.includes("<head>")) {
    return htmlContent.replace("<head>", `<head>\n  ${importMapScript}`);
  }

  // If no head tag, check if there's an HTML tag to insert after
  if (htmlContent.includes("<html>")) {
    return htmlContent.replace(
      "<html>",
      `<html>\n<head>\n  ${importMapScript}\n</head>`,
    );
  }

  // If neither exists, just prepend the import map script
  return `${importMapScript}\n${htmlContent}`;
}

/**
 * Execute a script from package.json
 */
export async function executeScript(
  packageJson: PackageJson,
  scriptName: string,
  files: Record<string, string>,
): Promise<{
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}> {
  const logs: string[] = [];
  const errors: string[] = [];

  // Check if the script exists
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    return {
      success: false,
      output: "",
      logs,
      errors: [`Script "${scriptName}" not found in package.json`],
    };
  }

  const script = packageJson.scripts[scriptName];
  logs.push(`Executing script: ${scriptName} (${script})`);

  try {
    // Parse the script command
    const [command, ...args] = script.split(" ");

    // Handle different build tools
    switch (command) {
      case "node":
        return await executeNodeCommand(args, files, logs, errors);
      case "npm":
      case "npx":
        return await executeNpmCommand(args, files, logs, errors);
      case "react-scripts":
        return await executeReactScript(args, files, logs, errors);
      case "tsc":
        return await executeTypeScriptCompiler(args, files, logs, errors);
      case "vite":
        return await executeViteCommand(args, files, logs, errors);
      default:
        // For unknown commands, try to execute as Node.js script
        logs.push(`Trying to execute as Node.js script: ${command}`);
        try {
          // Check if the command is a file in the workspace
          if (files[command] || files[`./${command}`]) {
            return await executeNodeCommand([command], files, logs, errors);
          }

          // Otherwise, treat as unknown command
          logs.push(`Unknown command: ${command}`);
          return {
            success: false,
            output: "",
            logs,
            errors: [`Unsupported command: ${command}`],
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`Error executing command: ${errorMessage}`);
          return {
            success: false,
            output: "",
            logs,
            errors,
          };
        }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error executing script: ${errorMessage}`);
    return {
      success: false,
      output: "",
      logs,
      errors,
    };
  }
}

/**
 * Execute a Node.js command
 */
async function executeNodeCommand(
  args: string[],
  files: Record<string, string>,
  logs: string[],
  errors: string[],
): Promise<{
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}> {
  logs.push(`Executing Node.js command: node ${args.join(" ")}`);

  try {
    // Determine the entry point
    let entryPoint = args[0] || "index.js";

    // If the entry point doesn't have an extension, try to find a matching file
    if (!entryPoint.includes(".")) {
      const possibleExtensions = [".js", ".ts", ".jsx", ".tsx"];
      for (const ext of possibleExtensions) {
        if (files[entryPoint + ext]) {
          entryPoint = entryPoint + ext;
          break;
        }
      }
    }

    // Check if the entry point exists
    if (!files[entryPoint] && !entryPoint.startsWith("./")) {
      // Try with ./ prefix
      if (files["./" + entryPoint]) {
        entryPoint = "./" + entryPoint;
      } else {
        errors.push(`Entry point not found: ${entryPoint}`);
        return { success: false, output: "", logs, errors };
      }
    }

    // Execute the Node.js code (legacy - use WebContainer executor instead)
    errors.push(
      "Legacy node executor removed. Use WebContainer for real execution.",
    );
    return {
      success: false,
      output: "",
      logs,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error executing Node.js command: ${errorMessage}`);
    return { success: false, output: "", logs, errors };
  }
}

/**
 * Execute an npm command
 */
async function executeNpmCommand(
  args: string[],
  files: Record<string, string>,
  logs: string[],
  errors: string[],
): Promise<{
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}> {
  const command = args[0] || "";
  logs.push(`Executing npm command: npm ${args.join(" ")}`);

  try {
    // Handle different npm commands
    switch (command) {
      case "run":
      case "run-script":
        // Get the script name
        const scriptName = args[1];
        if (!scriptName) {
          errors.push("No script name provided");
          return { success: false, output: "", logs, errors };
        }

        // Find package.json
        const packageJsonContent = files["package.json"];
        if (!packageJsonContent) {
          errors.push("package.json not found");
          return { success: false, output: "", logs, errors };
        }

        // Parse package.json
        const packageJson = parsePackageJson(packageJsonContent);
        if (!packageJson) {
          errors.push("Invalid package.json");
          return { success: false, output: "", logs, errors };
        }

        // Check if the script exists
        if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
          errors.push(`Script '${scriptName}' not found in package.json`);
          return { success: false, output: "", logs, errors };
        }

        // Execute the script
        return await executeScript(packageJson, scriptName, files);

      case "start":
        // npm start is equivalent to npm run start
        return await executeNpmCommand(["run", "start"], files, logs, errors);

      case "test":
        // npm test is equivalent to npm run test
        return await executeNpmCommand(["run", "test"], files, logs, errors);

      default:
        logs.push(`Unsupported npm command: ${command}`);
        return {
          success: false,
          output: "",
          logs,
          errors: [`Unsupported npm command: ${command}`],
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error executing npm command: ${errorMessage}`);
    return { success: false, output: "", logs, errors };
  }
}

/**
 * Execute a React script (react-scripts)
 */
async function executeReactScript(
  args: string[],
  files: Record<string, string>,
  logs: string[],
  errors: string[],
): Promise<{
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}> {
  const command = args[0] || "start";
  logs.push(`Executing React script: react-scripts ${command}`);

  try {
    switch (command) {
      case "start":
      case "build":
        // For now, just execute the entry point
        return await executeNodeCommand(["index.js"], files, logs, errors);
      default:
        errors.push(`Unsupported React script command: ${command}`);
        return {
          success: false,
          output: "",
          logs,
          errors,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error executing React script: ${errorMessage}`);
    return {
      success: false,
      output: "",
      logs,
      errors,
    };
  }
}

/**
 * Execute TypeScript compiler (tsc)
 */
async function executeTypeScriptCompiler(
  args: string[],
  files: Record<string, string>,
  logs: string[],
  errors: string[],
): Promise<{
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}> {
  logs.push("Executing TypeScript compiler");

  try {
    // Default compiler options
    const defaultCompilerOptions = {
      target: "es2020",
      module: "esnext",
      moduleResolution: "node",
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    };

    // Check if tsconfig.json exists
    let compilerOptions = defaultCompilerOptions;
    if (files["tsconfig.json"]) {
      try {
        const tsconfig = JSON.parse(files["tsconfig.json"]);
        compilerOptions = {
          ...defaultCompilerOptions,
          ...tsconfig.compilerOptions,
        };
        logs.push("Using tsconfig.json for compilation");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        logs.push("Failed to parse tsconfig.json, using default options");
      }
    } else {
      logs.push("No tsconfig.json found, using default compiler options");
    }

    // Find TypeScript files
    const tsFiles = Object.entries(files).filter(
      ([name]) => name.endsWith(".ts") || name.endsWith(".tsx"),
    );

    if (tsFiles.length === 0) {
      errors.push("No TypeScript files found");
      return { success: false, output: "", logs, errors };
    }

    // Transpile each TypeScript file
    const transpiledFiles: Record<string, string> = {};
    for (const [name, content] of tsFiles) {
      logs.push(`Transpiling ${name}...`);
      try {
        const transpiledCode = transpileTypeScript(content, compilerOptions);
        const jsFileName = name.replace(/\.tsx?$/, ".js");
        transpiledFiles[jsFileName] = transpiledCode;
        logs.push(`Successfully transpiled ${name} to ${jsFileName}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push(`Failed to transpile ${name}: ${errorMessage}`);
      }
    }

    // If there are errors, return failure
    if (errors.length > 0) {
      return { success: false, output: "", logs, errors };
    }

    // Find index.html or create one if it doesn't exist
    const indexHtml = Object.entries(files).find(
      ([name]) => name.endsWith("index.html") || name === "index.html",
    );

    if (!indexHtml) {
      // Create a basic index.html
      const mainJsFile = Object.keys(transpiledFiles)[0];
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeScript Playground</title>
</head>
<body>
  <div id="root"></div>
  <script src="${mainJsFile}"></script>
</body>
</html>`;
      transpiledFiles["index.html"] = htmlContent;
    }

    // Return success with the transpiled files
    return {
      success: true,
      output: `Successfully transpiled ${tsFiles.length} TypeScript files`,
      logs,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error executing TypeScript compiler: ${errorMessage}`);
    return { success: false, output: "", logs, errors };
  }
}

/**
 * Execute Vite command
 */
async function executeViteCommand(
  args: string[],
  files: Record<string, string>,
  logs: string[],
  errors: string[],
): Promise<{
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}> {
  const command = args[0] || "dev";
  logs.push(`Executing Vite command: vite ${command}`);

  try {
    switch (command) {
      case "dev":
      case "serve":
      case "build":
        // For now, just execute the entry point
        return await executeNodeCommand(["index.js"], files, logs, errors);
      default:
        errors.push(`Unsupported Vite command: ${command}`);
        return {
          success: false,
          output: "",
          logs,
          errors,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error executing Vite command: ${errorMessage}`);
    return {
      success: false,
      output: "",
      logs,
      errors,
    };
  }
}

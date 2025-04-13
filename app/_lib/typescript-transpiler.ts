/**
 * A simple TypeScript transpiler that removes type annotations
 * This is a basic implementation that handles common TypeScript syntax
 * For a production environment, you would use a proper TypeScript compiler
 */

export interface TypeScriptCompilerOptions {
  target?: string;
  module?: string;
  moduleResolution?: string;
  esModuleInterop?: boolean;
  strict?: boolean;
  jsx?: string;
  [key: string]: unknown;
}

export function transpileTypeScript(
  code: string,
  options?: TypeScriptCompilerOptions
): string {
  // If the code is empty or just whitespace, return an empty string
  if (!code || code.trim() === "") {
    return "";
  }
  try {
    // Apply compiler options
    const defaultOptions: TypeScriptCompilerOptions = {
      target: "es2020",
      module: "esnext",
      moduleResolution: "node",
      esModuleInterop: true,
      strict: true,
      jsx: "react-jsx",
    };

    // Merge default options with provided options
    const compilerOptions = { ...defaultOptions, ...options };

    // Log compiler options for debugging
    console.debug("TypeScript compiler options:", compilerOptions);

    // Step 1: Handle multi-line comments and strings to avoid modifying them
    const placeholders: Record<string, string> = {};
    let placeholderCount = 0;

    // Replace multi-line comments with placeholders
    code = code.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      const placeholder = `__COMMENT_${placeholderCount++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });

    // Replace strings with placeholders
    code = code.replace(/(['"`])(?:\\[\s\S]|.)*?\1/g, (match) => {
      const placeholder = `__STRING_${placeholderCount++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });

    // Step 2: Process TypeScript-specific syntax

    // Remove import type statements
    code = code.replace(/import\s+type\s+[^;]*;/g, "");

    // Remove export type statements
    code = code.replace(/export\s+type\s+[^;]*;/g, "");

    // Remove interface declarations (multi-line with nested braces)
    let interfaceCount = 1;
    while (interfaceCount > 0) {
      interfaceCount = 0;
      code = code.replace(
        /interface\s+[A-Za-z0-9_]+\s*(?:<[^>]*>)?\s*(?:extends\s+[^{]*)?\s*\{([^{}]*|\{[^{}]*\})*\}/g,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_match) => {
          interfaceCount++;
          return "";
        }
      );
    }

    // Remove type declarations (including multi-line)
    let typeCount = 1;
    while (typeCount > 0) {
      typeCount = 0;
      code = code.replace(
        /type\s+[A-Za-z0-9_]+\s*(?:<[^>]*>)?\s*=\s*[^;]*;/g,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_match) => {
          typeCount++;
          return "";
        }
      );
    }

    // Remove type assertions (as Type)
    code = code.replace(/\s+as\s+(?:[A-Za-z0-9_.<>|&\[\]\s,]+)/g, "");

    // Remove type parameters in function/class declarations
    code = code.replace(/(<[^<>]*>)(?=\s*\([^)]*\))/g, "");

    // Remove function overloads (keep only the implementation)
    code = code.replace(
      /(function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*:[^{]*;\s*)+function\s+[A-Za-z0-9_]+/g,
      "function $1"
    );

    // Remove method overloads (keep only the implementation)
    code = code.replace(
      /([A-Za-z0-9_]+\s*\([^)]*\)\s*:[^{]*;\s*)+[A-Za-z0-9_]+\s*\(/g,
      "$1("
    );

    // Handle variable declarations with type annotations
    code = code.replace(
      /(?:const|let|var)\s+([A-Za-z0-9_,\s]+):\s*([A-Za-z0-9_.<>|&\[\]\s,]+)\s*=\s*/g,
      "const $1 = "
    );

    // Handle variable declarations with type annotations but no initializer (convert to let with undefined)
    code = code.replace(
      /(?:const|let|var)\s+([A-Za-z0-9_,\s]+):\s*([A-Za-z0-9_.<>|&\[\]\s,]+)\s*;/g,
      "let $1 = undefined;"
    );
    code = code.replace(
      /:\s*([A-Za-z0-9_.<>|&\[\]\s,]+)(?=(,|;|=|\)|\}))/g,
      ""
    );

    // Remove return type annotations
    code = code.replace(
      /\)\s*:\s*([A-Za-z0-9_.<>|&\[\]\s,]+)(?=\s*\{|\s*=>)/g,
      ")"
    );

    // Remove parameter type annotations
    code = code.replace(/\(([^)]*)\)/g, (_match, params) => {
      // Handle parameters with default values and type annotations
      params = params.replace(
        /([a-zA-Z0-9_]+)\s*:\s*[A-Za-z0-9_.<>|&\[\]\s,]+\s*=\s*([^,)]+)/g,
        "$1 = $2"
      );

      // Replace type annotations in parameters
      params = params.replace(/:\s*[A-Za-z0-9_.<>|&\[\]\s,]+/g, "");

      // Remove optional parameter markers
      params = params.replace(/\?(?=\s*[,)])/g, "");

      return `(${params})`;
    });

    // Handle destructured objects with type annotations
    code = code.replace(
      /(?:const|let|var)\s*\{([^}]*)\}\s*(?::\s*[A-Za-z0-9_.<>|&\[\]\s,]+)?\s*=\s*/g,
      (_match, props) => {
        // Remove type annotations in destructured properties
        props = props.replace(
          /([A-Za-z0-9_]+)\s*:\s*[A-Za-z0-9_.<>|&\[\]\s,]+(?=(,|\s|$))/g,
          "$1"
        );

        // Remove optional property markers
        props = props.replace(/([A-Za-z0-9_]+)\?/g, "$1");

        return `const {${props}} = `;
      }
    );

    // Handle destructured arrays with type annotations
    code = code.replace(
      /(?:const|let|var)\s*\[([^\]]*)\]\s*(?::\s*[A-Za-z0-9_.<>|&\[\]\s,]+)?\s*=\s*/g,
      (_match, elements) => {
        // Remove type annotations in array elements
        elements = elements.replace(
          /([A-Za-z0-9_]+)\s*:\s*[A-Za-z0-9_.<>|&\[\]\s,]+(?=(,|\s|$))/g,
          "$1"
        );

        return `const [${elements}] = `;
      }
    );

    // Remove readonly, public, private, protected modifiers
    code = code.replace(/\b(readonly|public|private|protected)\s+/g, "");

    // Handle class property declarations with type annotations
    code = code.replace(
      /([a-zA-Z0-9_]+)\s*:\s*[A-Za-z0-9_.<>|&\[\]\s,]+\s*(?==|;)/g,
      "$1 "
    );

    // Handle class method declarations with return type annotations
    code = code.replace(
      /([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*:\s*[A-Za-z0-9_.<>|&\[\]\s,]+\s*\{/g,
      "$1($2) {"
    );

    // Handle arrow functions with type annotations
    code = code.replace(
      /\(([^)]*)\)\s*:\s*[A-Za-z0-9_.<>|&\[\]\s,]+\s*=>/g,
      "($1) =>"
    );

    // Handle single parameter arrow functions with type annotations
    code = code.replace(
      /([a-zA-Z0-9_]+)\s*:\s*[A-Za-z0-9_.<>|&\[\]\s,]+\s*=>/g,
      "$1 =>"
    );

    // Remove declare statements
    code = code.replace(/\bdeclare\s+[^;]*;/g, "");

    // Handle enum declarations - convert to object
    code = code.replace(
      /enum\s+([A-Za-z0-9_]+)\s*\{([^}]*)\}/g,
      (_, name, values) => {
        // Convert enum values to object properties
        const cleanValues = values.replace(/,\s*$/, ""); // Remove trailing comma
        return `const ${name} = {${cleanValues}};
`;
      }
    );

    // Remove namespace but keep content
    code = code.replace(/namespace\s+[A-Za-z0-9_]+\s*\{([\s\S]*?)\}/g, "$1");

    // Handle JSX syntax based on compiler options
    if (compilerOptions.jsx) {
      // Different handling based on jsx option
      switch (compilerOptions.jsx) {
        case "react":
          // Keep JSX as is for React.createElement transformation
          break;
        case "react-jsx":
        case "react-jsxdev":
          // For the new JSX transform, we don't need to do anything special
          break;
        case "preserve":
          // Keep JSX syntax as is
          break;
        default:
          // Default behavior - keep JSX syntax
          break;
      }
    }

    // Step 3: Restore comments and strings
    Object.keys(placeholders).forEach((placeholder) => {
      code = code.replace(
        new RegExp(placeholder, "g"),
        placeholders[placeholder]
      );
    });

    // Step 4: Final cleanup
    // Remove any remaining TypeScript-specific syntax that might cause issues
    code = code.replace(/\?\./g, "."); // Optional chaining
    code = code.replace(/\?\?/g, "||"); // Nullish coalescing

    // Remove any empty statements that might have been left behind
    code = code.replace(/;;+/g, ";");

    // Ensure the code is valid JavaScript
    try {
      // Test if the code is valid JavaScript
      new Function(code);
    } catch (error) {
      console.warn(
        "TypeScript transpilation produced invalid JavaScript:",
        error
      );

      // Try to identify the specific issue
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      let fixedCode = code;

      // Fix common issues
      if (errorMessage.includes("Missing initializer in const declaration")) {
        // Fix const declarations without initializers
        fixedCode = fixedCode.replace(
          /const\s+([A-Za-z0-9_]+)\s*;/g,
          "let $1 = undefined;"
        );
      }

      if (errorMessage.includes("Unexpected token")) {
        // Add more specific fixes for other common errors here
        console.log("Original code with error:\n", code);
      }

      try {
        // Test if the fixed code is valid
        new Function(fixedCode);
        return fixedCode;
      } catch (secondError) {
        // If still invalid, return a simple valid JavaScript statement
        console.error("Failed to fix TypeScript code:", secondError);
        return (
          '// TypeScript transpilation failed\nconsole.log("TypeScript transpilation failed: ' +
          errorMessage.replace(/"/g, '\\"') +
          '");'
        );
      }
    }

    return code;
  } catch (error) {
    console.error("Error transpiling TypeScript:", error);
    // If transpilation fails, return the original code
    return code;
  }
}

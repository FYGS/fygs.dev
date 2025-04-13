import { z } from "zod";
import { transpileTypeScript } from "./typescript-transpiler";
// Import the fixed node executor
import { executeNodeJs } from "./node-executor";

export const ExecutionResultSchema = z.object({
  output: z.string(),
  logs: z.array(z.string()),
  errors: z.array(z.string()),
});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

export interface ExecuteCodeParams {
  code: string;
  language: string;
  signal?: AbortSignal;
  timeout?: number;
  files?: Record<string, string>;
  entryPoint?: string;
  packageJson?: string;
  runScript?: string;
}

export interface ExecuteCodeResult {
  output: string;
  logs: string[];
  errors: string[];
}

// LEGACY CODE - NO LONGER USED
// This function has been replaced by executeNodeJs from node-executor.ts
/*
async function executeInContext(
  code: string,
  isRetry: boolean
): Promise<ExecuteCodeResult> {
  const logs: string[] = [];
  const errors: string[] = [];
  let output = "";

  // Save original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  try {
    // Helper function to format console arguments
    const formatArgs = (args: unknown[]) => {
      return args
        .map((arg: unknown) => {
          if (arg === undefined) return "undefined";
          if (arg === null) return "null";
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              // If JSON serialization fails, fall back to string conversion
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");
    };

    // Override console methods to capture output
    console.log = (...args) => {
      const message = formatArgs(args);
      // Skip internal debug messages
      if (
        !message.startsWith("// Executing") &&
        !message.startsWith("// Code execution")
      ) {
        logs.push(message);
      }
      originalConsole.log(...args); // Still log to the actual console
    };

    console.error = (...args) => {
      const message = formatArgs(args);
      errors.push(message);
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      const message = formatArgs(args);
      logs.push(`[WARN] ${message}`);
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      const message = formatArgs(args);
      logs.push(`[INFO] ${message}`);
      originalConsole.info(...args);
    };

    // Prepare the code for execution
    // For JavaScript, we need to handle both expressions and statements
    const processedCode = code.trim();

    // Check if the code is a single expression (no semicolon, no multiple lines)
    const isSingleExpression =
      !processedCode.includes(";") && !processedCode.includes("\n");

    // If it's a single expression, we'll return its value
    // Otherwise, we'll execute it as a series of statements
    const wrappedCode = isSingleExpression
      ? `
        try {
          // Execute the expression and return its value
          const result = ${processedCode};
          return result;
        } catch (error) {
          console.error(error.message);
          throw error;
        }
      `
      : `
        try {
          // Execute the code statements
          ${processedCode}
          return undefined;
        } catch (error) {
          console.error(error.message);
          throw error;
        }
      `;

    // We'll keep this for internal debugging but not show it to the user
    // console.log(`// Executing wrapped code:\n${wrappedCode}`);

    // Create a function from the code string
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    let fn;
    try {
      fn = new AsyncFunction(wrappedCode);
    } catch (error) {
      // If we can't create a function, try a simpler approach
      errors.push(
        error instanceof Error ? error.message : String(error)
      );
      return { output: "", logs, errors };
    }

    // Execute the function
    let result;
    try {
      result = await fn();
    } catch (error) {
      // If execution fails, try a different approach
      errors.push(
        error instanceof Error ? error.message : String(error)
      );
      return { output: "", logs, errors };
    }

    // Convert the result to a string if it exists
    if (result !== undefined) {
      output =
        typeof result === "object"
          ? JSON.stringify(result, null, 2)
          : String(result);
    }

    return { output, logs, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { output: "", logs, errors };
  } finally {
    // Restore console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }
}
*/

// Helper function to execute HTML/CSS code
function executeHtml(
  htmlCode: string,
  cssCode: string = ""
): ExecuteCodeResult {
  try {
    // Check if the HTML code already contains a full HTML document
    const isFullHtmlDocument =
      htmlCode.trim().toLowerCase().startsWith("<!doctype html>") ||
      htmlCode.trim().toLowerCase().startsWith("<html");

    // Create a data URL that can be displayed in an iframe
    let html;

    if (isFullHtmlDocument) {
      // If it's a full HTML document, we need to inject our console capture script
      // and any CSS if provided, but preserve the original structure

      // First, let's parse the HTML to find where to inject our CSS and script
      const headEndIndex = htmlCode.toLowerCase().indexOf("</head>");
      const bodyEndIndex = htmlCode.toLowerCase().indexOf("</body>");

      if (headEndIndex !== -1 && bodyEndIndex !== -1) {
        // We can inject our CSS in the head and script before the body closes
        // Always inject the CSS directly as a style tag, regardless of any link tags
        const cssToInject = cssCode
          ? `
        <style>
          /* User provided CSS - directly injected */
          ${cssCode}
        </style>
        `
          : "";

        // Remove any existing link tags that reference styles.css to avoid conflicts
        let beforeHead = htmlCode.substring(0, headEndIndex);
        const linkRegex = /<link[^>]*href=["'].*?styles\.css["'][^>]*>/gi;
        beforeHead = beforeHead.replace(
          linkRegex,
          "<!-- CSS directly injected -->"
        );

        const afterHead = htmlCode.substring(headEndIndex, bodyEndIndex);
        const afterBody = htmlCode.substring(bodyEndIndex);

        html = `${beforeHead}${cssToInject}</head>${afterHead}<script>
          // Capture console output
          (function() {
            const logs = [];
            const errors = [];
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info
            };

            // Helper function to format console arguments
            const formatArgs = function(args) {
              return Array.from(args).map(function(arg) {
                if (arg === undefined) return 'undefined';
                if (arg === null) return 'null';
                if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch (error) {
                    return String(arg);
                  }
                }
                return String(arg);
              }).join(' ');
            };

            // Override console methods
            console.log = function() {
              const message = formatArgs(arguments);
              logs.push(message);
              try {
                window.parent.postMessage({ type: 'console', method: 'log', message: message }, '*');
              } catch (e) {}
              originalConsole.log.apply(console, arguments);
            };

            console.error = function() {
              const message = formatArgs(arguments);
              errors.push(message);
              try {
                window.parent.postMessage({ type: 'console', method: 'error', message: message }, '*');
              } catch (e) {}
              originalConsole.error.apply(console, arguments);
            };

            console.warn = function() {
              const message = formatArgs(arguments);
              logs.push('[WARN] ' + message);
              try {
                window.parent.postMessage({ type: 'console', method: 'warn', message: '[WARN] ' + message }, '*');
              } catch (e) {}
              originalConsole.warn.apply(console, arguments);
            };

            console.info = function() {
              const message = formatArgs(arguments);
              logs.push('[INFO] ' + message);
              try {
                window.parent.postMessage({ type: 'console', method: 'info', message: '[INFO] ' + message }, '*');
              } catch (e) {}
              originalConsole.info.apply(console, arguments);
            };

            // Handle errors
            window.onerror = function(message, source, lineno, colno, error) {
              const errorMessage = error ? error.stack || error.message : message;
              console.error(errorMessage);
              try {
                window.parent.postMessage({ type: 'console', method: 'error', message: errorMessage }, '*');
              } catch (e) {}
              return true;
            };
          })();
        </script>${afterBody}`;
      } else {
        // If we can't find the head or body tags, just use the HTML as is
        html = htmlCode;
      }
    } else {
      // If it's not a full HTML document, wrap it in our template
      html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Reset some basic elements */
      body, h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, figcaption, blockquote, dl, dd {
        margin: 0;
        padding: 0;
      }

      /* Set core body defaults */
      body {
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        font-size: 16px;
        color: #333;
        background-color: #fff;
      }

      /* User provided CSS */
      ${cssCode}
    </style>
  </head>
  <body>
    ${htmlCode}
    <script>
      // Capture console output
      (function() {
        const logs = [];
        const errors = [];
        const originalConsole = {
          log: console.log,
          error: console.error,
          warn: console.warn,
          info: console.info
        };

        // Helper function to format console arguments
        const formatArgs = function(args) {
          return Array.from(args).map(function(arg) {
            if (arg === undefined) return 'undefined';
            if (arg === null) return 'null';
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch (error) {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ');
        };

        // Override console methods
        console.log = function() {
          const message = formatArgs(arguments);
          logs.push(message);
          try {
            window.parent.postMessage({ type: 'console', method: 'log', message: message }, '*');
          } catch (e) {}
          originalConsole.log.apply(console, arguments);
        };

        console.error = function() {
          const message = formatArgs(arguments);
          errors.push(message);
          try {
            window.parent.postMessage({ type: 'console', method: 'error', message: message }, '*');
          } catch (e) {}
          originalConsole.error.apply(console, arguments);
        };

        console.warn = function() {
          const message = formatArgs(arguments);
          logs.push('[WARN] ' + message);
          try {
            window.parent.postMessage({ type: 'console', method: 'warn', message: '[WARN] ' + message }, '*');
          } catch (e) {}
          originalConsole.warn.apply(console, arguments);
        };

        console.info = function() {
          const message = formatArgs(arguments);
          logs.push('[INFO] ' + message);
          try {
            window.parent.postMessage({ type: 'console', method: 'info', message: '[INFO] ' + message }, '*');
          } catch (e) {}
          originalConsole.info.apply(console, arguments);
        };

        // Handle errors
        window.onerror = function(message, source, lineno, colno, error) {
          const errorMessage = error ? error.stack || error.message : message;
          console.error(errorMessage);
          try {
            window.parent.postMessage({ type: 'console', method: 'error', message: errorMessage }, '*');
          } catch (e) {}
          return true;
        };
      })();
    </script>
  </body>
</html>
      `;
    }

    // Create a properly encoded data URL
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

    // Add debug logs
    const logs = [];
    if (cssCode) {
      logs.push(`CSS content (${cssCode.length} chars) injected into HTML`);
    }

    return {
      output: dataUrl,
      logs,
      errors: [],
    };
  } catch (error) {
    return {
      output: "",
      logs: [],
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

// Main execution function
export async function executeCode({
  code,
  language,
  signal,
  timeout = 30000,
  files = {},
  entryPoint,
  packageJson,
  runScript,
}: ExecuteCodeParams): Promise<ExecuteCodeResult> {
  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Execution timed out after ${timeout}ms`));
    }, timeout);

    // Handle abort signal if provided
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(id);
        reject(new Error("Execution aborted"));
      });
    }
  });

  // Create the execution promise
  const executionPromise = new Promise<ExecuteCodeResult>(async (resolve) => {
    try {
      // Add a simple test case for debugging
      if (code.trim() === "test") {
        return resolve({
          output: "Test successful!",
          logs: ["This is a test log"],
          errors: [],
        });
      }

      // Check if we have multiple files
      if (Object.keys(files).length > 0) {
        try {
          // If packageJson is provided but not in files, add it
          if (packageJson && !files["package.json"]) {
            files["package.json"] = packageJson;
          }

          // Special case for HTML + CSS files
          const htmlFile = Object.entries(files).find(
            ([name]) => name.endsWith(".html") || name.endsWith(".htm")
          );
          const cssFile = Object.entries(files).find(([name]) =>
            name.endsWith(".css")
          );

          // If we have both HTML and CSS files, handle them specially
          if (htmlFile && cssFile) {
            // Destructure the array, ignoring the first element (filename)
            const [, htmlContent] = htmlFile;
            const [cssFileName, cssContent] = cssFile;

            // Always directly inject the CSS content into the HTML
            // This ensures the styles are applied regardless of link tags
            console.log(`Executing HTML with CSS content from ${cssFileName}`);
            resolve(executeHtml(htmlContent, cssContent));
            return;
          }

          // Import the bundler service
          const { bundleFiles } = await import("./bundler-service");

          // If we have a runScript, use the package manager
          if (runScript && files["package.json"]) {
            const { parsePackageJson, executeScript } = await import(
              "./package-manager"
            );
            const pkgJson = parsePackageJson(files["package.json"]);

            if (pkgJson) {
              const result = await executeScript(pkgJson, runScript, files);
              resolve({
                output: result.output,
                logs: result.logs,
                errors: result.errors,
              });
              return;
            }
          }

          // Bundle the files
          const bundlerResult = await bundleFiles(files, {
            entryPoint: entryPoint || Object.keys(files)[0],
          });

          resolve({
            output: bundlerResult.output,
            logs: bundlerResult.logs,
            errors: bundlerResult.errors,
          });
        } catch (error) {
          resolve({
            output: "",
            logs: [],
            errors: [
              "Failed to bundle files: " +
                (error instanceof Error ? error.message : String(error)),
            ],
          });
        }
      } else {
        // Handle single file execution
        switch (language.toLowerCase()) {
          case "javascript":
          case "jsx":
            // Execute JavaScript directly using the fixed node executor
            try {
              // Create a simple index.js file with the code
              const jsFiles = { "index.js": code };
              const result = await executeNodeJs(jsFiles, "index.js");
              resolve({
                output: result.output,
                logs: result.logs,
                errors: result.errors,
              });
            } catch (error) {
              resolve({
                output: "",
                logs: [],
                errors: [
                  error instanceof Error ? error.message : String(error),
                ],
              });
            }
            break;

          case "typescript":
          case "tsx":
            // For TypeScript, first transpile to JavaScript and then execute with the fixed node executor
            try {
              // Transpile TypeScript to JavaScript
              const transpiledCode = transpileTypeScript(code);

              // Create a simple index.js file with the transpiled code
              const jsFiles = { "index.js": transpiledCode };
              const result = await executeNodeJs(jsFiles, "index.js");
              resolve({
                output: result.output,
                logs: result.logs,
                errors: result.errors,
              });
            } catch (error) {
              resolve({
                output: "",
                logs: [],
                errors: [
                  "Failed to transpile or execute TypeScript: " +
                    (error instanceof Error ? error.message : String(error)),
                ],
              });
            }
            break;

          case "html":
            // Execute HTML
            resolve(executeHtml(code));
            break;

          case "css":
            // Execute CSS with a comprehensive HTML template that showcases the CSS styles
            resolve(
              executeHtml(
                `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Preview</title>
</head>
<body>
  <div class="container">
    <header>
      <h1>CSS Preview</h1>
      <p>This is a preview of your CSS styles. Edit the styles.css file to see changes reflected here.</p>
    </header>

    <section class="content">
      <h2>Style Examples</h2>

      <div class="card-container">
        <div class="card">
          <div class="card-header">
            <h3>Card Title 1</h3>
          </div>
          <div class="card-body">
            <p>This is some sample content for the first card. You can modify the CSS to change how this card looks.</p>
            <a href="#" class="btn">Learn More</a>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Card Title 2</h3>
          </div>
          <div class="card-body">
            <p>This is some sample content for the second card. Try changing colors, spacing, or adding animations.</p>
            <a href="#" class="btn">Learn More</a>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Card Title 3</h3>
          </div>
          <div class="card-body">
            <p>This is some sample content for the third card. Experiment with different layouts and styles.</p>
            <a href="#" class="btn">Learn More</a>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Form Elements</h2>
        <form>
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" placeholder="Enter your name">
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" placeholder="Enter your email">
          </div>
          <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" placeholder="Enter your message"></textarea>
          </div>
          <button type="submit" class="btn">Submit</button>
        </form>
      </div>
    </section>

    <footer>
      <p>&copy; 2023 CSS Playground. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`,
                code
              )
            );
            break;

          default:
            // For unsupported languages, return a message
            resolve({
              output: `Language '${language}' execution is not supported in the browser environment.\nFor server-side languages like Python, Go, Rust, etc., we would need a backend service.`,
              logs: [],
              errors: [],
            });
        }
      }
    } catch (error) {
      resolve({
        output: "",
        logs: [],
        errors: [error instanceof Error ? error.message : "Execution failed"],
      });
    }
  });

  try {
    // Race the execution against the timeout
    return await Promise.race([executionPromise, timeoutPromise]);
  } catch (error) {
    return {
      output: "",
      logs: [],
      errors: [error instanceof Error ? error.message : "Execution failed"],
    };
  }
}

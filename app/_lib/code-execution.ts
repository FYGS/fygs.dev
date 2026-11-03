import { z } from "zod";
import { TranspileError, transpileFileStrict } from "./typescript-transpiler";
import { buildPreviewHtml } from "./preview-html";
import { executePython } from "./python-executor";
import { SANDBOX_REACT } from "./sandbox-vendor.generated";
import {
  executeInWebContainer,
  executeQuickRun,
  isWebContainerSupported,
  killCurrentProcess,
} from "./webcontainer-executor";

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
  serverUrl?: string;
}

// Helper function to execute HTML/CSS code
function executeHtml(
  htmlCode: string,
  cssCode: string = "",
): ExecuteCodeResult {
  try {
    const isFullHtmlDocument =
      htmlCode.trim().toLowerCase().startsWith("<!doctype html>") ||
      htmlCode.trim().toLowerCase().startsWith("<html");

    let html: string;

    if (isFullHtmlDocument) {
      const headEndIndex = htmlCode.toLowerCase().indexOf("</head>");
      const bodyEndIndex = htmlCode.toLowerCase().indexOf("</body>");

      if (headEndIndex !== -1 && bodyEndIndex !== -1) {
        const cssToInject = cssCode ? `<style>${cssCode}</style>` : "";

        // Remove existing link tags to styles.css to avoid conflicts
        let beforeHead = htmlCode.substring(0, headEndIndex);
        beforeHead = beforeHead.replace(
          /<link[^>]*href=["'].*?styles\.css["'][^>]*>/gi,
          "",
        );

        const afterHead = htmlCode.substring(headEndIndex, bodyEndIndex);
        const afterBody = htmlCode.substring(bodyEndIndex);

        html = `${beforeHead}${cssToInject}</head>${afterHead}${consoleCaptureScipt()}${afterBody}`;
      } else {
        html = htmlCode;
      }
    } else {
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { min-height: 100vh; font-family: system-ui, sans-serif; line-height: 1.6; font-size: 16px; color: #333; background: #fff; margin: 0; padding: 0; }
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  ${consoleCaptureScipt()}
</body>
</html>`;
    }

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    const logs: string[] = [];
    if (cssCode) logs.push(`CSS (${cssCode.length} chars) injected`);

    return { output: dataUrl, logs, errors: [] };
  } catch (error) {
    return {
      output: "",
      logs: [],
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/** The page to preview: the entry point if it is HTML, else index.html, else the first HTML file. */
function pickHtmlEntry(files: Record<string, string>, entryPoint?: string): string {
  const isHtml = (name: string) => /\.html?$/i.test(name);
  if (entryPoint && isHtml(entryPoint) && entryPoint in files) return entryPoint;
  if ("index.html" in files) return "index.html";
  return Object.keys(files).find(isHtml) ?? "index.html";
}

/** Preview of an HTML project: local CSS/JS files are inlined so they actually run. */
function executeHtmlProject(
  files: Record<string, string>,
  entry: string,
): ExecuteCodeResult {
  const { html, unresolved, errors } = buildPreviewHtml(files, entry, {
    bridge: consoleCaptureScipt(),
  });
  const logs = unresolved.map(
    (ref) => `Warning: ${entry} references "${ref}" but no such file is in the project`,
  );
  return {
    output: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    logs,
    errors,
  };
}

// Main execution function
export async function executeCode({
  code,
  language,
  signal,
  timeout,
  files = {},
  entryPoint,
  packageJson,
  runScript,
}: ExecuteCodeParams): Promise<ExecuteCodeResult> {
  // Kill WebContainer process on abort signal (e.g., user clicks Stop)
  if (signal) {
    signal.addEventListener("abort", () => killCurrentProcess(), {
      once: true,
    });
  }

  try {
    // ── Multi-file project execution ──────────────────────────────────
    if (Object.keys(files).length > 0) {
      return await executeMultiFileProject(
        files,
        entryPoint,
        packageJson,
        runScript,
        timeout,
      );
    }

    // ── Single-file execution ─────────────────────────────────────────
    return await executeSingleFile(code, language, timeout);
  } catch (error) {
    return failure(error);
  }
}

/** A failed run, with a syntax error reported as "file:line:col - message". */
function failure(error: unknown): ExecuteCodeResult {
  const message =
    error instanceof TranspileError || error instanceof Error
      ? error.message
      : "Execution failed";
  return { output: "", logs: [], errors: [message] };
}

// ── Single-file execution router ─────────────────────────────────────────────

async function executeSingleFile(
  code: string,
  language: string,
  timeout?: number,
): Promise<ExecuteCodeResult> {
  switch (language.toLowerCase()) {
    case "javascript":
    case "js": {
      // WebContainer: real Node.js execution (instant, no install needed)
      if (isWebContainerSupported()) {
        const result = await executeQuickRun(code, "index.js", { timeout });
        return {
          output: result.output,
          logs: result.logs,
          errors: result.errors,
        };
      }
      // Fallback: browser-based execution via iframe
      return executeBrowserJs(code);
    }

    case "jsx": {
      // React JSX: always use iframe preview with React UMD (instant)
      return executeReactProject({ "index.jsx": code }, "index.jsx");
    }

    case "typescript":
    case "ts": {
      // Transpile TS with Sucrase (instant) then run in WebContainer
      const transpiled = transpileFileStrict(code, "index.ts");
      if (isWebContainerSupported()) {
        const result = await executeQuickRun(transpiled, "index.js", {
          timeout,
          displayNames: { "index.js": "index.ts" },
        });
        return {
          output: result.output,
          logs: result.logs,
          errors: result.errors,
        };
      }
      // Fallback: browser execution
      return executeBrowserJs(transpiled);
    }

    case "tsx": {
      // React TSX: always use iframe preview with React UMD (instant)
      return executeReactProject({ "index.tsx": code }, "index.tsx");
    }

    case "html":
      return executeHtml(code);

    case "css":
      return executeHtml(generateCssPreviewHtml(code), "");

    case "python": {
      const result = await executePython(code, 30000);
      return {
        output: result.output,
        logs: result.logs,
        errors: result.errors,
      };
    }

    default:
      return {
        output: "",
        logs: [],
        errors: [
          `Language "${language}" is not yet supported.\nSupported: JavaScript, TypeScript, JSX, TSX, HTML, CSS, Python.`,
        ],
      };
  }
}

/** Fallback browser-based JS execution via sandboxed iframe. */
function executeBrowserJs(code: string): ExecuteCodeResult {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body>
  ${consoleCaptureScipt()}
  <script>
    try {
      ${code}
    } catch(e) {
      console.error(e.stack || e.message);
    }
  <\/script>
</body></html>`;

  return {
    output: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    logs: [],
    errors: [],
  };
}

// ── Multi-file project execution ─────────────────────────────────────────────

async function executeMultiFileProject(
  files: Record<string, string>,
  entryPoint?: string,
  packageJson?: string,
  runScript?: string,
  timeout?: number,
): Promise<ExecuteCodeResult> {
  // Add package.json if provided but not in files
  if (packageJson && !files["package.json"]) {
    files["package.json"] = packageJson;
  }

  // Detect project type from files
  const htmlFile = Object.entries(files).find(
    ([name]) => name.endsWith(".html") || name.endsWith(".htm"),
  );
  const hasPythonFiles = Object.keys(files).some((name) =>
    name.endsWith(".py"),
  );

  // ── Python project ──
  if (hasPythonFiles) {
    const pyEntry =
      entryPoint && entryPoint.endsWith(".py")
        ? entryPoint
        : Object.keys(files).find((f) => f.endsWith(".py")) || "";
    if (pyEntry && files[pyEntry]) {
      const result = await executePython(files[pyEntry]);
      return {
        output: result.output,
        logs: result.logs,
        errors: result.errors,
      };
    }
  }

  // ── HTML project (no Node.js needed): inline the CSS/JS files it references ──
  if (htmlFile && !files["package.json"]) {
    return executeHtmlProject(files, pickHtmlEntry(files, entryPoint));
  }

  // ── React/JSX without a bundler: render in the iframe with React UMD ──
  // (A Node script cannot render a component: "ReactDOM is not defined".)
  const jsxEntry = Object.keys(files).find(
    (name) => name.endsWith(".jsx") || name.endsWith(".tsx"),
  );
  if (jsxEntry && !files["package.json"]) {
    const ep =
      entryPoint && /\.(jsx|tsx)$/.test(entryPoint) && entryPoint in files
        ? entryPoint
        : jsxEntry;
    return executeReactProject(files, ep);
  }

  // ── WebContainer execution for JS/TS/React/Node.js projects ──
  if (isWebContainerSupported()) {
    // Pre-transpile TS/TSX/JSX files to JS before mounting
    const transpiledForWc: Record<string, string> = {};
    const displayNames: Record<string, string> = {};
    const syntaxErrors: string[] = [];
    for (const [name, content] of Object.entries(files)) {
      const ext = name.split(".").pop()?.toLowerCase() ?? "";
      if (["ts", "tsx", "jsx"].includes(ext)) {
        const jsName = name.replace(/\.(ts|tsx|jsx)$/, ".js");
        displayNames[jsName] = name;
        try {
          transpiledForWc[jsName] = transpileFileStrict(content, name);
        } catch (error) {
          syntaxErrors.push(error instanceof Error ? error.message : String(error));
        }
      } else {
        transpiledForWc[name] = content;
      }
    }
    // Report a syntax error as such instead of launching node on broken code
    if (syntaxErrors.length > 0) {
      return { output: "", logs: [], errors: syntaxErrors };
    }

    // Resolve entry point (convert extension if needed)
    let ep =
      entryPoint ||
      Object.keys(files).find(
        (f) =>
          f.endsWith(".js") ||
          f.endsWith(".ts") ||
          f.endsWith(".jsx") ||
          f.endsWith(".tsx"),
      ) ||
      Object.keys(files)[0];
    // Update entry point to .js if it was transpiled
    if (/\.(ts|tsx|jsx)$/.test(ep)) {
      ep = ep.replace(/\.(ts|tsx|jsx)$/, ".js");
    }

    const result = await executeInWebContainer(transpiledForWc, ep, {
      installDeps: true,
      // plain `node file`: stop a runaway program quickly (default 30s)
      timeout,
      // npm scripts (install + start): a server is left running once it is up
      scriptTimeout: 60000,
      runScript: runScript || undefined,
      displayNames,
    });

    return {
      output: result.output,
      logs: result.logs,
      errors: result.errors,
      serverUrl: result.serverUrl,
    };
  }

  // ── Fallback: React/JSX preview via iframe ──
  const hasReactFiles = Object.keys(files).some(
    (name) => name.endsWith(".jsx") || name.endsWith(".tsx"),
  );

  if (hasReactFiles) {
    const ep =
      entryPoint ||
      Object.keys(files).find(
        (f) => f.endsWith(".jsx") || f.endsWith(".tsx"),
      ) ||
      Object.keys(files)[0];
    return executeReactProject(files, ep);
  }

  // ── Fallback: Transpile + browser execution ──
  const transpiledFiles: Record<string, string> = {};
  for (const [name, content] of Object.entries(files)) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (["ts", "tsx", "jsx"].includes(ext)) {
      try {
        transpiledFiles[name.replace(/\.(ts|tsx|jsx)$/, ".js")] =
          transpileFileStrict(content, name);
      } catch (error) {
        return failure(error);
      }
    } else {
      transpiledFiles[name] = content;
    }
  }

  const allCode = Object.values(transpiledFiles).join("\n");
  return executeBrowserJs(allCode);
}

// ── React/JSX execution (renders to iframe preview) ──────────────────────────

function executeReactProject(
  files: Record<string, string>,
  entryPoint: string,
): ExecuteCodeResult {
  try {
    // Transpile all TS/TSX/JSX files
    // Modules are registered under the name they are required by at runtime
    // (App.jsx -> App.js) and converted to CommonJS so that `import` / `export`
    // work inside the require() shim of the preview page.
    const modules: Record<string, string> = {};
    for (const [name, content] of Object.entries(files)) {
      const ext = name.split(".").pop()?.toLowerCase() ?? "";
      if (["ts", "tsx", "jsx", "js", "mjs"].includes(ext)) {
        const runtimeName = name.replace(/\.(ts|tsx|jsx|mjs)$/, ".js");
        modules[runtimeName] = transpileFileStrict(content, name, {
          commonjs: true,
        });
      } else if (ext === "css") {
        modules[name] = content;
      }
    }

    const html = buildReactProjectHtml(modules, entryPoint);
    return {
      output: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
      logs: [],
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

function buildReactProjectHtml(
  modules: Record<string, string>,
  entryPoint: string,
): string {
  // Collect CSS
  const cssContent = Object.entries(modules)
    .filter(([name]) => name.endsWith(".css"))
    .map(([, content]) => content)
    .join("\n");

  // Build module map for simple require simulation
  const moduleEntries = Object.entries(modules)
    .filter(([name]) => !name.endsWith(".css"))
    .map(
      ([name, code]) =>
        `"${name}": function(module, exports, require) {\n${code}\n}`,
    )
    .join(",\n");

  const entryJs = entryPoint.replace(/\.(ts|tsx|jsx)$/, ".js");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <!-- React and ReactDOM come from the site itself (scripts/build-sandbox-vendor.mjs), with an integrity hash:
       not from a CDN that could change under the learner or be compromised -->
  <script src="${SANDBOX_REACT.path}" integrity="${SANDBOX_REACT.integrity}" crossorigin="anonymous"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  ${consoleCaptureScipt()}
  <script>
    try {
      const __modules = {${moduleEntries}};
      const __cache = {};

      function require(name) {
        // Stylesheets are inlined in <style>; importing one is a no-op
        if (/\.css$/.test(name)) return {};
        // Handle React/ReactDOM
        if (name === 'react') return React;
        if (name === 'react-dom' || name === 'react-dom/client') return ReactDOM;

        // Normalize path
        let resolved = name;
        if (!resolved.startsWith('./') && !resolved.startsWith('/')) resolved = './' + resolved;
        // Try extensions
        const tries = [resolved, resolved + '.js', resolved + '.jsx', resolved + '.ts', resolved + '.tsx'];
        for (const t of tries) {
          const key = t.replace('./', '');
          if (__modules[key]) {
            if (__cache[key]) return __cache[key];
            const mod = { exports: {} };
            __cache[key] = mod.exports;
            __modules[key](mod, mod.exports, require);
            __cache[key] = mod.exports;
            return mod.exports;
          }
        }
        console.warn('Module not found:', name);
        return {};
      }

      // A component file that only exports (no createRoot call) still gets rendered
      let __rendered = false;
      const __createRoot = ReactDOM.createRoot;
      if (__createRoot) {
        ReactDOM.createRoot = function () { __rendered = true; return __createRoot.apply(this, arguments); };
      }
      const __legacyRender = ReactDOM.render;
      if (__legacyRender) {
        ReactDOM.render = function () { __rendered = true; return __legacyRender.apply(this, arguments); };
      }

      // Execute entry point
      const __entry = require('${entryJs}');
      if (!__rendered) {
        const Component = __entry && (__entry.default || __entry.App);
        if (typeof Component === 'function') {
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Component));
        }
      }
    } catch(error) {
      document.getElementById('root').innerHTML =
        '<div style="padding:20px;color:#ef4444;font-family:monospace;white-space:pre-wrap">' +
        '<h3 style="margin-bottom:8px">Runtime Error</h3>' + error.message + '</div>';
      window.parent.postMessage({ type: 'console', method: 'error', message: error.stack || error.message }, '*');
    }
  <\/script>
</body>
</html>`;
}

function generateCssPreviewHtml(cssCode: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Preview</title>
  <style>${cssCode}</style>
</head>
<body>
  <div class="container" style="max-width:800px;margin:0 auto;padding:24px">
    <header><h1>CSS Preview</h1><p>Edit your CSS to see live changes.</p></header>
    <section class="content" style="margin-top:24px">
      <div class="card-container" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:16px">
        <div class="card"><div class="card-header"><h3>Card 1</h3></div><div class="card-body"><p>Sample content for styling.</p><a href="#" class="btn">Action</a></div></div>
        <div class="card"><div class="card-header"><h3>Card 2</h3></div><div class="card-body"><p>Try changing colors and spacing.</p><a href="#" class="btn">Action</a></div></div>
        <div class="card"><div class="card-header"><h3>Card 3</h3></div><div class="card-body"><p>Experiment with layouts.</p><a href="#" class="btn">Action</a></div></div>
      </div>
      <div class="form-section" style="margin-top:24px">
        <h2>Form Elements</h2>
        <form style="margin-top:12px">
          <div class="form-group" style="margin-bottom:12px"><label>Name:</label><br><input type="text" placeholder="Your name"></div>
          <div class="form-group" style="margin-bottom:12px"><label>Email:</label><br><input type="email" placeholder="Your email"></div>
          <div class="form-group" style="margin-bottom:12px"><label>Message:</label><br><textarea placeholder="Your message"></textarea></div>
          <button type="submit" class="btn">Submit</button>
        </form>
      </div>
    </section>
  </div>
</body>
</html>`;
}

/** Shared console capture script injected into all iframe previews. */
function consoleCaptureScipt(): string {
  return `<script>
    (function() {
      var orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
      function fmt(args) {
        return Array.from(args).map(function(a) {
          if (a === undefined) return 'undefined';
          if (a === null) return 'null';
          if (typeof a === 'object') { try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); } }
          return String(a);
        }).join(' ');
      }
      function send(method, msg) { try { window.parent.postMessage({ type: 'console', method: method, message: msg }, '*'); } catch(e) {} }
      console.log = function() { var m = fmt(arguments); send('log', m); orig.log.apply(console, arguments); };
      console.error = function() { var m = fmt(arguments); send('error', m); orig.error.apply(console, arguments); };
      console.warn = function() { var m = fmt(arguments); send('warn', '[WARN] ' + m); orig.warn.apply(console, arguments); };
      console.info = function() { var m = fmt(arguments); send('info', '[INFO] ' + m); orig.info.apply(console, arguments); };
      window.onerror = function(msg, src, line, col, err) {
        var m = err ? (err.stack || err.message) : msg;
        send('error', m);
        return true;
      };
    })();
  <\/script>`;
}

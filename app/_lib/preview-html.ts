/**
 * Build a self-contained preview document from a multi-file HTML project.
 *
 * The preview runs in a sandboxed blob/data iframe, so `<link href="styles.css">`
 * and `<script src="app.js">` cannot be fetched from anywhere. They are inlined
 * from the project's files instead. External URLs (CDNs) are left untouched.
 *
 * Limitation: ES-module imports BETWEEN local files are not resolved (each
 * script is inlined on its own). Classic scripts and single-file modules work.
 */

import { TranspileError, transpileFileStrict } from "./typescript-transpiler";

export interface PreviewOptions {
  /**
   * Markup inserted as early as possible (right after <head>), so it exists
   * before any project script runs. Used for the console bridge: a bridge placed
   * after the project's scripts would miss their console.log calls.
   */
  bridge?: string;
}

export interface PreviewResult {
  html: string;
  /** Project files that were inlined into the document. */
  inlined: string[];
  /** Local references that matched no project file. */
  unresolved: string[];
  /** Syntax errors found in inlined TS/JSX files. */
  errors: string[];
}

const EXTERNAL_REF = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Join `ref` to `baseDir` and resolve `.` / `..` segments. Returns null if it escapes the root. */
export function resolveProjectPath(baseDir: string, ref: string): string | null {
  const cleanRef = ref.split(/[?#]/)[0];
  const joined = cleanRef.startsWith("/") ? cleanRef.slice(1) : `${baseDir}/${cleanRef}`;
  const out: string[] = [];
  for (const part of joined.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length === 0) return null;
      out.pop();
    } else {
      out.push(part);
    }
  }
  return out.join("/");
}

/**
 * Find the project file a reference points to. Follows the TypeScript
 * convention that `./app.js` may be written as `app.ts` / `app.tsx` / `app.jsx`.
 */
export function findProjectFile(
  files: Record<string, string>,
  entryDir: string,
  ref: string,
): string | null {
  if (!ref || EXTERNAL_REF.test(ref)) return null;
  const resolved = resolveProjectPath(entryDir, ref);
  if (resolved === null || resolved === "") return null;

  if (resolved in files) return resolved;
  const candidates: string[] = [];
  if (/\.m?js$/.test(resolved)) {
    const stem = resolved.replace(/\.m?js$/, "");
    candidates.push(`${stem}.ts`, `${stem}.tsx`, `${stem}.jsx`);
  }
  return candidates.find((c) => c in files) ?? null;
}

const attr = (attributes: string, name: string): string | null => {
  const match = attributes.match(
    new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
};

const escapeStyle = (css: string) => css.replace(/<\/style/gi, "<\\/style");
const escapeScript = (js: string) => js.replace(/<\/script/gi, "<\\/script");

export function buildPreviewHtml(
  files: Record<string, string>,
  entry: string,
  options: PreviewOptions = {},
): PreviewResult {
  const source = files[entry] ?? "";
  const entryDir = entry.includes("/") ? entry.slice(0, entry.lastIndexOf("/")) : "";
  const inlined: string[] = [];
  const unresolved: string[] = [];
  const errors: string[] = [];
  const usedStyles = new Set<string>();

  const readScript = (path: string): string => {
    try {
      return transpileFileStrict(files[path], path);
    } catch (error) {
      errors.push(error instanceof TranspileError ? error.message : String(error));
      return "";
    }
  };

  let html = source;

  // <link rel="stylesheet" href="local.css"> -> <style>
  html = html.replace(/<link\b([^>]*?)\/?>/gi, (tag, attributes: string) => {
    const rel = attr(attributes, "rel");
    const href = attr(attributes, "href");
    if (!rel || !/\bstylesheet\b/i.test(rel) || !href) return tag;
    if (EXTERNAL_REF.test(href)) return tag;
    const path = findProjectFile(files, entryDir, href);
    if (!path) {
      unresolved.push(href);
      return tag;
    }
    usedStyles.add(path);
    inlined.push(path);
    const media = attr(attributes, "media");
    return `<style data-source="${path}"${media ? ` media="${media}"` : ""}>${escapeStyle(files[path])}</style>`;
  });

  // <script src="local.js"></script> -> inline <script>
  html = html.replace(
    /<script\b([^>]*?)\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')([^>]*)>\s*<\/script>/gi,
    (tag, before: string, dq: string | undefined, sq: string | undefined, after: string) => {
      const src = dq ?? sq ?? "";
      if (EXTERNAL_REF.test(src)) return tag;
      const path = findProjectFile(files, entryDir, src);
      if (!path) {
        unresolved.push(src);
        return tag;
      }
      inlined.push(path);
      const type = attr(`${before} ${after}`, "type");
      const typeAttr = type ? ` type="${type}"` : "";
      return `<script${typeAttr} data-source="${path}">${escapeScript(readScript(path))}</script>`;
    },
  );

  // Stylesheets the HTML never links still apply (matches the previous behaviour
  // for single styles.css projects).
  const looseCss = Object.entries(files)
    .filter(([name]) => name.endsWith(".css") && !usedStyles.has(name))
    .map(([name, css]) => {
      inlined.push(name);
      return `<style data-source="${name}">${escapeStyle(css)}</style>`;
    })
    .join("\n");

  const insertAfter = (document: string, marker: RegExp, content: string): string | null => {
    const found = document.match(marker);
    if (!found || found.index === undefined) return null;
    const at = found.index + found[0].length;
    return document.slice(0, at) + content + document.slice(at);
  };
  const insertBefore = (document: string, marker: RegExp, content: string): string | null => {
    const found = document.match(marker);
    if (!found || found.index === undefined) return null;
    return document.slice(0, found.index) + content + document.slice(found.index);
  };

  if (looseCss) {
    html =
      insertBefore(html, /<\/head>/i, looseCss) ??
      insertBefore(html, /<body[^>]*>/i, looseCss) ??
      `${looseCss}\n${html}`;
  }
  if (options.bridge) {
    html =
      insertAfter(html, /<head[^>]*>/i, options.bridge) ??
      insertAfter(html, /<html[^>]*>/i, options.bridge) ??
      `${options.bridge}\n${html}`;
  }

  return { html, inlined, unresolved, errors };
}

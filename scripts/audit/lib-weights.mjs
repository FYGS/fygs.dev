// Minified + gzip size of the heavy client libraries as this app imports them (esbuild, tree-shaken).
// Used to price what moved out of the first-load JS of the routes that used to import them statically.
// Usage: node scripts/audit/lib-weights.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "../..");
const require = createRequire(path.join(root, "node_modules/.pnpm/esbuild@0.27.2/node_modules/esbuild/package.json"));
const esbuild = require("esbuild");

const cases = {
  "react-syntax-highlighter Prism (all languages), before": `export { default as P } from "react-syntax-highlighter/dist/esm/prism";`,
  "react-syntax-highlighter PrismAsyncLight entry, after": `export { default as P } from "react-syntax-highlighter/dist/esm/prism-async-light";`,
  "jspdf (+ autotable not used)": `export { jsPDF } from "jspdf";`,
  "three + OrbitControls": `import * as THREE from "three"; import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; export { THREE, OrbitControls };`,
  "d3 (import * as d3)": `import * as d3 from "d3"; export { d3 };`,
  "recharts radar chart": `export { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";`,
  "@monaco-editor/react (loader only, monaco itself is CDN/worker)": `export { default as Editor } from "@monaco-editor/react";`,
  "mermaid": `export { default } from "mermaid";`,
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "libw-"));
const rows = [];
for (const [name, code] of Object.entries(cases)) {
  const entry = path.join(root, `.tmp-libw-${rows.length}.mjs`);
  fs.writeFileSync(entry, code);
  try {
    const r = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      write: false,
      format: "esm",
      platform: "browser",
      target: "es2020",
      splitting: true,
      outdir: tmp,
      absWorkingDir: root,
      logLevel: "silent",
      define: { "process.env.NODE_ENV": '"production"' },
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
    });
    // with code splitting the entry chunk is what the first load pays for
    const entryOut = r.outputFiles.find((o) => path.basename(o.path, ".js") === path.basename(entry, ".mjs")) ?? r.outputFiles[0];
    const out = entryOut.contents;
    rows.push({ name, minKB: +(out.length / 1024).toFixed(0), gzipKB: +(zlib.gzipSync(out).length / 1024).toFixed(0) });
  } catch (e) {
    rows.push({ name, error: String(e.message).split("\n")[0].slice(0, 120) });
  } finally {
    fs.rmSync(entry, { force: true });
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
for (const r of rows) console.log((r.error ?? `${String(r.minKB).padStart(6)} KB min  ${String(r.gzipKB).padStart(5)} KB gzip`).padEnd(30), r.name);

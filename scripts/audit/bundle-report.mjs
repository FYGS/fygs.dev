// First-load JS per route (gzip) + heaviest client chunks, from a finished `next build`.
// Next 16 no longer prints the "First Load JS" table, so it is rebuilt from the manifests.
// Usage: node scripts/audit/bundle-report.mjs [distDir=.next] [out.json]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "../..");
const dist = path.resolve(root, process.argv[2] ?? ".next");
const outFile = process.argv[3];

const gz = new Map();
const raw = new Map();
function size(file) {
  if (!gz.has(file)) {
    const p = path.join(dist, file);
    if (!fs.existsSync(p)) {
      gz.set(file, 0);
      raw.set(file, 0);
    } else {
      const buf = fs.readFileSync(p);
      raw.set(file, buf.length);
      gz.set(file, zlib.gzipSync(buf, { level: 6 }).length);
    }
  }
  return gz.get(file);
}

const build = JSON.parse(fs.readFileSync(path.join(dist, "build-manifest.json"), "utf8"));
const shared = new Set([...(build.rootMainFiles ?? []), ...(build.polyfillFiles ?? [])]);

const routes = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "page_client-reference-manifest.js") {
      const ctx = { globalThis: {} };
      ctx.globalThis = ctx;
      vm.createContext(ctx);
      vm.runInContext(fs.readFileSync(p, "utf8"), ctx);
      const manifest = ctx.__RSC_MANIFEST ?? {};
      for (const [key, value] of Object.entries(manifest)) {
        const files = new Set(shared);
        for (const list of Object.values(value.entryJSFiles ?? {})) for (const f of list) if (f.endsWith(".js")) files.add(f);
        const route = key.replace(/\/page$/, "") || "/";
        routes.push({ route, files: [...files] });
      }
    }
  }
}
walk(path.join(dist, "server/app"));

const rows = routes
  .map(({ route, files }) => ({
    route,
    chunks: files.length,
    gzipKB: +(files.reduce((a, f) => a + size(f), 0) / 1024).toFixed(1),
    rawKB: +(files.reduce((a, f) => (size(f), a + raw.get(f)), 0) / 1024).toFixed(1),
  }))
  .sort((a, b) => b.gzipKB - a.gzipKB);

const sharedGz = +([...shared].reduce((a, f) => a + size(f), 0) / 1024).toFixed(1);

// Heaviest client chunks and what is inside them.
const SIGNATURES = {
  monaco: /monaco-editor|editor\.main|vs\/editor/i,
  three: /WebGLRenderer|REVISION="1\d\d"/,
  mermaid: /mermaid/i,
  recharts: /recharts/i,
  jspdf: /jspdf|jsPDF/,
  d3: /d3-selection|d3-scale|d3-array/,
  prism: /refractor|prismjs/i,
  "highlight.js": /highlight\.js|hljs/,
  tiptap: /tiptap|prosemirror/i,
  shiki: /shiki/i,
  zod: /zod/i,
  intlayer: /intlayer/i,
  "framer-motion": /framer-motion|motion-dom/,
  webcontainer: /webcontainer/i,
  stripe: /stripe/i,
  "react-pdf": /react-pdf|pdfjs/i,
};
const chunkDir = path.join(dist, "static/chunks");
const chunks = [];
(function scan(dir, rel) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const r = path.posix.join(rel, e.name);
    if (e.isDirectory()) scan(p, r);
    else if (e.name.endsWith(".js")) {
      const f = path.posix.join("static/chunks", r);
      const text = fs.readFileSync(p, "utf8");
      chunks.push({
        file: f,
        rawKB: +(text.length / 1024).toFixed(1),
        gzipKB: +(size(f) / 1024).toFixed(1),
        contains: Object.entries(SIGNATURES).filter(([, re]) => re.test(text)).map(([k]) => k),
        usedBy: routes.filter((x) => x.files.includes(f)).length,
      });
    }
  }
})(chunkDir, "");
chunks.sort((a, b) => b.rawKB - a.rawKB);

const report = {
  sharedGzipKB: sharedGz,
  routeCount: rows.length,
  totalClientChunks: chunks.length,
  totalClientRawMB: +(chunks.reduce((a, c) => a + c.rawKB, 0) / 1024).toFixed(2),
  routes: rows,
  topChunks: chunks.slice(0, 40),
};
if (outFile) fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
console.log(`shared (rootMain+polyfill) gzip: ${sharedGz} KB; routes: ${rows.length}; client chunks: ${chunks.length} (${report.totalClientRawMB} MB raw)`);
console.log("\nHeaviest first-load routes (gzip KB):");
for (const r of rows.slice(0, 25)) console.log(String(r.gzipKB).padStart(8), String(r.chunks).padStart(4), r.route);
console.log("\nMedian first-load gzip KB:", rows[Math.floor(rows.length / 2)]?.gzipKB);
console.log("\nLargest client chunks (raw KB / gzip KB / routes using it / contains):");
for (const c of chunks.slice(0, 25)) console.log(String(c.rawKB).padStart(8), String(c.gzipKB).padStart(7), String(c.usedBy).padStart(4), c.file, c.contains.join(","));

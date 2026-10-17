// Real first-load JavaScript per route, measured in Chrome (transfer size as served by `next start`,
// i.e. gzip, until 3 s of network idle after the load event) + heavy libraries present in the chunks.
// Usage: node scripts/audit/js-weight.mjs <baseUrl> <routesFile> [out.json]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = await import(
  pathToFileURL(path.join(root, "node_modules/@playwright/test/index.mjs")).href
);
const [base, routesFile, outFile] = process.argv.slice(2);
const routes = fs.readFileSync(routesFile, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#"));

const SIG = {
  monaco: /monaco/i,
  three: /WebGLRenderer/,
  mermaid: /mermaid/i,
  recharts: /recharts/i,
  jspdf: /jspdf/i,
  d3: /d3-selection|d3-scale/,
  refractor: /refractor/i,
  tiptap: /tiptap|prosemirror/i,
  webcontainer: /webcontainer/i,
  stripe: /js\.stripe\.com|stripe/i,
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
for (const route of routes) {
  const ctx = await browser.newContext();
  await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
  // Keep the service worker out of the measurement.
  await ctx.addInitScript(() => {
    try {
      Object.defineProperty(navigator, "serviceWorker", { value: undefined, configurable: true });
    } catch {}
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  const reqs = new Map();
  cdp.on("Network.responseReceived", (e) => {
    if (e.type === "Script") reqs.set(e.requestId, { url: e.response.url, bytes: 0, body: "" });
  });
  cdp.on("Network.loadingFinished", (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.bytes = e.encodedDataLength;
  });
  const row = { route };
  try {
    await page.goto(base + route, { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(3500);
    const scripts = [...reqs.entries()].map(([id, r]) => ({ id, ...r }));
    for (const s of scripts) {
      try {
        const { body } = await cdp.send("Network.getResponseBody", { requestId: s.id });
        s.sig = Object.entries(SIG).filter(([, re]) => re.test(body)).map(([k]) => k);
      } catch {
        s.sig = [];
      }
    }
    row.requests = scripts.length;
    row.jsKB = +(scripts.reduce((a, s) => a + s.bytes, 0) / 1024).toFixed(1);
    row.heavy = [...new Set(scripts.flatMap((s) => s.sig))];
    row.top = scripts
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 4)
      .map((s) => `${(s.bytes / 1024).toFixed(0)}KB ${new URL(s.url).pathname.split("/").pop()} [${s.sig.join(",")}]`);
  } catch (e) {
    row.error = String(e.message).split("\n")[0];
  }
  results.push(row);
  console.log(`${String(row.jsKB ?? "ERR").padStart(8)} KB ${String(row.requests ?? "").padStart(3)} req  ${route}  heavy=[${(row.heavy ?? []).join(",")}]`);
  await ctx.close();
}
if (outFile) fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
await browser.close();

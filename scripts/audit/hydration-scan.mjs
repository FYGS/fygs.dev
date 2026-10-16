// Loads a list of routes in headless Chrome and reports hydration-related console errors.
// Usage: node scripts/audit/hydration-scan.mjs <baseUrl> <routesFile|route,route,...> [repeat]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = await import(
  pathToFileURL(path.join(root, "node_modules/@playwright/test/index.mjs")).href
);

const [base, routesArg, repeatArg] = process.argv.slice(2);
const repeat = Number(repeatArg ?? 1);
const routes = fs.existsSync(routesArg)
  ? fs.readFileSync(routesArg, "utf8").split(/\r?\n/).filter(Boolean)
  : routesArg.split(",");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext();
await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
const bad = [];
for (const route of routes) {
  for (let i = 0; i < repeat; i++) {
    const msgs = [];
    let page;
    try { page = await ctx.newPage(); } catch (e) { console.log('newPage failed', e.message); continue; }
    page.on("console", (m) => {
      const t = m.text();
      if (m.type() === "error" || m.type() === "warning") {
        if (/hydrat|did not match|#418|#423|#425|#422|Minified React error/i.test(t)) msgs.push(t);
      }
    });
    page.on("pageerror", (e) => {
      if (/hydrat|#418|#423|#425/i.test(e.message)) msgs.push("pageerror: " + e.message);
    });
    try {
      await page.goto(base + route, { waitUntil: "load", timeout: 180000 });
      await page.waitForTimeout(2500);
    } catch (e) {
      msgs.push("NAV ERROR " + e.message.split("\n")[0]);
    }
    console.log(`${msgs.length ? "FAIL" : "ok  "} ${route} #${i + 1}`);
    if (msgs.length) console.log("   " + msgs[0].slice(0, 1500).split("\n").join("\n   "));
    if (msgs.length) bad.push({ route, i, msgs });
    await page.close();
  }
}
await browser.close();
for (const b of bad) {
  console.log("\n=== " + b.route + " (#" + (b.i + 1) + ")");
  for (const m of b.msgs) console.log(m.slice(0, 3000));
}
process.exit(bad.length ? 1 : 0);

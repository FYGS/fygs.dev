// Verifies the service worker in real Chrome against a production server (next start).
// Usage: node scripts/audit/sw-check.mjs <baseUrl>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = await import(
  pathToFileURL(path.join(root, "node_modules/@playwright/test/index.mjs")).href
);
const base = process.argv[2];
const swFile = path.join(root, "public/sw.js");

const log = (k, v) => console.log(k.padEnd(46), typeof v === "string" ? v : JSON.stringify(v));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext();
await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => {
  if (/ServiceWorker|service worker|sw\.js/i.test(m.text())) errors.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

// 1. register
await page.goto(base + "/fr/pricing", { waitUntil: "load" });
await page.waitForFunction(() => navigator.serviceWorker.getRegistration().then((r) => !!r?.active), null, { timeout: 60000 });
log("registrations", await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope + " " + (r.active?.state ?? "-"))));
log("sw.js status", await page.evaluate(() => fetch("/sw.js", { cache: "no-store" }).then((r) => r.status + " " + r.headers.get("cache-control"))));

// 2. reload so the page is controlled, then touch routes
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(3000);
log("controlled", await page.evaluate(() => !!navigator.serviceWorker.controller));
await page.evaluate(() => fetch("/api/auth/get-session").then((r) => r.status).catch(() => "err"));
await page.goto(base + "/fr/dashboard", { waitUntil: "load" }).catch(() => undefined);
await page.waitForTimeout(1500);
await page.goto(base + "/en/terms", { waitUntil: "load" }).catch(() => undefined);
await page.waitForTimeout(1500);
await page.goto(base + "/fr/pricing", { waitUntil: "load" });
await page.waitForTimeout(2500);

const cacheDump = await page.evaluate(async () => {
  const out = {};
  for (const k of await caches.keys()) out[k] = (await (await caches.open(k)).keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search);
  return out;
});
for (const [k, v] of Object.entries(cacheDump)) log("cache " + k, v.filter((u) => !u.startsWith("/_next/static")).concat(v.some((u) => u.startsWith("/_next/static")) ? [`(+${v.filter((u) => u.startsWith("/_next/static")).length} static chunks)`] : []));
const all = Object.values(cacheDump).flat();
log("API URL in any cache?", all.some((u) => u.startsWith("/api/")));
log("dashboard/auth page cached?", all.some((u) => /^\/(fr|en|es)\/(dashboard|auth|profile|admin|me)/.test(u)));
log("RSC (?_rsc) request cached?", all.some((u) => u.includes("_rsc")));

// 3. offline behaviour
await ctx.setOffline(true);
const off1 = await page.goto(base + "/fr/pricing", { waitUntil: "load" }).then((r) => r?.status()).catch((e) => "ERR " + e.message.split("\n")[0]);
log("offline, visited page", { status: off1, title: await page.title().catch(() => "?") });
const off2 = await page.goto(base + "/fr/projects", { waitUntil: "load" }).then((r) => r?.status()).catch((e) => "ERR " + e.message.split("\n")[0]);
log("offline, unvisited page", { status: off2, h1: await page.locator("h1").first().innerText().catch(() => "-"), title: await page.title().catch(() => "?") });
await ctx.setOffline(false);

// 4. update flow: change sw.js on disk, ask for an update, expect the refresh toast
await page.goto(base + "/fr/pricing", { waitUntil: "load" });
await page.waitForTimeout(2000);
const original = fs.readFileSync(swFile, "utf8");
fs.writeFileSync(swFile, original + `\n// update-check ${Date.now()}\n`);
try {
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    await reg.update();
  });
  const toast = await page
    .getByText(/nouvelle version du site est disponible/i)
    .waitFor({ timeout: 20000 })
    .then(() => "shown")
    .catch(() => "NOT shown");
  log("update toast", toast);
  log("toast action", await page.getByRole("button", { name: "Actualiser" }).count());
} finally {
  fs.writeFileSync(swFile, original);
}

// 5. sw.js missing: update() must not surface as an unhandled rejection
fs.renameSync(swFile, swFile + ".bak");
try {
  const r = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return reg.update().then(() => "ok", (e) => "rejected: " + e.message);
  });
  log("update() while sw.js is 404 (raw API)", r);
  // what the registration component does on visibilitychange: must be swallowed, not unhandled
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await page.waitForTimeout(1500);
} finally {
  fs.renameSync(swFile + ".bak", swFile);
}
log("console/page errors about the SW", errors);
await browser.close();

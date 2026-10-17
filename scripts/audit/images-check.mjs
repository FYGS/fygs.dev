// Home page images: every <img> decodes, nothing is requested from third-party image hosts.
// Usage: node scripts/audit/images-check.mjs <baseUrl> [route=/fr]
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = await import(
  pathToFileURL(path.join(root, "node_modules/@playwright/test/index.mjs")).href
);
const [base, route = "/fr"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
const page = await ctx.newPage();
const external = [];
const failed = [];
page.on("request", (r) => {
  const u = new URL(r.url());
  if (r.resourceType() === "image" && u.origin !== new URL(base).origin) external.push(u.host);
});
page.on("response", (r) => {
  if (r.request().resourceType() === "image" && r.status() >= 400) failed.push(r.status() + " " + r.url().slice(0, 140));
});
await page.goto(base + route, { waitUntil: "load" });
// lazy images: scroll through the page
for (let y = 0; y < 8000; y += 700) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(150);
}
await page.waitForTimeout(1500);
const imgs = await page.evaluate(() =>
  [...document.images].map((i) => ({ src: decodeURIComponent(i.currentSrc || i.src).slice(0, 110), w: i.naturalWidth, alt: i.alt, complete: i.complete })),
);
const contact = imgs.filter((i) => /contact|linkedin|github|gmail/i.test(i.src));
console.log("images on page:", imgs.length, "broken:", imgs.filter((i) => i.complete && i.w === 0).length);
console.log("contact card images:");
for (const i of contact) console.log(" ", i.w ? "OK " : "BROKEN", i.w + "px", JSON.stringify(i.alt), i.src);
console.log("third-party image hosts requested:", [...new Set(external)]);
console.log("image responses >= 400:", failed);
await browser.close();

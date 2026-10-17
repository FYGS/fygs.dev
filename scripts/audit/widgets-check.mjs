// Keyboard operability of custom widgets: locale modal, command palette / shortcuts, tabs, skip link.
// Usage: node scripts/audit/widgets-check.mjs <baseUrl>
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = await import(
  pathToFileURL(path.join(root, "node_modules/@playwright/test/index.mjs")).href
);
const base = process.argv[2];
const log = (k, v) => console.log(k.padEnd(52), typeof v === "string" ? v : JSON.stringify(v));
const browser = await chromium.launch({ channel: "chrome", headless: true });

// 1. Locale modal (first visit: no locale_selected cookie)
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base + "/fr", { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const dlg = page.getByRole("dialog");
  log("locale modal: dialog present", await dlg.count());
  if (await dlg.count()) {
    log("locale modal: accessible name", await dlg.first().getAttribute("aria-labelledby").then((id) => (id ? page.locator("#" + CSS_escape(id)).innerText() : "none")).catch(() => "?"));
    log("locale modal: aria-describedby", await dlg.first().getAttribute("aria-describedby"));
    const inside = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      inside.push(await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")));
    }
    log("locale modal: focus stays inside for 12 Tab presses", inside.every(Boolean));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    log("locale modal: closes on Escape", (await page.getByRole("dialog").count()) === 0);
  }
  await ctx.close();
}

// 2. Command palette / shortcuts
{
  const ctx = await browser.newContext();
  await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
  const page = await ctx.newPage();
  await page.goto(base + "/fr/blog", { waitUntil: "load" });
  await page.waitForTimeout(2500);
  for (const combo of ["Control+k", "Control+Shift+k", "Shift+?", "?"]) {
    await page.keyboard.press(combo);
    await page.waitForTimeout(600);
    const n = await page.getByRole("dialog").count();
    const combos = await page.getByRole("combobox").count();
    log(`shortcut ${combo}`, { dialogs: n, comboboxes: combos, name: n ? await page.getByRole("dialog").first().getAttribute("aria-label") : null });
    if (n) {
      const focusIn = await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
      log("  focus moved into the dialog", focusIn);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      log("  closes on Escape", (await page.getByRole("dialog").count()) === 0);
      log("  focus returned to page (not body)", await page.evaluate(() => document.activeElement !== document.body));
    }
  }
  await ctx.close();
}

// 3. Tabs (Radix): arrow keys + roving tabindex
{
  const ctx = await browser.newContext();
  await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
  const page = await ctx.newPage();
  await page.goto(base + "/fr/tech-mastry/algorithms/searching", { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const tabs = page.getByRole("tab");
  log("tabs: count", await tabs.count());
  if ((await tabs.count()) > 1) {
    await tabs.first().focus();
    const before = await page.evaluate(() => document.activeElement?.getAttribute("aria-selected"));
    await page.keyboard.press("ArrowRight");
    const after = await page.evaluate(() => ({ focusedIsTab: document.activeElement?.getAttribute("role"), label: document.activeElement?.textContent?.trim().slice(0, 30) }));
    log("tabs: ArrowRight moves focus to next tab", { before, after });
    await page.keyboard.press("Enter");
    log("tabs: selected tab has aria-selected=true", await page.evaluate(() => document.activeElement?.getAttribute("aria-selected")));
    log("tabs: tabpanel present", await page.getByRole("tabpanel").count());
  }
  // 4. Skip link: Tab once, Enter, focus lands in main
  await page.goto(base + "/fr/pricing", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.keyboard.press("Tab");
  const first = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), visible: (() => { const r = document.activeElement.getBoundingClientRect(); return r.width > 1 && r.height > 1; })() }));
  log("skip link: first Tab stop", first);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  log("skip link: Enter moves focus into main", await page.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName })));
  await ctx.close();
}
await browser.close();

function CSS_escape(id) {
  return id.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

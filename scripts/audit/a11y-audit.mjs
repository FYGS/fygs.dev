// Accessibility audit: axe-core (WCAG 2.0/2.1/2.2 A+AA + best practices) plus custom checks
// (lang, skip link, focus order/visibility, keyboard traps, reduced motion) on a list of routes.
// Usage: node scripts/audit/a11y-audit.mjs <baseUrl> <routesFile> <outJson> [maxTabs]
// Environment (all optional):
//   AUDIT_SIGNIN=email|password   sign in first, to audit the pages behind a login
//   AUDIT_VIEWPORT=390x844        default 1280x900 (use a phone size for the mobile pass)
//   AUDIT_THEME=light|dark        the site's theme (the default follows the system, which is dark here)
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { waitForSettledPage } from "./settle.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = await import(
  pathToFileURL(path.join(root, "node_modules/@playwright/test/index.mjs")).href
);
// axe-core is only a transitive dependency: resolve it the Node way (flat or hoisted install), else take the
// newest copy pnpm put in its store
function axeSourcePath() {
  try {
    return createRequire(path.join(root, "package.json")).resolve("axe-core/axe.min.js");
  } catch {
    const store = path.join(root, "node_modules/.pnpm");
    const dir = fs.existsSync(store)
      ? fs
          .readdirSync(store)
          .filter((name) => name.startsWith("axe-core@"))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
          .at(-1)
      : undefined;
    if (!dir) throw new Error("axe-core is not installed");
    return path.join(store, dir, "node_modules/axe-core/axe.min.js");
  }
}
const axeSource = fs.readFileSync(axeSourcePath(), "utf8");

const [signInEmail, signInPassword] = (process.env.AUDIT_SIGNIN ?? "").split("|");
const [viewportWidth, viewportHeight] = (process.env.AUDIT_VIEWPORT ?? "1280x900").split("x").map(Number);
const theme = process.env.AUDIT_THEME;

const [base, routesFile, outFile, maxTabsArg] = process.argv.slice(2);
const maxTabs = Number(maxTabsArg ?? 30);
const routes = fs.readFileSync(routesFile, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#"));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

let session;
if (signInEmail) {
  const loginContext = await browser.newContext();
  await loginContext.addCookies([{ name: "locale_selected", value: "true", url: base }]);
  const ip = `10.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
  const signIn = await loginContext.request.post(base + "/api/auth/sign-in/email", {
    data: { email: signInEmail, password: signInPassword },
    headers: { origin: new URL(base).origin, "x-forwarded-for": ip },
  });
  if (!signIn.ok()) throw new Error(`sign-in as ${signInEmail} answered ${signIn.status()}`);
  session = await loginContext.storageState();
  await loginContext.close();
}

for (const route of routes) {
  const ctx = await browser.newContext({
    bypassCSP: true,
    viewport: { width: viewportWidth, height: viewportHeight },
    ...(theme ? { colorScheme: theme } : {}),
    ...(session ? { storageState: session } : {}),
  });
  await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
  if (theme) await ctx.addInitScript((value) => localStorage.setItem("fygs-theme", value), theme);
  const page = await ctx.newPage();
  const entry = { route };
  try {
    await page.goto(base + route, { waitUntil: "load", timeout: 240000 });
    entry.settled = await waitForSettledPage(page);
    await page.waitForTimeout(500);
    entry.title = await page.title();
    entry.lang = await page.evaluate(() => document.documentElement.lang);

    // axe
    await page.evaluate(axeSource);
    const axe = await page.evaluate(async () => {
      const r = await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
        resultTypes: ["violations", "incomplete"],
        exclude: [["nextjs-portal"], ["next-route-announcer"]],
      });
      const sum = (list) =>
        list.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          count: v.nodes.length,
          targets: v.nodes.slice(0, 4).map((n) => ({
            target: n.target.join(" "),
            html: n.html.slice(0, 160),
            summary: (n.failureSummary || "").split("\n").slice(1, 3).join(" | ").slice(0, 220),
          })),
        }));
      return { violations: sum(r.violations), incomplete: sum(r.incomplete) };
    });
    entry.violations = axe.violations;
    entry.incomplete = axe.incomplete.map((i) => ({ id: i.id, count: i.count }));

    // Landmarks / headings / skip link
    entry.structure = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((e) => Number(e.tagName[1]));
      const first = document.querySelector("a[href], button, input, select, textarea, [tabindex]");
      return {
        h1Count: h.filter((x) => x === 1).length,
        headingLevels: h.slice(0, 40).join(""),
        mains: document.querySelectorAll("main, [role=main]").length,
        navs: document.querySelectorAll("nav, [role=navigation]").length,
        firstFocusable: first ? (first.textContent || first.getAttribute("aria-label") || "").trim().slice(0, 60) : null,
        firstFocusableHref: first?.getAttribute("href"),
        skipLink: !!document.querySelector("a[href^='#main'], a[href='#content'], a[href^='#skip'], .skip-link"),
      };
    });

    // Keyboard walk: focus visibility, traps
    const stops = [];
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press("Tab");
      const s = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const cs = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
        const shadow = cs.boxShadow && cs.boxShadow !== "none";
        const name =
          e.getAttribute("aria-label") || (e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50) || e.getAttribute("title") || "";
        return {
          tag: e.tagName.toLowerCase(),
          name,
          focusStyle: outline || shadow,
          visible: r.width > 0 && r.height > 0,
          inViewport: r.bottom > 0 && r.top < innerHeight,
          path: e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className ? "." + e.className.split(" ")[0] : ""),
        };
      });
      stops.push(s);
    }
    entry.keyboard = {
      stops: stops.length,
      noFocusStyle: stops.filter((s) => s && !s.focusStyle).map((s) => `${s.path} "${s.name}"`).slice(0, 12),
      noName: stops.filter((s) => s && !s.name).map((s) => s.path).slice(0, 12),
      lostFocus: stops.filter((s) => s === null).length,
      repeated: stops.length - new Set(stops.map((s) => s && s.path + s.name)).size,
      first5: stops.slice(0, 5).map((s) => s && `${s.tag} "${s.name}"`),
    };

    // Reduced motion: emulate, count infinite running animations (CSS + WAAPI)
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(800);
    entry.reducedMotion = await page.evaluate(() => {
      const anims = document.getAnimations().filter((a) => a.playState === "running");
      const infinite = anims.filter((a) => a.effect?.getComputedTiming().iterations === Infinity);
      return {
        running: anims.length,
        infinite: infinite.length,
        sample: infinite.slice(0, 5).map((a) => (a.animationName || a.constructor.name) + ":" + (a.effect?.target?.tagName ?? "")),
      };
    });
  } catch (e) {
    entry.error = String(e.message).split("\n")[0];
  }
  results.push(entry);
  const v = entry.violations ?? [];
  console.log(
    `${entry.error ? "ERR " : "done"} ${route} lang=${entry.lang}${entry.settled === false ? " STILL-LOADING" : ""} violations=${v.length} (${v.map((x) => x.id + ":" + x.count).join(",")})`,
  );
  await ctx.close();
}
fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
await browser.close();

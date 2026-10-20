// Smoke crawl: opens every route and reports what a visitor would notice before any accessibility rule applies:
// a server error, an uncaught exception, a console error, a failed request of the site itself, an empty page,
// or text that betrays a bug (NaN, Infinity, undefined, [object Object], Invalid Date).
// Usage: node scripts/audit/smoke-crawl.mjs <baseUrl> <routesFile> <outJson>
// Environment (optional): AUDIT_SIGNIN=email|password, AUDIT_VIEWPORT=390x844
// Routes: `node scripts/audit/list-routes.mjs` lists every page without a dynamic segment.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = await import(pathToFileURL(path.join(root, "node_modules/@playwright/test/index.mjs")).href);

const [signInEmail, signInPassword] = (process.env.AUDIT_SIGNIN ?? "").split("|");
const [viewportWidth, viewportHeight] = (process.env.AUDIT_VIEWPORT ?? "1280x900").split("x").map(Number);
const [base, routesFile, outFile] = process.argv.slice(2);
const routes = fs.readFileSync(routesFile, "utf8").split(/\r?\n/).filter((line) => line && !line.startsWith("#"));

const SUSPICIOUS = [
  [/\bNaN\b/, "NaN"],
  [/\bInfinity\b/, "Infinity"],
  [/\bundefined\b/, "undefined"],
  [/\[object Object\]/, "[object Object]"],
  [/Invalid Date/, "Invalid Date"],
  [/\bnull\b(?!\s*[:,)])/, "null"],
];
// Noise that is not the site's: the browser asking for things a dev server or an extension owns
const IGNORED_CONSOLE = [/favicon/i, /Download the React DevTools/i, /Failed to load resource.*(401|403|404)/i];

const browser = await chromium.launch({ channel: "chrome", headless: true });

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

const results = [];
for (const route of routes) {
  const ctx = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
    ...(session ? { storageState: session } : {}),
  });
  await ctx.addCookies([{ name: "locale_selected", value: "true", url: base }]);
  const page = await ctx.newPage();
  const entry = { route, problems: [] };
  const origin = new URL(base).origin;

  page.on("pageerror", (error) => entry.problems.push(`exception: ${String(error.message).slice(0, 200)}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (!IGNORED_CONSOLE.some((rule) => rule.test(text))) entry.problems.push(`console: ${text.slice(0, 200)}`);
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(origin) && !/_next\/static|\.map$|rsc=/.test(request.url())) {
      entry.problems.push(`request failed: ${request.method()} ${request.url().replace(origin, "")} ${request.failure()?.errorText ?? ""}`);
    }
  });
  page.on("response", (response) => {
    const url = response.url();
    if (url.startsWith(origin) && response.status() >= 500) entry.problems.push(`HTTP ${response.status()}: ${url.replace(origin, "")}`);
  });

  try {
    const response = await page.goto(base + route, { waitUntil: "load", timeout: 240000 });
    await page.waitForTimeout(1500);
    entry.status = response?.status();
    if (entry.status && entry.status >= 400) entry.problems.push(`HTTP ${entry.status} on the page itself`);

    const body = await page.evaluate(() => {
      const main = document.querySelector("main") ?? document.body;
      return { text: main.innerText ?? "", length: (document.body.innerText ?? "").trim().length, h1: document.querySelectorAll("h1").length };
    });
    entry.length = body.length;
    if (body.length < 40) entry.problems.push("nearly empty page");
    if (/Application error|Internal Server Error|This page could not be found/i.test(body.text)) {
      entry.problems.push(`error page shown: ${body.text.replace(/\s+/g, " ").slice(0, 80)}`);
    }
    for (const [rule, label] of SUSPICIOUS) {
      const match = body.text.match(rule);
      if (match) {
        const at = body.text.indexOf(match[0]);
        entry.problems.push(`text "${label}": …${body.text.slice(Math.max(0, at - 30), at + 30).replace(/\s+/g, " ")}…`);
      }
    }
  } catch (error) {
    entry.problems.push(`navigation: ${String(error.message).slice(0, 160)}`);
  }
  results.push(entry);
  console.log(`${entry.problems.length ? "PROBLEM" : "ok     "} ${route} (${entry.status ?? "?"})${entry.problems.length ? " " + entry.problems.length : ""}`);
  await ctx.close();
}
await browser.close();

fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
const bad = results.filter((entry) => entry.problems.length);
console.log(`\n${results.length} pages, ${bad.length} with problems`);
for (const entry of bad) {
  console.log(`\n${entry.route}`);
  for (const problem of [...new Set(entry.problems)].slice(0, 6)) console.log(`  - ${problem}`);
}

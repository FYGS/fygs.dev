// Lists every page of the app that has no dynamic segment, for the given locale (default fr), one route per line.
// Usage: node scripts/audit/list-routes.mjs [locale] [main|admin|all]
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const locale = process.argv[2] ?? "fr";
const scope = process.argv[3] ?? "all";
const routes = [];

function walk(dir, group) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^(_|\.)/.test(entry.name)) continue;
      walk(full, group);
    } else if (entry.name === "page.tsx") {
      const segments = path
        .relative(path.join(root, "app/[locale]"), dir)
        .split(path.sep)
        .filter((segment) => segment && !/^\(.*\)$/.test(segment));
      if (segments.some((segment) => segment.startsWith("["))) continue; // needs a record: the gate adds those
      routes.push(`/${locale}${segments.length ? "/" + segments.join("/") : ""}`);
    }
  }
}

if (scope === "all" || scope === "main") walk(path.join(root, "app/[locale]/(main)"), "main");
if (scope === "all" || scope === "admin") walk(path.join(root, "app/[locale]/(admin)"), "admin");
console.log([...new Set(routes)].sort().join("\n"));

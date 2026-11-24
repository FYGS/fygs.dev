// usage: node scripts/audit/lockfile-advisories.mjs path/to/pnpm-lock.yaml
// pnpm audit is blocked by the corporate Nexus: query the npm bulk advisory endpoint directly.
import fs from "node:fs";

const lock = fs.readFileSync(process.argv[2], "utf8").replace(/\r\n/g, "\n");
const section = lock.slice(lock.indexOf("\npackages:\n"), lock.indexOf("\nsnapshots:\n"));
const body = {};
for (const m of section.matchAll(/^  '?((?:@[^/@']+\/)?[^@'\s]+)@([^':\s(]+)'?:/gm)) {
  (body[m[1]] ??= new Set()).add(m[2]);
}
const payload = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, [...v]]));
const res = await fetch("https://registry.npmjs.org/-/npm/v1/security/advisories/bulk", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});
const json = await res.json();
const rows = [];
for (const [name, list] of Object.entries(json)) {
  for (const a of list) rows.push([a.severity, name, a.vulnerable_versions, a.title, a.url]);
}
const order = { critical: 0, high: 1, moderate: 2, low: 3 };
rows.sort((a, b) => order[a[0]] - order[b[0]]);
console.log(`${Object.keys(payload).length} packages checked, ${rows.length} advisories`);
for (const r of rows) console.log(r.join(" | "));

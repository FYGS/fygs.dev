// Aggregates the JSON written by a11y-audit.mjs: violations by rule with the most frequent selectors.
// Usage: node scripts/audit/summarize.mjs <audit.json> [ruleFilter]
import fs from "node:fs";

const [file, rule] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const byRule = new Map();
for (const page of data) {
  for (const v of page.violations ?? []) {
    if (rule && v.id !== rule) continue;
    const e = byRule.get(v.id) ?? { id: v.id, impact: v.impact, help: v.help, pages: [], nodes: 0, samples: new Map() };
    e.pages.push(`${page.route}(${v.count})`);
    e.nodes += v.count;
    for (const t of v.targets) {
      const key = t.target + " :: " + t.html.slice(0, 110);
      e.samples.set(key, (e.samples.get(key) ?? 0) + 1);
    }
    byRule.set(v.id, e);
  }
}
for (const e of [...byRule.values()].sort((a, b) => b.nodes - a.nodes)) {
  console.log(`\n## ${e.id} [${e.impact}] nodes=${e.nodes} pages=${e.pages.length} - ${e.help}`);
  console.log("pages:", e.pages.slice(0, 8).join(" "));
  for (const [k, n] of [...e.samples.entries()].sort((a, b) => b[1] - a[1]).slice(0, rule ? 25 : 4)) console.log(`  x${n} ${k}`);
}
console.log("\n=== custom checks ===");
for (const p of data) {
  console.log(
    p.route,
    "lang=" + p.lang,
    "h1=" + p.structure?.h1Count,
    "main=" + p.structure?.mains,
    "firstFocus=" + JSON.stringify(p.structure?.firstFocusable),
    "noFocusStyle=" + (p.keyboard?.noFocusStyle?.length ?? "-"),
    "noName=" + (p.keyboard?.noName?.length ?? "-"),
    "lost=" + p.keyboard?.lostFocus,
    "infiniteAnimsReducedMotion=" + p.reducedMotion?.infinite,
  );
}

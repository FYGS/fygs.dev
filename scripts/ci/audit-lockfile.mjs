// Blocking dependency audit for CI: node scripts/ci/audit-lockfile.mjs [pnpm-lock.yaml] [--level=high]
//
// `pnpm audit` is blocked by the corporate registry mirror, so the lockfile is checked against the npm bulk advisory
// endpoint directly (same data as `npm audit`). The job FAILS when a package at the lockfile's version has an advisory at
// or above the level (default: high) that is not in .github/audit-allowlist.json.
//
// An allow-list entry is a decision with an owner and an end date, not a silence: it names the package, the version it
// applies to, the reason (why the vulnerable code is not reachable), and an expiry date after which the job fails again so
// that the decision is taken again. See docs/security-ops-2026-10.md for the reasoning of the two entries that exist.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SEVERITY_ORDER = { critical: 0, high: 1, moderate: 2, low: 3 };

/** Package -> versions found in a pnpm-lock.yaml (v9 format: `packages:` section). */
export function packagesOfLockfile(lockText) {
  const lock = lockText.replace(/\r\n/g, "\n");
  const start = lock.indexOf("\npackages:\n");
  const end = lock.indexOf("\nsnapshots:\n");
  const section = lock.slice(start === -1 ? 0 : start, end === -1 ? undefined : end);
  const found = {};
  for (const match of section.matchAll(/^ {2}'?((?:@[^/@']+\/)?[^@'\s]+)@([^':\s(]+)'?:/gm)) {
    (found[match[1]] ??= new Set()).add(match[2]);
  }
  return Object.fromEntries(Object.entries(found).map(([name, versions]) => [name, [...versions]]));
}

/** Advisories (the registry's answer) as flat rows. */
export function rowsOfAnswer(answer) {
  const rows = [];
  for (const [name, list] of Object.entries(answer ?? {})) {
    for (const advisory of list) {
      rows.push({
        name,
        severity: advisory.severity,
        range: advisory.vulnerable_versions,
        title: advisory.title,
        url: advisory.url,
      });
    }
  }
  return rows.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
}

/**
 * Splits the rows into those that fail the job, those that are allowed (with the entry that allows them), and the
 * allow-list entries that expired or matched nothing (to clean up).
 */
export function evaluate(rows, allowlist, { level = "high", now = new Date() } = {}) {
  const threshold = SEVERITY_ORDER[level] ?? SEVERITY_ORDER.high;
  const failing = [];
  const allowed = [];
  const expired = [];
  const used = new Set();

  for (const entry of allowlist) {
    if (!entry.package || !entry.reason || !entry.expires) {
      throw new Error(`audit allow-list entry needs package, reason and expires: ${JSON.stringify(entry)}`);
    }
    if (new Date(entry.expires) < now) expired.push(entry);
  }

  for (const row of rows) {
    if ((SEVERITY_ORDER[row.severity] ?? 9) > threshold) continue;
    const entry = allowlist.find(
      (candidate) =>
        candidate.package === row.name &&
        new Date(candidate.expires) >= now &&
        (!candidate.advisory || candidate.advisory === row.url),
    );
    if (entry) {
      allowed.push({ row, entry });
      used.add(entry);
    } else {
      failing.push(row);
    }
  }
  const unused = allowlist.filter((entry) => !used.has(entry) && !expired.includes(entry));
  return { failing, allowed, expired, unused };
}

async function main() {
  const args = process.argv.slice(2);
  const lockfile = args.find((arg) => !arg.startsWith("--")) ?? "pnpm-lock.yaml";
  const level = (args.find((arg) => arg.startsWith("--level="))?.split("=")[1] ?? "high").toLowerCase();
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const allowlist = JSON.parse(fs.readFileSync(path.join(root, ".github/audit-allowlist.json"), "utf8")).entries;

  const packages = packagesOfLockfile(fs.readFileSync(lockfile, "utf8"));
  const response = await fetch("https://registry.npmjs.org/-/npm/v1/security/advisories/bulk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(packages),
  });
  if (!response.ok) throw new Error(`The advisory service answered ${response.status}`);

  const rows = rowsOfAnswer(await response.json());
  const result = evaluate(rows, allowlist, { level });
  console.log(`${Object.keys(packages).length} packages checked, ${rows.length} advisories, level ${level}`);

  for (const { row, entry } of result.allowed) {
    console.log(`allowed   ${row.severity} ${row.name} (${row.title}) until ${entry.expires}: ${entry.reason}`);
  }
  for (const entry of result.unused) console.log(`note      allow-list entry for ${entry.package} matches nothing: remove it`);
  for (const entry of result.expired) console.log(`EXPIRED   allow-list entry for ${entry.package} (ended ${entry.expires}): decide again`);
  for (const row of result.failing) {
    console.log(`FAILING   ${row.severity} ${row.name} ${row.range} | ${row.title} | ${row.url}`);
  }
  if (result.failing.length > 0) {
    console.error(`::error::${result.failing.length} advisory(ies) at ${level} or above are not allowed`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(`::error::${error.message}`);
    process.exit(1);
  });
}

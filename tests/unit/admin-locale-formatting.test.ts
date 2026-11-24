import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression: the admin pages formatted numbers with an argument-less toLocaleString().
 * The server rendered "3,899.86" (server locale en-US), the browser "3 899,86" (user locale):
 * React error #418 (hydration mismatch) on /admin and /admin/users in a production build.
 * The back office is French, so its formatting pins "fr-FR".
 */
const root = path.resolve(__dirname, "../..");
const SCOPES = ["app/[locale]/(admin)", "components/admin", "components/community/admin-dashboard.tsx", "components/ui/advanced-pagination.tsx"];

function files(target: string, out: string[] = []): string[] {
  const full = path.join(root, target);
  if (statSync(full).isFile()) return [...out, full];
  for (const name of readdirSync(full)) {
    const child = path.join(target, name);
    if (statSync(path.join(root, child)).isDirectory()) files(child, out);
    else if (/\.tsx?$/.test(name)) out.push(path.join(root, child));
  }
  return out;
}

describe("admin number and date formatting", () => {
  it("never depends on the locale of the machine that renders it", () => {
    const offenders: string[] = [];
    for (const scope of SCOPES) {
      for (const file of files(scope)) {
        const src = readFileSync(file, "utf8");
        src.split(/\r?\n/).forEach((line, i) => {
          if (/\.toLocale(Date|Time)?String\(\s*\)/.test(line)) {
            offenders.push(`${path.relative(root, file).replace(/\\/g, "/")}:${i + 1}`);
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  });
});

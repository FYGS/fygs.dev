import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate, packagesOfLockfile, rowsOfAnswer } from "../../scripts/ci/audit-lockfile.mjs";
import { ALLOWED_SECRETS, checkWorkflow } from "../../scripts/ci/check-secrets-in-workflows.mjs";
import { prerenderedNonceRoutes } from "../../scripts/ci/check-nonce-routes-dynamic.mjs";
import { usesNonceCsp } from "@/lib/csp.mjs";

const root = path.resolve(__dirname, "../..");

describe("dependency audit", () => {
  const lock = [
    "lockfileVersion: '9.0'",
    "",
    "packages:",
    "",
    "  '@aws-sdk/client-s3@3.700.0':",
    "    resolution: {integrity: sha512-x}",
    "  braces@3.0.3:",
    "    resolution: {integrity: sha512-y}",
    "  react@19.3.1:",
    "  react@18.3.1:",
    "",
    "snapshots:",
    "  noise@1.0.0:",
  ].join("\n");

  it("reads packages and versions from the packages section only", () => {
    expect(packagesOfLockfile(lock)).toEqual({
      "@aws-sdk/client-s3": ["3.700.0"],
      braces: ["3.0.3"],
      react: ["19.3.1", "18.3.1"],
    });
    expect(packagesOfLockfile(lock.replace(/\n/g, "\r\n")).braces).toEqual(["3.0.3"]);
  });

  const answer = {
    braces: [{ severity: "high", vulnerable_versions: "<3.0.3", title: "ReDoS", url: "https://github.com/advisories/GHSA-1" }],
    lodash: [
      { severity: "critical", vulnerable_versions: "<4.17.21", title: "Prototype pollution", url: "https://github.com/advisories/GHSA-2" },
      { severity: "moderate", vulnerable_versions: "<4.17.0", title: "Minor", url: "https://github.com/advisories/GHSA-3" },
    ],
  };
  const now = new Date("2026-11-02T00:00:00Z");

  it("fails on high and critical advisories that nobody decided about, sorted by severity", () => {
    const rows = rowsOfAnswer(answer);
    expect(rows.map((r: { severity: string }) => r.severity)).toEqual(["critical", "high", "moderate"]);
    const result = evaluate(rows, [], { level: "high", now });
    expect(result.failing.map((r: { name: string }) => r.name)).toEqual(["lodash", "braces"]);
  });

  it("lets a dated, justified decision through, and only while it lasts", () => {
    const rows = rowsOfAnswer(answer);
    const entry = { package: "braces", reason: "build-time only", expires: "2027-02-01" };
    const live = evaluate(rows, [entry], { level: "high", now });
    expect(live.allowed).toHaveLength(1);
    expect(live.failing.map((r: { name: string }) => r.name)).toEqual(["lodash"]);

    const lapsed = evaluate(rows, [entry], { level: "high", now: new Date("2027-02-02T00:00:00Z") });
    expect(lapsed.expired).toHaveLength(1);
    expect(lapsed.failing.map((r: { name: string }) => r.name)).toContain("braces");
  });

  it("an entry can be tied to one advisory, and an unused entry is reported", () => {
    const rows = rowsOfAnswer(answer);
    const wrong = { package: "braces", advisory: "https://github.com/advisories/OTHER", reason: "r", expires: "2027-02-01" };
    expect(evaluate(rows, [wrong], { level: "high", now }).failing.map((r: { name: string }) => r.name)).toContain("braces");
    const unused = { package: "left-pad", reason: "r", expires: "2027-02-01" };
    expect(evaluate(rows, [unused], { level: "high", now }).unused).toEqual([unused]);
  });

  it("refuses an entry without a reason or an end date", () => {
    expect(() => evaluate([], [{ package: "x", expires: "2027-01-01" }], { now })).toThrow(/reason/);
    expect(() => evaluate([], [{ package: "x", reason: "r" }], { now })).toThrow(/expires/);
  });

  it("levels: moderate is ignored at `high` and fails at `moderate`", () => {
    const rows = rowsOfAnswer({ lodash: [answer.lodash[1]] });
    expect(evaluate(rows, [], { level: "high", now }).failing).toHaveLength(0);
    expect(evaluate(rows, [], { level: "moderate", now }).failing).toHaveLength(1);
  });

  it("the repository's allow-list is well-formed and not yet expired", () => {
    const file = JSON.parse(fs.readFileSync(path.join(root, ".github/audit-allowlist.json"), "utf8"));
    expect(() => evaluate([], file.entries)).not.toThrow();
    expect(evaluate([], file.entries).expired).toEqual([]);
  });
});

describe("workflow policy", () => {
  const clean = [
    "name: x",
    "on:",
    "  pull_request:",
    "permissions:",
    "  contents: read",
    "jobs:",
    "  a:",
    "    steps:",
    "      - uses: actions/checkout@v4",
    "      - run: echo hello",
  ].join("\n");

  const rules = (text: string) => checkWorkflow(text).map((p: { rule: string }) => p.rule);

  it("accepts a minimal read-only workflow", () => {
    expect(checkWorkflow(clean)).toEqual([]);
  });

  it("refuses pull_request_target and workflow_run triggers", () => {
    expect(rules(clean.replace("pull_request:", "pull_request_target:"))).toContain("trigger");
    expect(rules(clean.replace("  pull_request:", "  workflow_run:\n    workflows: [x]"))).toContain("trigger");
    expect(rules(clean.replace("on:\n  pull_request:", "on: [pull_request_target]"))).toContain("trigger");
  });

  it("requires a top-level permissions block", () => {
    expect(rules(clean.replace("permissions:\n  contents: read\n", ""))).toContain("permissions");
  });

  it("allows test-mode secrets only, never a production-looking one", () => {
    expect(rules(`${clean}\n      - run: x\n        env:\n          K: \${{ secrets.STRIPE_TEST_SECRET_KEY }}`)).toEqual([]);
    expect(rules(`${clean}\n      - run: x\n        env:\n          K: \${{ secrets.DATABASE_URL }}`)).toEqual(["secret"]);
    expect(rules(`${clean}\n      - run: x\n        env:\n          K: \${{ secrets.STRIPE_LIVE_KEY }}`)).toContain("secret");
    expect([...ALLOWED_SECRETS].some((name) => /LIVE|PROD/i.test(name))).toBe(false);
  });

  it("refuses attacker-controlled expressions inside a run script, inline or in a block", () => {
    expect(rules(`${clean}\n      - run: echo \${{ github.event.pull_request.title }}`)).toContain("injection");
    expect(rules(`${clean}\n      - run: |\n          echo start\n          echo \${{ github.head_ref }}`)).toContain("injection");
    // the same expression in `env:` or `with:` is the safe way to pass it
    expect(rules(`${clean}\n      - run: echo "$TITLE"\n        env:\n          TITLE: \${{ github.event.pull_request.title }}`)).toEqual([]);
  });

  it("requires third-party actions to be pinned by SHA or to carry a written exception", () => {
    const third = `${clean}\n      - uses: someone/tool@v1`;
    expect(rules(third)).toContain("pin");
    expect(rules(`${clean}\n      - uses: someone/tool@${"a".repeat(40)}`)).toEqual([]);
    expect(rules(`${third} # pin-exception: kept current by Dependabot`)).toEqual([]);
    expect(rules(`${clean}\n      - uses: github/codeql-action/init@v3`)).toEqual([]);
    expect(rules(`${clean}\n      - uses: ./local-action`)).toEqual([]);
  });

  it("the repository's own workflows pass", () => {
    const directory = path.join(root, ".github/workflows");
    for (const name of fs.readdirSync(directory).filter((file) => /\.ya?ml$/.test(file))) {
      expect(checkWorkflow(fs.readFileSync(path.join(directory, name), "utf8")), name).toEqual([]);
    }
  });

  it("no workflow gives a pull request a production secret or a write token by default", () => {
    const text = fs.readFileSync(path.join(root, ".github/workflows/ci-cd.yml"), "utf8");
    expect(text).not.toMatch(/secrets\.(DATABASE_URL|REDIS_URL|BETTER_AUTH_SECRET|STRIPE_SECRET_KEY|NEXTAUTH_SECRET)/);
    expect(text).toMatch(/^permissions:\s*\n\s+contents: read/m);
    expect(text).toMatch(/sk_live_/); // the guard against a live key is there
  });
});

describe("nonce areas must not be prerendered", () => {
  const manifest = {
    routes: {
      "/fr": {},
      "/fr/formations": {},
      "/fr/dashboard/certificates": {},
      "/fr/dashboard/billing": {},
      "/en/learn/react": {},
      "/fr/auth/login": {},
    },
  };

  it("lists the prerendered pages the nonce policy would break", () => {
    expect(prerenderedNonceRoutes(manifest, (route: string) => usesNonceCsp(route))).toEqual([
      "/en/learn/react",
      "/fr/auth/login",
      "/fr/dashboard/billing",
    ]);
  });

  it("finds none when every page of the areas is rendered per request or excluded", () => {
    const fine = { routes: { "/fr": {}, "/fr/blog": {}, "/fr/dashboard/certificates": {} } };
    expect(prerenderedNonceRoutes(fine, (route: string) => usesNonceCsp(route))).toEqual([]);
    expect(prerenderedNonceRoutes({}, (route: string) => usesNonceCsp(route))).toEqual([]);
  });
});

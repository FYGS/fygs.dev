// Policy check for GitHub Actions workflows: node scripts/ci/check-secrets-in-workflows.mjs [workflowDir]
//
// A workflow runs code from the branch that triggered it. The rules below keep a pull request from reaching anything it
// should not, and fail the lint job when a workflow drifts:
//   1. no `pull_request_target` and no `workflow_run` trigger (they run with the base repository's secrets and token);
//   2. a top-level `permissions:` block (the token is read-only unless a job asks for more);
//   3. a `secrets.<NAME>` reference only for names in ALLOWED_SECRETS, and never a production-looking name;
//   4. no `${{ github.event.* }}`/`${{ github.head_ref }}` inside a `run:` script (command injection from a branch or title);
//   5. a third-party action (not actions/* or github/*) is pinned to a full commit SHA, or carries a `# pin-exception:`
//      comment saying why a tag is accepted, which Dependabot (github-actions ecosystem) keeps current.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Secrets the workflows may read. TEST-mode keys only; the deployment is not done by GitHub Actions. */
export const ALLOWED_SECRETS = new Set([
  "GITHUB_TOKEN",
  "STRIPE_TEST_SECRET_KEY",
  "STRIPE_TEST_MONTHLY_PRICE_ID",
  "STRIPE_TEST_YEARLY_PRICE_ID",
]);

const FIRST_PARTY = /^(actions|github)\//;
const SHA = /^[0-9a-f]{40}$/;

/** Violations found in one workflow file, as `{ line, rule, message }`. */
export function checkWorkflow(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const problems = [];
  const add = (index, rule, message) => problems.push({ line: index + 1, rule, message });

  if (!lines.some((line) => /^permissions:/.test(line))) add(0, "permissions", "no top-level `permissions:` block");

  let inRun = false;
  let runIndent = 0;
  lines.forEach((line, index) => {
    const code = line.replace(/\s+#.*$/, (match) => (/pin-exception/.test(match) ? match : ""));

    if (/^\s*(pull_request_target|workflow_run)\s*:/.test(line) || /\[\s*(pull_request_target|workflow_run)\b/.test(line)) {
      add(index, "trigger", "`pull_request_target` and `workflow_run` run with the base repository's secrets");
    }

    for (const match of line.matchAll(/secrets\.([A-Za-z0-9_]+)/g)) {
      if (!ALLOWED_SECRETS.has(match[1])) add(index, "secret", `secrets.${match[1]} is not an allowed secret (test-mode keys only)`);
      if (/LIVE|PROD/i.test(match[1])) add(index, "secret", `secrets.${match[1]} looks like a production secret`);
    }

    // run: blocks (inline or `run: |`)
    const runStart = /^(\s*)(?:-\s+)?run:\s*(.*)$/.exec(line);
    if (runStart) {
      runIndent = runStart[1].length;
      inRun = /^[|>][+-]?$/.test(runStart[2].trim());
      if (!inRun && /\$\{\{\s*(github\.event\.|github\.head_ref)/.test(runStart[2])) {
        add(index, "injection", "a `github.event`/`head_ref` expression inside `run:` can be controlled by whoever opens the pull request");
      }
    } else if (inRun) {
      const indent = line.length - line.trimStart().length;
      if (line.trim() !== "" && indent <= runIndent) inRun = false;
      else if (/\$\{\{\s*(github\.event\.|github\.head_ref)/.test(line)) {
        add(index, "injection", "a `github.event`/`head_ref` expression inside `run:` can be controlled by whoever opens the pull request");
      }
    }

    const uses = /^\s*(?:-\s+)?uses:\s*([^\s#]+)(.*)$/.exec(code);
    if (uses && !uses[1].startsWith("./")) {
      const [action, ref = ""] = uses[1].split("@");
      if (!FIRST_PARTY.test(action) && !SHA.test(ref) && !/pin-exception:/.test(line)) {
        add(index, "pin", `${action}@${ref} is third-party and not pinned to a commit SHA (add \`# pin-exception: <why>\` if a tag is accepted)`);
      }
    }
  });
  return problems;
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const directory = process.argv[2] ?? path.join(root, ".github/workflows");
  let failed = 0;
  for (const name of fs.readdirSync(directory).filter((file) => /\.ya?ml$/.test(file))) {
    for (const problem of checkWorkflow(fs.readFileSync(path.join(directory, name), "utf8"))) {
      failed += 1;
      console.error(`::error file=.github/workflows/${name},line=${problem.line}::[${problem.rule}] ${problem.message}`);
    }
  }
  if (failed > 0) process.exit(1);
  console.log("Workflow policy: OK");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();

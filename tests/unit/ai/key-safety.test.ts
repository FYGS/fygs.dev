import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { getAiConfig, openCompletion } from "@/lib/ai/anthropic";
import { redact, REDACTED } from "@/lib/log-redaction";

const ROOT = path.resolve(__dirname, "../../..");
const KEY = "sk-ant-api03-supersecretvalue1234";

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) out.push(full);
  }
  return out;
}

const rel = (f: string) => path.relative(ROOT, f).replace(/\\/g, "/");

// Tutorial pages show example .env snippets as text
const isTutorial = (f: string) => /(^|\/)tech-mastry\//.test(f);

describe("the Anthropic API key stays on the server", () => {
  it("is never read in a client module ('use client') or in browser-side folders", () => {
    const offenders: string[] = [];
    for (const dir of ["app", "components", "hooks", "providers", "lib", "contexts", "stores"]) {
      for (const file of walk(path.join(ROOT, dir))) {
        const src = readFileSync(file, "utf8");
        const isClient = /^\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(src);
        const touchesKey = /ANTHROPIC_API_KEY|ANTHROPIC_BASE_URL|from ["']@\/lib\/ai\/(anthropic|budget)["']/.test(src);
        if (isTutorial(rel(file))) continue;
        if ((isClient || /^(components|hooks|providers)\//.test(rel(file))) && touchesKey) offenders.push(rel(file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("is only referenced by the server-side AI config module", () => {
    const users: string[] = [];
    for (const dir of ["app", "components", "hooks", "providers", "lib"]) {
      for (const file of walk(path.join(ROOT, dir))) {
        if (isTutorial(rel(file))) continue;
        if (/process\.env\.ANTHROPIC_API_KEY|env\.ANTHROPIC_API_KEY/.test(readFileSync(file, "utf8"))) users.push(rel(file));
      }
    }
    expect(users.filter((f) => !f.startsWith("lib/ai/") && !f.endsWith(".test.ts"))).toEqual([]);
  });

  it("is not exposed through NEXT_PUBLIC_ variables or next.config env", () => {
    const config = readFileSync(path.join(ROOT, "next.config.mjs"), "utf8");
    expect(config).not.toMatch(/ANTHROPIC/);
    for (const name of [".env.example", ".env.local.example"]) {
      const file = path.join(ROOT, name);
      if (existsSync(file)) expect(readFileSync(file, "utf8")).not.toMatch(/NEXT_PUBLIC_\w*(ANTHROPIC|AI_)\w*KEY/i);
    }
  });

  it("does not serialise: JSON, spreads and the redactor never see the key", () => {
    const config = getAiConfig({ ANTHROPIC_API_KEY: KEY } as unknown as NodeJS.ProcessEnv)!;
    expect(config.apiKey).toBe(KEY); // still usable by the client code
    expect(JSON.stringify(config)).not.toContain(KEY);
    expect(JSON.stringify({ ...config })).not.toContain(KEY);
    expect(JSON.stringify(redact({ config }))).not.toContain(KEY);
  });

  it("is masked by the log redactor even when it is embedded in free text or a header object", () => {
    expect(JSON.stringify(redact({ headers: { "x-api-key": KEY } }))).toContain(REDACTED);
    expect(JSON.stringify(redact(new Error(`request failed with key ${KEY}`)))).not.toContain(KEY);
  });

  it("is sent only in the x-api-key header of the upstream call", async () => {
    const config = getAiConfig({ ANTHROPIC_API_KEY: KEY } as unknown as NodeJS.ProcessEnv)!;
    const seen: { headers: Record<string, string>; body: string }[] = [];
    const fetchImpl = (async (_url: string, init: { headers: Record<string, string>; body: string }) => {
      seen.push({ headers: init.headers, body: init.body });
      return new Response("x", { status: 500 });
    }) as unknown as typeof fetch;
    await expect(
      openCompletion({ config, system: "s", messages: [{ role: "user", content: "hi" }], maxTokens: 10, fetchImpl }),
    ).rejects.toThrow();
    expect(seen[0].headers["x-api-key"]).toBe(KEY);
    expect(seen[0].body).not.toContain(KEY);
  });
});

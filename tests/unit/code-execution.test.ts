import { describe, it, expect, vi, beforeEach } from "vitest";

const wc = vi.hoisted(() => ({
  executeInWebContainer: vi.fn(),
  executeQuickRun: vi.fn(),
  isWebContainerSupported: vi.fn(() => true),
  killCurrentProcess: vi.fn(),
}));

vi.mock("@/app/_lib/webcontainer-executor", () => wc);
vi.mock("@/app/_lib/python-executor", () => ({ executePython: vi.fn() }));

import { executeCode } from "@/app/_lib/code-execution";

const decode = (dataUrl: string) =>
  decodeURIComponent(dataUrl.replace(/^data:text\/html;charset=utf-8,/, ""));

beforeEach(() => {
  vi.clearAllMocks();
  wc.isWebContainerSupported.mockReturnValue(true);
  wc.executeInWebContainer.mockResolvedValue({ success: true, output: "", logs: ["ok"], errors: [] });
  wc.executeQuickRun.mockResolvedValue({ success: true, output: "", logs: ["ok"], errors: [] });
});

const run = (files: Record<string, string>, extra: Record<string, unknown> = {}) =>
  executeCode({ code: "", language: "html", files, ...extra });

describe("HTML projects: separate CSS/JS files run in the preview", () => {
  it("inlines script.js and styles.css (HTML + CSS template)", async () => {
    const result = await run({
      "index.html": '<html><head><link rel="stylesheet" href="styles.css"></head><body><h1>x</h1><script src="script.js"></script></body></html>',
      "styles.css": "h1{color:blue}",
      "script.js": 'console.log("from script.js")',
    });
    const html = decode(result.output);
    expect(html).toContain("h1{color:blue}");
    expect(html).toContain('console.log("from script.js")');
    expect(html).not.toContain('src="script.js"');
    expect(result.errors).toEqual([]);
    expect(wc.executeInWebContainer).not.toHaveBeenCalled();
  });

  it("runs app.ts when the page loads app.js (Vanilla TS App template)", async () => {
    const result = await run({
      "index.html": '<html><head></head><body><div id="app"></div><script src="app.js"></script></body></html>',
      "app.ts": 'const root: HTMLElement | null = document.getElementById("app"); if (root) root.textContent = "ts ran";',
    });
    const html = decode(result.output);
    expect(html).toContain('root.textContent = "ts ran"');
    expect(html).not.toContain("HTMLElement | null");
  });

  it("installs the console bridge before the project's scripts", async () => {
    const result = await run({
      "index.html": '<html><head></head><body><script src="a.js"></script></body></html>',
      "a.js": "console.log('hello')",
    });
    const html = decode(result.output);
    expect(html.indexOf("window.parent.postMessage")).toBeGreaterThan(-1);
    expect(html.indexOf("window.parent.postMessage")).toBeLessThan(html.indexOf("console.log('hello')"));
  });

  it("warns about a script that is not in the project instead of failing silently", async () => {
    const result = await run({
      "index.html": '<html><head></head><body><script src="missing.js"></script></body></html>',
    });
    expect(result.logs.join("\n")).toContain('"missing.js"');
  });

  it("reports a syntax error in a TS file with its location, and still shows the page", async () => {
    const result = await run({
      "index.html": '<html><head></head><body><script src="app.js"></script></body></html>',
      "app.ts": "let a = 1;\nconst = ;\n",
    });
    expect(result.errors[0]).toMatch(/^app\.ts:2:\d+ - /);
    expect(result.output).toMatch(/^data:text\/html/);
  });

  it("prefers the entry point when it is an HTML file", async () => {
    const result = await run(
      { "index.html": "<p>index</p>", "other.html": "<p>other</p>" },
      { entryPoint: "other.html" },
    );
    expect(decode(result.output)).toContain("<p>other</p>");
  });
});

describe("React without a bundler renders in the preview, not in Node", () => {
  it("does not send a lone component to Node (ReactDOM is not defined)", async () => {
    const result = await run(
      { "App.tsx": "function App() { return <h1>Hello</h1>; }" },
      { language: "tsx", entryPoint: "App.tsx" },
    );
    expect(wc.executeInWebContainer).not.toHaveBeenCalled();
    expect(result.output).toMatch(/^data:text\/html/);
    expect(decode(result.output)).toContain("React.createElement");
    expect(result.errors).toEqual([]);
  });

  it("a project with package.json still goes to the WebContainer (bundler/dev server)", async () => {
    await run(
      { "App.tsx": "export const App = () => null;", "package.json": '{"scripts":{"dev":"vite"}}' },
      { language: "tsx", entryPoint: "App.tsx", runScript: "dev" },
    );
    expect(wc.executeInWebContainer).toHaveBeenCalledTimes(1);
  });
});

describe("Node projects", () => {
  it("transpiles TS, runs the .js entry and maps traces back to the .ts file", async () => {
    await run({ "index.ts": "const n: number = 1; console.log(n);" }, { language: "typescript", entryPoint: "index.ts" });
    const [files, entry, options] = wc.executeInWebContainer.mock.calls[0];
    expect(entry).toBe("index.js");
    expect(files["index.js"]).toContain("const n = 1;");
    expect(options.displayNames).toEqual({ "index.js": "index.ts" });
  });

  it("does not launch node on a syntax error: reports it instead", async () => {
    const result = await run({ "index.ts": "const = ;" }, { language: "typescript", entryPoint: "index.ts" });
    expect(wc.executeInWebContainer).not.toHaveBeenCalled();
    expect(result.errors[0]).toMatch(/^index\.ts:1:\d+ - /);
  });

  it("lists every file with a syntax error", async () => {
    const result = await run({ "a.ts": "let = 1;", "b.ts": "const = ;", "c.js": "ok()" }, { language: "typescript", entryPoint: "a.ts" });
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain("a.ts");
    expect(result.errors[1]).toContain("b.ts");
  });

  it("passes the caller's timeout for plain runs and a longer one for npm scripts", async () => {
    await run({ "index.js": "1", "package.json": "{}" }, { language: "javascript", entryPoint: "index.js", timeout: 12000 });
    const options = wc.executeInWebContainer.mock.calls[0][2];
    expect(options.timeout).toBe(12000);
    expect(options.scriptTimeout).toBe(60000);
  });
});

describe("single files", () => {
  it("reports a TypeScript syntax error without running it", async () => {
    const result = await executeCode({ code: "const = ;", language: "typescript" });
    expect(wc.executeQuickRun).not.toHaveBeenCalled();
    expect(result.errors[0]).toMatch(/^index\.ts:1:\d+ - /);
  });

  it("passes the timeout to quick runs", async () => {
    await executeCode({ code: "console.log(1)", language: "javascript", timeout: 5000 });
    expect(wc.executeQuickRun).toHaveBeenCalledWith("console.log(1)", "index.js", { timeout: 5000 });
  });
});

import { describe, it, expect } from "vitest";
import { inspectCode, parseConsoleError, generateCodeAnalysis, generateDebugSuggestions } from "@/app/_services/ai-code-service";
import { generateOfflineAnswer } from "@/lib/ai/offline";
import type { AssistantRequest } from "@/lib/ai/schema";

const req = (over: Partial<AssistantRequest> & { code?: string; language?: string } = {}): AssistantRequest => {
  const { code, language, ...rest } = over;
  return {
    mode: "explain",
    locale: "en",
    messages: [{ role: "user", content: "?" }],
    context: {
      surface: "playground",
      language: language ?? "javascript",
      activeFile: code === undefined ? undefined : { name: "main.js", content: code },
    },
    ...rest,
  };
};

describe("inspectCode", () => {
  it("finds real issues on real lines", () => {
    const code = [
      "var a = 1;", // 1
      "if (a == '1') {", // 2
      "  eval('x');", // 3
      "}",
      "try { risky(); } catch (e) {}", // 5
      'const apiKey = "abcd1234efgh5678";', // 6
    ].join("\n");
    const ids = inspectCode(code, "javascript").findings.map((f) => `${f.id}@${f.line}`);
    expect(ids).toEqual(
      expect.arrayContaining(["var-usage@1", "loose-equality@2", "eval@3", "empty-catch@5", "hardcoded-secret@6"]),
    );
  });

  it("does not report things that only appear in strings or comments", () => {
    const code = 'const s = "var x == y eval(1)"; // var z == 1';
    expect(inspectCode(code, "javascript").findings).toEqual([]);
  });

  it("measures loop nesting and flags it once", () => {
    const code = ["for (let i = 0; i < n; i++) {", "  for (let j = 0; j < n; j++) {", "    if (a.includes(b)) {}", "  }", "}", "for (const x of y) { z(x); }"].join("\n");
    const info = inspectCode(code, "javascript");
    expect(info.maxLoopDepth).toBe(2);
    expect(info.findings.filter((f) => f.id === "nested-loops")).toHaveLength(1);
    expect(info.findings.find((f) => f.id === "lookup-in-loop")?.line).toBe(3);
  });

  it("sibling loops are not nested", () => {
    const code = ["for (const a of x) {", "  f(a);", "}", "for (const b of y) {", "  g(b);", "}"].join("\n");
    expect(inspectCode(code, "javascript").maxLoopDepth).toBe(1);
  });

  it("handles python loops by indentation", () => {
    const code = ["def f(xs):", "    for a in xs:", "        for b in xs:", "            pass", "    for c in xs:", "        pass"].join("\n");
    const info = inspectCode(code, "python");
    expect(info.maxLoopDepth).toBe(2);
    expect(info.functions).toEqual([{ name: "f", line: 1 }]);
  });

  it("detects recursion only when a function calls itself", () => {
    expect(inspectCode("function f(n) { return n ? f(n - 1) : 0; }", "javascript").hasRecursion).toBe(true);
    expect(inspectCode("function f(n) { return n; }\nfunction g() { return f(1); }", "javascript").hasRecursion).toBe(false);
  });

  it("python specifics", () => {
    const code = ["def f(x=[]):", "    try:", "        pass", "    except:", "        pass"].join("\n");
    const ids = inspectCode(code, "python").findings.map((f) => f.id);
    expect(ids).toEqual(expect.arrayContaining(["mutable-default", "bare-except"]));
  });

  it("is fast on a large input", () => {
    const code = "const a = 1;\n".repeat(4000);
    const t = Date.now();
    inspectCode(code, "javascript");
    expect(Date.now() - t).toBeLessThan(1000);
  });
});

describe("parseConsoleError", () => {
  it("reads a Node error and its location", () => {
    const out = "[ERROR] TypeError: Cannot read properties of undefined (reading 'x')\n    at run (main.js:7:12)";
    expect(parseConsoleError(out)).toEqual({
      name: "TypeError",
      message: "Cannot read properties of undefined (reading 'x')",
      location: { file: "main.js", line: 7, column: 12 },
    });
  });
  it("reads a Python traceback (last line wins)", () => {
    const out = 'Traceback (most recent call last):\n  File "main.py", line 3, in <module>\nZeroDivisionError: division by zero';
    expect(parseConsoleError(out)).toMatchObject({ name: "ZeroDivisionError", location: { file: "main.py", line: 3 } });
  });
  it("returns null when there is nothing wrong", () => {
    expect(parseConsoleError("hello\nworld")).toBeNull();
    expect(parseConsoleError("")).toBeNull();
  });
});

describe("legacy analyzer is honest", () => {
  it("analysis has no fabricated findings for clean code", () => {
    const a = generateCodeAnalysis("const total = [1, 2].reduce((s, n) => s + n, 0);\nconsole.log(total);", "javascript");
    expect(a.suggestions).toEqual([]);
    expect(a.complexity.space).toMatch(/not estimated/);
  });
  it("debug uses the real console error, not canned issues", () => {
    const d = generateDebugSuggestions("x", "javascript", "ReferenceError: foo is not defined\n    at main.js:1:1") as {
      error: { name: string };
      issues: unknown[];
    };
    expect(d.error.name).toBe("ReferenceError");
    expect(d.issues).toEqual([]);
  });
});

describe("generateOfflineAnswer", () => {
  it("always labels itself as offline static analysis", () => {
    expect(generateOfflineAnswer(req({ code: "let a = 1;" }))).toMatch(/Offline mode/);
    expect(generateOfflineAnswer(req({ code: "let a = 1;", locale: "fr" }))).toMatch(/Mode hors-ligne/);
  });

  it("explains the structure of the code", () => {
    const out = generateOfflineAnswer(req({ code: "function add(a, b) { return a + b; }" }));
    expect(out).toContain("`add`");
  });

  it("debug: quotes the failing line and gives guidance for the error type", () => {
    const code = "const o = undefined;\nconsole.log(o.x);";
    const out = generateOfflineAnswer({
      ...req({ code, mode: "debug" }),
      context: {
        surface: "playground",
        language: "javascript",
        activeFile: { name: "main.js", content: code },
        console: { status: "error", output: "TypeError: Cannot read properties of undefined (reading 'x')\n    at main.js:2:15" },
      },
    });
    expect(out).toContain("TypeError");
    expect(out).toContain("console.log(o.x);");
    expect(out).toMatch(/line 2/);
  });

  it("debug without console output says so", () => {
    expect(generateOfflineAnswer(req({ code: "let a", mode: "debug" }))).toMatch(/no error in the console/);
  });

  it("review lists findings with the selection's real line numbers", () => {
    const out = generateOfflineAnswer({
      ...req({ mode: "review" }),
      context: { surface: "playground", language: "javascript", selection: { text: "var a = 1;", startLine: 40 } },
    });
    expect(out).toMatch(/line 40/);
  });

  it("tests: builds a skeleton for detected functions (vitest for js, pytest for python)", () => {
    const js = generateOfflineAnswer(req({ mode: "tests", code: "function sum(a, b) { return a + b; }" }));
    expect(js).toContain('from "vitest"');
    expect(js).toContain('describe("sum"');
    const py = generateOfflineAnswer(req({ mode: "tests", language: "python", code: "def total(xs):\n    return sum(xs)" }));
    expect(py).toContain("def test_total_typical");
  });

  it("hint never contains code and escalates", () => {
    const l1 = generateOfflineAnswer(req({ mode: "hint", hintLevel: 1, code: "x" }));
    const l3 = generateOfflineAnswer(req({ mode: "hint", hintLevel: 3, code: "x" }));
    expect(l1).not.toBe(l3);
    expect(l1).not.toContain("```");
  });

  it("asks for code when there is none", () => {
    expect(generateOfflineAnswer(req({ mode: "review" }))).toMatch(/no code to analyze/);
  });
});

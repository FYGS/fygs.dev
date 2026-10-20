import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { workerMain } = require(path.resolve(__dirname, "../../../public/sandbox/runner.js")) as {
  workerMain: () => void;
};

type Message = {
  type: string;
  message?: string;
  logs?: string[];
  result?: { id: string; passed: boolean; actual: string; expected: string; error?: string };
};

/** Runs the worker body exactly as the sandbox does, in a context that only has `self` and `console`. */
function run(request: {
  code: string;
  entry: string;
  tests: Array<Record<string, unknown>>;
}): Message[] {
  const messages: Message[] = [];
  const self: { postMessage: (m: Message) => void; onmessage?: (e: { data: unknown }) => void } = {
    postMessage: (m) => messages.push(JSON.parse(JSON.stringify(m))),
  };
  vm.runInNewContext(`(${workerMain.toString()})()`, { self, console: {} });
  self.onmessage!({ data: request });
  return messages;
}

const tests = (messages: Message[]) => messages.filter((m) => m.type === "test").map((m) => m.result!);

const twoSum = `function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    if (target - nums[i] in seen) return [seen[target - nums[i]], i];
    seen[nums[i]] = i;
  }
  return [];
}`;
const twoSumTests = [
  { id: "1", input: "[2,7,11,15], 9", expected: "[0,1]" },
  { id: "2", input: "[3,2,4], 6", expected: "[1,2]" },
];

describe("sandbox worker: expected-value tests", () => {
  it("passes a correct solution", () => {
    const messages = run({ code: twoSum, entry: "twoSum", tests: twoSumTests });

    expect(tests(messages).map((t) => t.passed)).toEqual([true, true]);
    expect(messages.at(-1)).toMatchObject({ type: "done", logs: [] });
  });

  it("fails a wrong one and shows what it returned", () => {
    const [first] = tests(run({ code: "function twoSum() { return [1, 1]; }", entry: "twoSum", tests: twoSumTests }));

    expect(first).toMatchObject({ passed: false, actual: "[1,1]", expected: "[0,1]" });
  });

  it("a function that returns nothing is a failure, shown as undefined", () => {
    const [first] = tests(run({ code: "function twoSum() {}", entry: "twoSum", tests: twoSumTests }));

    expect(first).toMatchObject({ passed: false, actual: "undefined" });
  });

  it("an exception in one test is reported and the next tests still run", () => {
    const code = "function f(n) { if (n === 1) throw new TypeError('boom'); return n; }";
    const results = tests(
      run({
        code,
        entry: "f",
        tests: [
          { id: "a", input: "1", expected: "1" },
          { id: "b", input: "2", expected: "2" },
        ],
      }),
    );

    expect(results[0]).toMatchObject({ passed: false, error: "TypeError: boom" });
    expect(results[1]).toMatchObject({ passed: true });
  });

  it("compares deeply, ignoring key order", () => {
    const [t] = tests(
      run({ code: "function f() { return { b: [1, { d: 4, c: 3 }], a: 1 }; }", entry: "f", tests: [{ id: "1", input: "", expected: "{ a: 1, b: [1, { c: 3, d: 4 }] }" }] }),
    );

    expect(t.passed).toBe(true);
  });

  it("tells 1 from '1' and an array from an object", () => {
    const results = tests(
      run({
        code: "function one() { return '1'; } function arr() { return {0: 1}; }",
        entry: "one",
        tests: [{ id: "1", input: "", expected: "1" }],
      }),
    );
    expect(results[0].passed).toBe(false);

    const second = tests(run({ code: "function arr() { return {0: 1}; }", entry: "arr", tests: [{ id: "1", input: "", expected: "[1]" }] }));
    expect(second[0].passed).toBe(false);
  });

  it("accepts NaN as equal to NaN, as a result", () => {
    const [t] = tests(run({ code: "function f() { return NaN; }", entry: "f", tests: [{ id: "1", input: "", expected: "NaN" }] }));
    expect(t.passed).toBe(true);
  });

  it("gives every test fresh arguments, so a function that mutates its input cannot spoil the next test", () => {
    const code = "function sortInPlace(a) { return a.sort((x, y) => x - y); }";
    const results = tests(
      run({
        code,
        entry: "sortInPlace",
        tests: [
          { id: "1", input: "[3,1,2]", expected: "[1,2,3]" },
          { id: "2", input: "[3,1,2]", expected: "[1,2,3]" },
        ],
      }),
    );

    expect(results.map((r) => r.passed)).toEqual([true, true]);
  });
});

describe("sandbox worker: closure tests", () => {
  it("calls the check with the learner's function", () => {
    const results = tests(
      run({
        code: "function search(a, x) { return a.indexOf(x); }",
        entry: "search",
        tests: [
          { id: "found", check: "(fn) => fn([1,2,3], 2) === 1" },
          { id: "missing", check: "(fn) => fn([], 5) === -1" },
          { id: "wrong", check: "(fn) => fn([1,2,3], 3) === 0" },
        ],
      }),
    );

    expect(results.map((r) => r.passed)).toEqual([true, true, false]);
  });
});

describe("sandbox worker: trees", () => {
  const levelOrder = `function levelOrder(root) {
    if (!root) return [];
    const out = [], queue = [root];
    while (queue.length) {
      const level = [];
      for (let n = queue.length; n > 0; n--) {
        const node = queue.shift();
        level.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      out.push(level);
    }
    return out;
  }`;

  it("hands over the tree a level-order array describes", () => {
    const results = tests(
      run({
        code: levelOrder,
        entry: "levelOrder",
        tests: [
          { id: "1", input: "[3,9,20,null,null,15,7]", expected: "[[3],[9,20],[15,7]]", adapter: "tree" },
          { id: "2", input: "[1]", expected: "[[1]]", adapter: "tree" },
          { id: "3", input: "[]", expected: "[]", adapter: "tree" },
          { id: "4", input: "[1,null,2,3]", expected: "[[1],[2],[3]]", adapter: "tree" },
        ],
      }),
    );

    expect(results.map((r) => r.passed)).toEqual([true, true, true, true]);
  });
});

describe("sandbox worker: bad code", () => {
  it("reports a syntax error as a compile error, without running tests", () => {
    const messages = run({ code: "function f( {", entry: "f", tests: twoSumTests });

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ type: "compileError" });
    expect(messages[0].message).toMatch(/SyntaxError/);
  });

  it("names the function the learner forgot to write", () => {
    const messages = run({ code: "const x = 1;", entry: "twoSum", tests: twoSumTests });

    expect(messages[0]).toEqual({ type: "compileError", message: "La fonction twoSum n'est pas définie" });
  });

  it("a top-level exception is a compile error too", () => {
    const messages = run({ code: "throw new Error('nope'); function f() {}", entry: "f", tests: twoSumTests });

    expect(messages[0]).toMatchObject({ type: "compileError", message: "Error: nope" });
  });

  it("refuses an entry name that is not an identifier", () => {
    const messages = run({ code: "function f() {}", entry: "f(); fetch('/x')", tests: twoSumTests });

    expect(messages[0]).toMatchObject({ type: "compileError", message: "Error: Invalid function name" });
  });
});

describe("sandbox worker: script mode", () => {
  const script = (code: string) => run({ mode: "script", code } as unknown as Parameters<typeof run>[0]);

  it("runs the code and returns what it returned", () => {
    const [message] = script("const a = [1, 2]; return a.map((n) => n * 2);");

    expect(message).toMatchObject({ type: "script", ok: true, value: "[2,4]" });
  });

  it("returns what was logged, and no value when nothing is returned", () => {
    const [message] = script("console.log('hello', 42);");

    expect(message).toMatchObject({ type: "script", ok: true, logs: ["hello 42"] });
    expect(message.value).toBeUndefined();
  });

  it("reports an exception with the logs written before it", () => {
    const [message] = script("console.log('before'); null.x;");

    expect(message).toMatchObject({ type: "script", ok: false, logs: ["before"] });
    expect(message.error).toMatch(/^TypeError/);
  });

  it("reports a syntax error", () => {
    const [message] = script("let = ;");

    expect(message).toMatchObject({ type: "script", ok: false });
    expect(message.error).toMatch(/SyntaxError/);
  });
});

describe("sandbox worker: console", () => {
  it("collects what the code logs, to show it to the learner", () => {
    const messages = run({
      code: "function f(n) { console.log('n =', n); console.warn({ a: 1 }); return n; }",
      entry: "f",
      tests: [{ id: "1", input: "7", expected: "7" }],
    });

    expect(messages.at(-1)?.logs).toEqual(["n = 7", '{"a":1}']);
  });

  it("caps the number and the length of the lines", () => {
    const messages = run({
      code: "function f() { for (let i = 0; i < 500; i++) console.log('x'.repeat(5000)); return 1; }",
      entry: "f",
      tests: [{ id: "1", input: "", expected: "1" }],
    });

    const logs = messages.at(-1)!.logs!;
    expect(logs).toHaveLength(100);
    expect(logs[0].length).toBeLessThanOrEqual(2001);
  });
});

import { z } from "zod";

/**
 * Local (offline) code analyzer.
 *
 * This is NOT a language model. It is a small set of deterministic static
 * checks (regular expressions and brace/indent depth counting) that run in the
 * server process. It is used when no model API key is configured, and by the
 * legacy /api/ai/* routes and the `analyzeCode` server action. Everything it
 * reports points at real lines of the code it was given; it never invents
 * findings, and it says so when it cannot tell.
 */

// Define the types for AI code analysis
export const CodeAnalysisSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum([
        "optimization",
        "bug",
        "security",
        "style",
        "performance",
        "logic",
      ]),
      description: z.string(),
      lineNumber: z.number().optional(),
      severity: z.enum(["info", "warning", "critical"]),
      code: z.string().optional(),
    })
  ),
  explanation: z.string(),
  complexity: z.object({
    time: z.string(),
    space: z.string(),
    score: z.number().min(1).max(10),
  }),
  summary: z.string(),
});

export type CodeAnalysis = z.infer<typeof CodeAnalysisSchema>;

export const CodeHintSchema = z.object({
  hint: z.string(),
  code: z.string().optional(),
  explanation: z.string(),
});

export type CodeHint = z.infer<typeof CodeHintSchema>;

export type RequestType =
  | "analyze"
  | "explain"
  | "optimize"
  | "debug"
  | "hint"
  | "chat";

export interface AICodeAssistRequest {
  code: string;
  language: string;
  query?: string;
  challengeId?: string;
  context?: string;
  requestType: RequestType;
}

// ─── Static inspection ───────────────────────────────────────────────────────

export type FindingId =
  | "var-usage"
  | "loose-equality"
  | "eval"
  | "inner-html"
  | "document-write"
  | "hardcoded-secret"
  | "empty-catch"
  | "bare-except"
  | "mutable-default"
  | "todo"
  | "any-type"
  | "infinite-loop"
  | "nested-loops"
  | "lookup-in-loop"
  | "unhandled-await";

export interface Finding {
  id: FindingId;
  /** 1-based line the finding points at. */
  line: number;
  type: "optimization" | "bug" | "security" | "style" | "performance" | "logic";
  severity: "info" | "warning" | "critical";
}

export interface CodeFunction {
  name: string;
  line: number;
}

export interface Inspection {
  language: string;
  lineCount: number;
  functions: CodeFunction[];
  classes: string[];
  /** Deepest nesting of for/while loops (0 when there is none). */
  maxLoopDepth: number;
  hasRecursion: boolean;
  hasErrorHandling: boolean;
  usesAsync: boolean;
  concepts: string[];
  findings: Finding[];
}

const PY = new Set(["python", "py"]);
const JS_LIKE = new Set(["javascript", "typescript", "js", "ts", "jsx", "tsx"]);

const FUNCTION_PATTERNS: RegExp[] = [
  /\bfunction\s*\*?\s+([A-Za-z_$][\w$]*)\s*\(/,
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*(?::\s*[^=]+)?=>|[A-Za-z_$][\w$]*\s*=>)/,
  /\bdef\s+([A-Za-z_]\w*)\s*\(/,
];

const SECRET = /\b(?:api[_-]?key|secret|passw(?:or)?d|token)\b\s*[:=]\s*["'`][^"'`\s]{8,}["'`]/i;

/** Blank out string contents and comments so that patterns do not match inside them. */
function stripStringsAndComments(line: string, python: boolean): string {
  const noStrings = line.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""');
  return python ? noStrings.replace(/#.*$/, "") : noStrings.replace(/\/\/.*$/, "");
}

/** Run the static checks. Pure and fast: safe on any input up to the action's size cap. */
export function inspectCode(code: string, language: string): Inspection {
  const lang = language.toLowerCase();
  const python = PY.has(lang);
  const jsLike = JS_LIKE.has(lang);
  const lines = code.replace(/\r\n?/g, "\n").split("\n");

  const functions: CodeFunction[] = [];
  const classes: string[] = [];
  const findings: Finding[] = [];
  const push = (f: Finding) => {
    if (!findings.some((x) => x.id === f.id && x.line === f.line)) findings.push(f);
  };

  // Loop nesting: brace depth for C-like languages, indentation for Python
  const loopStack: number[] = [];
  let braceDepth = 0;
  let maxLoopDepth = 0;
  let nestedReported = false;
  let hasTry = false;
  let firstAwaitLine = 0;

  lines.forEach((raw, index) => {
    const n = index + 1;
    const line = stripStringsAndComments(raw, python);
    const trimmed = line.trim();
    if (!trimmed) return;
    const indent = raw.length - raw.trimStart().length;

    for (const pattern of FUNCTION_PATTERNS) {
      const m = pattern.exec(line);
      if (m) {
        functions.push({ name: m[1], line: n });
        break;
      }
    }
    const cls = /^\s*(?:export\s+)?(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/.exec(line);
    if (cls) classes.push(cls[1]);

    // Loops
    let depthBefore = 0;
    let netOpens = 0;
    if (python) {
      while (loopStack.length && indent <= loopStack[loopStack.length - 1]) loopStack.pop();
    } else {
      const opens = (line.match(/\{/g) ?? []).length;
      const closes = (line.match(/\}/g) ?? []).length;
      depthBefore = braceDepth;
      netOpens = opens - closes;
      braceDepth = Math.max(0, depthBefore + netOpens);
      while (loopStack.length && braceDepth <= loopStack[loopStack.length - 1]) loopStack.pop();
    }
    const isLoopStart = python
      ? /^\s*(?:for|while)\b/.test(line)
      : /^\s*(?:\}\s*)?(?:for|while)\b|\.forEach\s*\(/.test(line);

    if (isLoopStart) {
      const depthHere = loopStack.length + 1;
      maxLoopDepth = Math.max(maxLoopDepth, depthHere);
      if (depthHere >= 2 && !nestedReported) {
        nestedReported = true;
        push({ id: "nested-loops", line: n, type: "performance", severity: "info" });
      }
      if (/\bwhile\s*\(\s*(?:true|1)\s*\)|^\s*while\s+True\s*:/.test(line)) {
        push({ id: "infinite-loop", line: n, type: "logic", severity: "warning" });
      }
      // A loop whose body is on the same line (no opening brace) never needs a stack entry
      if (python) loopStack.push(indent);
      else if (netOpens > 0) loopStack.push(depthBefore);
    } else if (loopStack.length > 0) {
      const lookup = python ? /\.(?:index|count)\s*\(/ : /\.(?:indexOf|includes|find|findIndex)\s*\(/;
      if (lookup.test(line)) push({ id: "lookup-in-loop", line: n, type: "performance", severity: "info" });
    }

    // Style, bug and security checks
    if (jsLike) {
      if (/(^|[^\w$.])var\s+[A-Za-z_$]/.test(line)) push({ id: "var-usage", line: n, type: "style", severity: "info" });
      if (/(^|[^=!<>])==(?!=)|!=(?!=)/.test(line.replace(/=>/g, ""))) {
        push({ id: "loose-equality", line: n, type: "bug", severity: "warning" });
      }
      if (/(^|[^\w$.])eval\s*\(/.test(line)) push({ id: "eval", line: n, type: "security", severity: "critical" });
      if (/\.(?:innerHTML|outerHTML)\s*=|dangerouslySetInnerHTML/.test(line)) {
        push({ id: "inner-html", line: n, type: "security", severity: "warning" });
      }
      if (/document\.write\s*\(/.test(line)) push({ id: "document-write", line: n, type: "security", severity: "warning" });
      if (/catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(line)) push({ id: "empty-catch", line: n, type: "bug", severity: "warning" });
      if (lang === "typescript" || lang === "ts" || lang === "tsx") {
        if (/:\s*any\b|\bas\s+any\b|<any>/.test(line)) push({ id: "any-type", line: n, type: "style", severity: "info" });
      }
      if (/\btry\s*\{/.test(line)) hasTry = true;
      if (!firstAwaitLine && /\bawait\b/.test(line)) firstAwaitLine = n;
    }
    if (python) {
      if (/^\s*except\s*:/.test(line)) push({ id: "bare-except", line: n, type: "bug", severity: "warning" });
      if (/^\s*def\s+\w+\s*\([^)]*=\s*(?:\[\]|\{\}|set\(\))/.test(line)) {
        push({ id: "mutable-default", line: n, type: "bug", severity: "warning" });
      }
      if (/^\s*try\s*:/.test(line)) hasTry = true;
    }
    if (SECRET.test(raw)) push({ id: "hardcoded-secret", line: n, type: "security", severity: "critical" });
    if (/\b(?:TODO|FIXME|HACK)\b/.test(raw)) push({ id: "todo", line: n, type: "style", severity: "info" });
  });

  if (firstAwaitLine && !hasTry) {
    push({ id: "unhandled-await", line: firstAwaitLine, type: "bug", severity: "info" });
  }

  const hasRecursion = functions.some((fn, i) => {
    // The function's name called again inside its own body (up to the next function)
    const next = functions[i + 1];
    const name = fn.name.replace(/\$/g, "\\$");
    let body = lines.slice(fn.line - 1, next ? next.line - 1 : lines.length).join("\n");
    // `function f(` / `def f(` is the declaration itself, not a call
    body = body.replace(new RegExp(`(?:function\\s*\\*?\\s+|def\\s+)${name}\\s*\\(`), "");
    return new RegExp(`(?<![\\w$.])${name}\\s*\\(`).test(body);
  });
  const usesAsync = /\basync\b|\bawait\b|\bPromise\b|\bfetch\s*\(|setTimeout|\basyncio\b/.test(code);

  const concepts: string[] = [];
  if (maxLoopDepth > 0) concepts.push("loops");
  if (hasRecursion) concepts.push("recursion");
  if (hasTry) concepts.push("error-handling");
  if (classes.length > 0) concepts.push("classes");
  if (usesAsync) concepts.push("async");
  if (/\.(?:map|filter|reduce)\s*\(|\blambda\b|\bsorted\s*\(/.test(code)) concepts.push("functional");
  if (/\bnew\s+(?:Map|Set|WeakMap)\b|\bdict\s*\(|\bset\s*\(/.test(code)) concepts.push("collections");
  if (/=>/.test(code)) concepts.push("arrow-functions");
  if (/\b(?:const|let)\s*[{[]/.test(code)) concepts.push("destructuring");
  if (/\.\.\.\w/.test(code)) concepts.push("spread");

  findings.sort((a, b) => a.line - b.line);
  return {
    language,
    lineCount: lines.length,
    functions,
    classes,
    maxLoopDepth,
    hasRecursion,
    hasErrorHandling: hasTry,
    usesAsync,
    concepts,
    findings,
  };
}

/** What a failed run printed, reduced to the useful facts. */
export interface ParsedError {
  name?: string;
  message: string;
  /** The first file:line:col location mentioned, if any. */
  location?: { file: string; line: number; column?: number };
}

export function parseConsoleError(output: string): ParsedError | null {
  if (!output.trim()) return null;
  const lines = output.split(/\r?\n/);
  let name: string | undefined;
  let message = "";
  // The last "XxxError: message" line (Python prints it last, Node near the top)
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = /^\s*(?:\[ERROR\]\s*)?(?:Uncaught\s+)?((?:[A-Z][A-Za-z]*)?(?:Error|Exception))\s*:\s*(.+)$/.exec(lines[i]);
    if (m) {
      name = m[1];
      message = m[2].trim();
      break;
    }
  }
  if (!name) {
    const fallback = lines.find((l) => /\berror\b|\bexception\b|traceback/i.test(l));
    if (!fallback) return null;
    message = fallback.replace(/^\s*\[ERROR\]\s*/, "").trim();
  }
  let location: ParsedError["location"];
  const loc =
    /([\w@./\\-]+\.(?:[jt]sx?|mjs|cjs|py|html)):(\d+)(?::(\d+))?/.exec(output) ??
    /File "([^"]+)", line (\d+)/.exec(output);
  if (loc) {
    location = { file: loc[1], line: Number(loc[2]), column: loc[3] ? Number(loc[3]) : undefined };
  }
  return { name, message, location };
}

// ─── Legacy API (server action + /api/ai/* routes) ───────────────────────────

export function estimateTimeComplexity(info: Inspection): string {
  if (info.hasRecursion && info.maxLoopDepth === 0) return "depends on the recursion (not computed)";
  if (info.maxLoopDepth === 0) return "O(1) for the visible statements";
  if (info.maxLoopDepth === 1) return "O(n)";
  if (info.maxLoopDepth === 2) return "O(n^2)";
  return `O(n^${info.maxLoopDepth})`;
}

const FINDING_TEXT: Record<FindingId, string> = {
  "var-usage": "`var` is function-scoped and hoisted; prefer `const` or `let`.",
  "loose-equality": "Loose equality (`==`/`!=`) converts types silently; prefer `===`/`!==`.",
  eval: "`eval` runs arbitrary code and is a security risk; avoid it.",
  "inner-html": "Assigning HTML from strings can enable XSS; prefer `textContent` or a sanitizer.",
  "document-write": "`document.write` is blocking and unsafe; build DOM nodes instead.",
  "hardcoded-secret": "This looks like a hard-coded secret. Move it to an environment variable and rotate it.",
  "empty-catch": "The catch block is empty, so errors are silently swallowed.",
  "bare-except": "A bare `except:` also catches KeyboardInterrupt/SystemExit; catch a specific exception.",
  "mutable-default": "A mutable default argument is shared between calls; use `None` and create it inside.",
  todo: "A TODO/FIXME marker remains here.",
  "any-type": "`any` turns off type checking here; prefer a precise type or `unknown`.",
  "infinite-loop": "This loop has a constant true condition; make sure a `break`/`return` can be reached.",
  "nested-loops": "Nested loops: the work grows with the product of the sizes. A Map/Set lookup can often replace the inner loop.",
  "lookup-in-loop": "A linear search (`indexOf`/`includes`/`find`) inside a loop makes this quadratic; a Set or Map gives O(1) lookups.",
  "unhandled-await": "`await` without any try/catch in this file: a rejected promise will surface as an unhandled error.",
};

export function describeFinding(id: FindingId): string {
  return FINDING_TEXT[id];
}

export function generateCodeAnalysis(
  code: string,
  language: string
): CodeAnalysis {
  const info = inspectCode(code, language);
  const suggestions = info.findings.map((f) => ({
    type: f.type,
    description: FINDING_TEXT[f.id],
    lineNumber: f.line,
    severity: f.severity,
  }));
  const score = Math.min(
    10,
    1 + info.maxLoopDepth * 2 + (info.hasRecursion ? 2 : 0) + Math.floor(info.lineCount / 100),
  );

  return {
    suggestions,
    explanation: `Static check of ${info.lineCount} lines of ${language}: ${info.functions.length} function(s), ${
      info.maxLoopDepth > 0 ? `loops nested up to ${info.maxLoopDepth} deep` : "no loops"
    }${info.hasRecursion ? ", recursion detected" : ""}, ${
      info.hasErrorHandling ? "error handling present" : "no try/catch"
    }. This is a pattern-based analysis, not a full review.`,
    complexity: {
      time: estimateTimeComplexity(info),
      space: "not estimated by the offline analyzer",
      score,
    },
    summary: `${suggestions.length} point(s) found by static checks (heuristic, may miss issues).`,
  };
}

export function generateCodeExplanation(
  code: string,
  language: string,
  query?: string
): Record<string, unknown> {
  const info = inspectCode(code, language);
  const lineByLine = code
    .split("\n")
    .map((line, index) => {
      if (!line.trim()) return null;
      return {
        line: index + 1,
        code: line,
        explanation: `Line ${index + 1}: ${getLineExplanation(line)}`,
      };
    })
    .filter(Boolean);

  return {
    overview: `${language} code, ${info.lineCount} lines: ${
      info.functions.length > 0
        ? `defines ${info.functions.map((f) => `\`${f.name}\``).join(", ")}`
        : "no function definitions found"
    }${info.classes.length > 0 ? `; classes: ${info.classes.join(", ")}` : ""}.`,
    lineByLine,
    concepts: info.concepts,
    query: query
      ? {
          question: query,
          answer: generateQueryResponse(query, info),
        }
      : null,
  };
}

export function generateOptimizationSuggestions(
  code: string,
  language: string
): Record<string, unknown> {
  const info = inspectCode(code, language);
  const suggestions = info.findings
    .filter((f) => f.type === "performance")
    .map((f) => ({
      title: f.id === "nested-loops" ? "Nested loops" : "Linear lookup inside a loop",
      description: FINDING_TEXT[f.id],
      lineNumber: f.line,
    }));

  return {
    suggestions,
    optimizedCode: null,
    explanation:
      suggestions.length > 0
        ? "These spots are likely candidates. The offline analyzer does not rewrite code or measure speed."
        : "No obvious performance pattern was detected by the static checks. The offline analyzer does not rewrite code or measure speed.",
  };
}

export function generateDebugSuggestions(
  code: string,
  language: string,
  consoleOutput?: string
): Record<string, unknown> {
  const info = inspectCode(code, language);
  const parsed = consoleOutput ? parseConsoleError(consoleOutput) : null;
  const issues = info.findings
    .filter((f) => f.type === "bug" || f.type === "logic")
    .map((f) => ({
      type: f.id,
      lineNumber: f.line,
      description: FINDING_TEXT[f.id],
    }));

  return {
    error: parsed,
    issues,
    suggestions: [
      "Read the error message and the line it points to first.",
      "Print the values involved just before the failing line to check your assumptions.",
      "Reduce the code to the smallest example that still fails.",
    ],
  };
}

// Hints for the known demo challenges; anything else gets a generic nudge.
export function generateHint(
  challengeId: string,
  _code: string
): CodeHint {
  const hints: Record<string, CodeHint> = {
    "1": {
      hint: "Try using a hash map (object) to store each number and its index as you iterate through the array.",
      code: "function twoSum(nums, target) {\n  const seen = {};\n  \n  for (let i = 0; i < nums.length; i++) {\n    // Your logic here\n  }\n}",
      explanation:
        "By storing each number in a hash map, you can check if the complement (target - current number) exists in constant time.",
    },
    "2": {
      hint: "Use a stack data structure to keep track of opening brackets and pop them when you encounter closing brackets.",
      code: "function isValid(s) {\n  const stack = [];\n  \n  for (let char of s) {\n    // Your logic here\n  }\n  \n  return stack.length === 0;\n}",
      explanation:
        "A stack is perfect for this problem because brackets follow a last-in-first-out pattern.",
    },
  };

  return (
    hints[challengeId] || {
      hint: "Break down the problem into smaller steps. What's the core operation you need to perform?",
      explanation:
        "Sometimes the best approach is to start with a simple solution and then optimize.",
    }
  );
}

export function generateChatResponse(
  code: string,
  language: string,
  query: string
): Record<string, unknown> {
  const info = inspectCode(code, language);
  return {
    response: `The full AI tutor is not configured on this server, so I can only run static checks. For your question "${query.slice(0, 200)}": the ${language} code has ${info.functions.length} function(s) and ${info.findings.length} point(s) worth a look (use the analyze, explain or debug actions for details).`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLineExplanation(line: string): string {
  const l = line.trim();
  if (/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\b|^def\s/.test(l)) return "Defines a function";
  if (/^(?:export\s+)?class\b/.test(l)) return "Declares a class";
  if (/^for\b/.test(l)) return "Starts a for loop";
  if (/^while\b/.test(l)) return "Starts a while loop";
  if (/^(?:\}\s*)?(?:else\s+)?if\b|^elif\b/.test(l)) return "Conditional branch";
  if (/^return\b/.test(l)) return "Returns a value";
  if (/^(?:const|let|var)\b/.test(l)) return "Declares a variable";
  if (/^(?:import|from)\b/.test(l)) return "Imports from another module";
  if (/^export\b/.test(l)) return "Exports for use in other modules";
  if (/^try\b/.test(l)) return "Starts a block whose errors are caught below";
  if (/^(?:\}\s*)?(?:catch|except)\b/.test(l)) return "Handles errors from the try block";
  if (/\bawait\b/.test(l)) return "Waits for an asynchronous result";
  return "Statement";
}

function generateQueryResponse(query: string, info: Inspection): string {
  const q = query.toLowerCase();
  if (q.includes("time complexity") || q.includes("complexit")) {
    return `Judging only by loop nesting, the time cost is ${estimateTimeComplexity(info)}. This is an estimate from patterns, not a proof.`;
  }
  if (q.includes("recurs")) {
    return info.hasRecursion
      ? "A function calls itself, so the code uses recursion."
      : "No function calling itself was detected.";
  }
  return "The offline analyzer cannot answer free-form questions; it only runs static checks.";
}

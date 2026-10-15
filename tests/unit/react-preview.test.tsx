/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/app/_lib/webcontainer-executor", () => ({
  executeInWebContainer: vi.fn(),
  executeQuickRun: vi.fn(),
  isWebContainerSupported: () => true,
  killCurrentProcess: vi.fn(),
}));
vi.mock("@/app/_lib/python-executor", () => ({ executePython: vi.fn() }));

import { executeCode } from "@/app/_lib/code-execution";

/**
 * Run the preview page's own script (the last inline <script>) against stub
 * React/ReactDOM globals, as the iframe would.
 */
function runPreview(output: string) {
  const html = decodeURIComponent(output.replace(/^data:text\/html;charset=utf-8,/, ""));
  document.body.innerHTML = '<div id="root"></div>';
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const code = scripts[scripts.length - 1];

  const render = vi.fn();
  const createRoot = vi.fn(() => ({ render }));
  const legacyRender = vi.fn();
  const React = { createElement: vi.fn((component: unknown) => ({ component })) };
  const ReactDOM = { createRoot, render: legacyRender };
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  new Function("React", "ReactDOM", "document", "window", code)(React, ReactDOM, document, window);
  const result = { render, createRoot, legacyRender, React, warnings: warn.mock.calls.map((c) => String(c[0])) };
  warn.mockRestore();
  return result;
}

const run = (files: Record<string, string>, entryPoint: string, language = "jsx") =>
  executeCode({ code: "", language, files, entryPoint });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("React preview (no bundler)", () => {
  it("template style: a file that renders itself with the React/ReactDOM globals", async () => {
    const result = await run(
      {
        "App.jsx": `function App() { return React.createElement("h1", null, "hi"); }
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));`,
      },
      "App.jsx",
    );
    expect(result.errors).toEqual([]);
    const preview = runPreview(result.output);
    expect(preview.warnings.filter((w) => /not found/i.test(w))).toEqual([]);
    // rendered once by the user's own code, not a second time by the preview
    expect(preview.render).toHaveBeenCalledTimes(1);
  });

  it("renders a component that only exports itself (export default)", async () => {
    const result = await run(
      { "index.jsx": `export default function Counter() { return React.createElement("p", null, "0"); }` },
      "index.jsx",
    );
    const preview = runPreview(result.output);
    expect(preview.createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(preview.render).toHaveBeenCalledTimes(1);
  });

  it("renders a named App export", async () => {
    const result = await run(
      { "index.tsx": `export const App = () => React.createElement("p", null, "x");` },
      "index.tsx",
      "tsx",
    );
    expect(runPreview(result.output).render).toHaveBeenCalledTimes(1);
  });

  it("supports TypeScript and JSX syntax", async () => {
    const result = await run(
      { "index.tsx": `type P = { n: number };\nconst Box = ({ n }: P) => <b>{n}</b>;\nexport default function App() { return <Box n={1} />; }` },
      "index.tsx",
      "tsx",
    );
    expect(result.errors).toEqual([]);
    expect(runPreview(result.output).render).toHaveBeenCalledTimes(1);
  });

  it("resolves ES imports between project files and ignores CSS imports", async () => {
    const result = await run(
      {
        "index.jsx": `import Button from "./Button";\nimport "./styles.css";\nexport default function App() { return Button(); }`,
        "Button.jsx": `export default function Button() { return React.createElement("button", null, "ok"); }`,
        "styles.css": "button{color:red}",
      },
      "index.jsx",
    );
    expect(decodeURIComponent(result.output)).toContain("button{color:red}");
    const preview = runPreview(result.output);
    expect(preview.warnings.filter((w) => /not found/i.test(w))).toEqual([]);
    expect(preview.render).toHaveBeenCalledTimes(1);
  });

  it("maps 'react' and 'react-dom/client' imports to the CDN globals", async () => {
    const result = await run(
      {
        "index.jsx": `import React from "react";\nimport { createRoot } from "react-dom/client";\ncreateRoot(document.getElementById("root")).render(React.createElement("div"));`,
      },
      "index.jsx",
    );
    const preview = runPreview(result.output);
    expect(preview.createRoot).toHaveBeenCalledTimes(1);
    expect(preview.render).toHaveBeenCalledTimes(1);
  });

  it("warns when an import matches no file", async () => {
    const result = await run({ "index.jsx": `import X from "./Nope";\nexport default () => X;` }, "index.jsx");
    expect(runPreview(result.output).warnings.join("\n")).toContain("Module not found");
  });

  it("reports a JSX syntax error without opening a preview", async () => {
    const result = await run({ "App.jsx": "const = <div" }, "App.jsx");
    expect(result.output).toBe("");
    expect(result.errors[0]).toMatch(/^App\.jsx:1:\d+ - /);
  });
});

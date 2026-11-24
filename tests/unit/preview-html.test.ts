import { describe, it, expect } from "vitest";
import {
  buildPreviewHtml,
  findProjectFile,
  resolveProjectPath,
} from "@/app/_lib/preview-html";

const page = (head: string, body: string) =>
  `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;

describe("resolveProjectPath", () => {
  it.each([
    ["", "a.js", "a.js"],
    ["", "./a.js", "a.js"],
    ["src", "a.js", "src/a.js"],
    ["src", "../a.js", "a.js"],
    ["src/ui", "../../a.js", "a.js"],
    ["src", "/a.js", "a.js"],
    ["", "a.css?v=2#x", "a.css"],
  ])("(%j, %j) -> %j", (dir, ref, expected) => {
    expect(resolveProjectPath(dir, ref)).toBe(expected);
  });

  it("refuses to leave the project root", () => {
    expect(resolveProjectPath("", "../secret.js")).toBeNull();
    expect(resolveProjectPath("src", "../../secret.js")).toBeNull();
  });
});

describe("findProjectFile", () => {
  const files = { "app.ts": "", "lib/util.js": "", "ui.tsx": "", "x.jsx": "" };

  it("finds exact files", () => {
    expect(findProjectFile(files, "", "lib/util.js")).toBe("lib/util.js");
  });

  it("follows the TypeScript convention: app.js -> app.ts", () => {
    expect(findProjectFile(files, "", "./app.js")).toBe("app.ts");
    expect(findProjectFile(files, "", "ui.js")).toBe("ui.tsx");
    expect(findProjectFile(files, "", "x.js")).toBe("x.jsx");
  });

  it("ignores external and non-file references", () => {
    expect(findProjectFile(files, "", "https://cdn.example/x.js")).toBeNull();
    expect(findProjectFile(files, "", "//cdn.example/x.js")).toBeNull();
    expect(findProjectFile(files, "", "data:text/javascript,1")).toBeNull();
    expect(findProjectFile(files, "", "#top")).toBeNull();
  });

  it("returns null for a missing file", () => {
    expect(findProjectFile(files, "", "nope.js")).toBeNull();
  });
});

describe("buildPreviewHtml", () => {
  it("inlines a linked stylesheet", () => {
    const { html, inlined } = buildPreviewHtml(
      { "index.html": page('<link rel="stylesheet" href="styles.css">', "<p>x</p>"), "styles.css": "p{color:red}" },
      "index.html",
    );
    expect(html).toContain("<style");
    expect(html).toContain("p{color:red}");
    expect(html).not.toContain('href="styles.css"');
    expect(inlined).toEqual(["styles.css"]);
  });

  it("inlines a local classic script so its code actually runs in the preview", () => {
    const { html } = buildPreviewHtml(
      { "index.html": page("", '<div id="app"></div><script src="script.js"></script>'), "script.js": 'document.getElementById("app").textContent = "ran";' },
      "index.html",
    );
    expect(html).not.toContain('src="script.js"');
    expect(html).toContain('document.getElementById("app").textContent = "ran";');
  });

  it("resolves app.js to app.ts and transpiles it (Vanilla TS App template)", () => {
    const { html, errors } = buildPreviewHtml(
      { "index.html": page("", '<script src="app.js"></script>'), "app.ts": "const n: number = 1; console.log(n);" },
      "index.html",
    );
    expect(errors).toEqual([]);
    expect(html).toContain("const n = 1; console.log(n);");
    expect(html).not.toContain(": number");
  });

  it("keeps the script type (module)", () => {
    const { html } = buildPreviewHtml(
      { "index.html": page("", '<script type="module" src="main.js"></script>'), "main.js": "export {}" },
      "index.html",
    );
    expect(html).toContain('<script type="module" data-source="main.js">');
  });

  it("leaves CDN scripts and stylesheets alone", () => {
    const head =
      '<link rel="stylesheet" href="https://cdn.example/a.css"><script src="https://unpkg.com/react@18/umd/react.development.js"></script>';
    const { html, inlined } = buildPreviewHtml({ "index.html": page(head, "") }, "index.html");
    expect(html).toContain('href="https://cdn.example/a.css"');
    expect(html).toContain('src="https://unpkg.com/react@18/umd/react.development.js"');
    expect(inlined).toEqual([]);
  });

  it("does not touch icons, preconnects or other links", () => {
    const head = '<link rel="icon" href="favicon.ico"><link rel="preconnect" href="https://fonts.gstatic.com">';
    const { html } = buildPreviewHtml({ "index.html": page(head, "") }, "index.html");
    expect(html).toContain('<link rel="icon" href="favicon.ico">');
    expect(html).toContain('<link rel="preconnect" href="https://fonts.gstatic.com">');
  });

  it("reports references that match no file and keeps the tag", () => {
    const { html, unresolved } = buildPreviewHtml(
      { "index.html": page('<link rel="stylesheet" href="missing.css">', '<script src="gone.js"></script>') },
      "index.html",
    );
    expect(unresolved).toEqual(["missing.css", "gone.js"]);
    expect(html).toContain('href="missing.css"');
    expect(html).toContain('src="gone.js"');
  });

  it("resolves references relative to the HTML file's folder", () => {
    const { html } = buildPreviewHtml(
      { "site/index.html": page('<link rel="stylesheet" href="../theme.css">', '<script src="js/app.js"></script>'), "theme.css": "b{}", "site/js/app.js": "run()" },
      "site/index.html",
    );
    expect(html).toContain("b{}");
    expect(html).toContain("run()");
  });

  it("applies a stylesheet the page never links (old single styles.css behaviour)", () => {
    const { html } = buildPreviewHtml(
      { "index.html": page("", "<p>x</p>"), "styles.css": "p{margin:0}" },
      "index.html",
    );
    expect(html).toContain("p{margin:0}");
    expect(html.indexOf("p{margin:0}")).toBeLessThan(html.indexOf("</head>"));
  });

  it("does not inline a stylesheet twice", () => {
    const { html } = buildPreviewHtml(
      { "index.html": page('<link rel="stylesheet" href="styles.css">', ""), "styles.css": "UNIQUE{}" },
      "index.html",
    );
    expect(html.split("UNIQUE{}").length - 1).toBe(1);
  });

  it("cannot be broken out of by </script> or </style> inside a file", () => {
    const { html } = buildPreviewHtml(
      { "index.html": page('<link rel="stylesheet" href="s.css">', '<script src="a.js"></script>'), "a.js": 'var s = "</script><b>x</b>";', "s.css": "/* </style><i> */" },
      "index.html",
    );
    expect(html).not.toContain("</script><b>");
    expect(html).not.toContain("</style><i>");
  });

  it("reports syntax errors with file, line and column and does not inline broken code", () => {
    const { errors, html } = buildPreviewHtml(
      { "index.html": page("", '<script src="app.js"></script>'), "app.ts": "let ok = 1;\nconst = ;\n" },
      "index.html",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^app\.ts:2:\d+ - /);
    expect(html).toContain('<script data-source="app.ts"></script>');
  });

  it("puts the bridge right after <head>, before any project script", () => {
    const { html } = buildPreviewHtml(
      { "index.html": page("<title>t</title>", '<script src="a.js"></script>'), "a.js": "console.log(1)" },
      "index.html",
      { bridge: "<script>/*BRIDGE*/</script>" },
    );
    expect(html.indexOf("BRIDGE")).toBeGreaterThan(html.indexOf("<head>"));
    expect(html.indexOf("BRIDGE")).toBeLessThan(html.indexOf("console.log(1)"));
  });

  it("still injects the bridge into a fragment without <head>", () => {
    const { html } = buildPreviewHtml({ "index.html": "<h1>hi</h1>" }, "index.html", {
      bridge: "<script>/*BRIDGE*/</script>",
    });
    expect(html.startsWith("<script>/*BRIDGE*/</script>")).toBe(true);
    expect(html).toContain("<h1>hi</h1>");
  });

  it("handles single quotes, extra attributes and uppercase tags", () => {
    const { html } = buildPreviewHtml(
      { "index.html": page("", "<SCRIPT defer src='a.js' crossorigin></SCRIPT>"), "a.js": "go()" },
      "index.html",
    );
    expect(html).toContain("go()");
    expect(html).not.toContain("src='a.js'");
  });

  it("returns an empty document for a missing entry instead of throwing", () => {
    expect(buildPreviewHtml({}, "index.html").html).toBe("");
  });
});

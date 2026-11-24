/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/mdx/enhanced-code-viewer", () => ({
  EnhancedCodeViewer: ({
    code,
    language,
    filename,
  }: {
    code: string;
    language: string;
    filename?: string;
  }) => (
    <div
      data-testid="enhanced-code-viewer"
      data-language={language}
      data-filename={filename || ""}
    >
      {code}
    </div>
  ),
}));

describe("LessonContentRenderer", () => {
  it("renders content containing braces without crashing", () => {
    render(
      <LessonContentRenderer content="Voici du texte avec une accolade ouvrante { et fermante }." />,
    );

    expect(
      screen.getByText(/Voici du texte avec une accolade ouvrante/),
    ).toBeInTheDocument();
  });

  it("renders raw html blocks from rich text editor", () => {
    render(
      <LessonContentRenderer content="<h2>Titre HTML</h2><p>Paragraphe <strong>riche</strong>.</p>" />,
    );

    expect(screen.getByText("Titre HTML")).toBeInTheDocument();
    expect(screen.getByText("riche")).toBeInTheDocument();
  });

  it("uses enhanced code viewer for fenced code blocks", () => {
    render(
      <LessonContentRenderer
        content={"```ts\nconst a = { value: 1 };\nconsole.log(a);\n```"}
      />,
    );

    const viewer = screen.getByTestId("enhanced-code-viewer");
    expect(viewer).toBeInTheDocument();
    expect(viewer.getAttribute("data-language")).toBe("ts");
    expect(viewer.textContent).toContain("const a = { value: 1 };");
  });

  it("keeps a code block of the editor whole, blank lines included", () => {
    // Read as Markdown, an HTML block ends at the first blank line: the end of the code would be lost
    render(
      <LessonContentRenderer
        content={["<p>Avant</p><pre><code class=\"language-js\">const a = 1;", "", "const b = 2;</code></pre><p>Après</p>"].join("\n")}
      />,
    );
    const viewer = screen.getByTestId("enhanced-code-viewer");
    expect(viewer.getAttribute("data-language")).toBe("js");
    expect(viewer.textContent).toContain("const a = 1;");
    expect(viewer.textContent).toContain("const b = 2;");
    expect(screen.getByText("Après")).toBeInTheDocument();
  });

  it("shows images from any host as plain images, lazily (no next/image host check)", () => {
    const { container } = render(<LessonContentRenderer content={'<p><img src="https://images.example.org/schema.png" alt="Schéma"></p>'} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://images.example.org/schema.png");
    expect(img.getAttribute("alt")).toBe("Schéma");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("underlines links so they are not told apart by colour only", () => {
    render(<LessonContentRenderer content={'<p><a href="https://react.dev">la documentation</a></p>'} />);
    expect(screen.getByRole("link", { name: "la documentation" }).className).toContain("underline");
  });

  it("renders slide HTML through the same sanitiser: handlers and scripts never survive", () => {
    const { container } = render(
      <LessonContentRenderer content={'<div class="grid"><h3>Section</h3><img src="x" onerror="alert(1)"><script>alert(2)</script></div>'} />,
    );
    expect(screen.getByRole("heading", { name: "Section" })).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("onerror");
    expect(container.querySelector("script")).toBeNull();
  });

  it("sanitizes javascript links to safe fallback", () => {
    render(<LessonContentRenderer content="[cliquer](javascript:alert(1))" />);

    const link = screen.getByRole("link", { name: "cliquer" });
    expect(link.getAttribute("href")).toBe("#");
  });
});

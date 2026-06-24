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

  it("sanitizes javascript links to safe fallback", () => {
    render(<LessonContentRenderer content="[cliquer](javascript:alert(1))" />);

    const link = screen.getByRole("link", { name: "cliquer" });
    expect(link.getAttribute("href")).toBe("#");
  });
});

import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { LessonContent } from "@/app/[locale]/(main)/formations/[slug]/lessons/[lessonSlug]/_components/lesson-content";
import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";
import { MarkdownRenderer } from "@/components/mdx/markdown-renderer";

const body = "# Introduction\n\nSome text.\n\n## Part one\n\nMore text.\n\n### Detail\n\nEnd.";

describe("lesson headings (WCAG 1.3.1: one h1 per page)", () => {
  it("the lesson body never adds an <h1>: a '# Title' becomes an <h2>", () => {
    const { container } = render(<LessonContentRenderer content={body} />);

    expect(container.querySelectorAll("h1")).toHaveLength(0);
    expect([...container.querySelectorAll("h2")].map((h) => h.textContent)).toEqual(["Introduction", "Part one"]);
    expect(container.querySelector("h3")?.textContent).toBe("Detail");
  });

  it("keeps the slug id on a demoted heading so anchors still work", () => {
    const { container } = render(<LessonContentRenderer content={body} />);

    expect(container.querySelector("h2")?.id).toBe("introduction");
  });

  it("the whole lesson page has exactly one <h1>: the lesson title", () => {
    const { container } = render(
      <LessonContent
        lesson={{
          id: "l1",
          title: "My lesson",
          description: null,
          content: body,
          duration: 600,
          order: 1,
        }}
      />,
    );

    const h1s = container.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe("My lesson");
  });

  it("shows nothing that is not about this lesson (no generic 'Ressources' card)", () => {
    const { container } = render(
      <LessonContent
        lesson={{ id: "l1", title: "My lesson", description: "About it", content: body, duration: 600, order: 1 }}
      />,
    );

    expect(container.textContent).not.toContain("Ressources");
    expect(container.textContent).not.toContain("Les concepts fondamentaux abordés");
    expect(container.textContent).toContain("Contenu de la leçon");
  });

  it("markdown embedded in a page that has its own title does not add an <h1> either", () => {
    const { container } = render(<MarkdownRenderer content={body} />);

    expect(container.querySelectorAll("h1")).toHaveLength(0);
    expect(container.querySelectorAll("h2").length).toBeGreaterThanOrEqual(2);
  });
});

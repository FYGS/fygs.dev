import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";

const body = "# Introduction\n\nSome text.\n\n## Part one\n\nMore text.\n\n### Detail\n\nEnd.";

// The lesson page (app/[locale]/(learning)/learn/[slug]/lessons/[lessonSlug]/page.tsx) renders the title as
// the one <h1>; the body must never add another.
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
});

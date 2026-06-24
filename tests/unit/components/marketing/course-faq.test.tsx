/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseFaq } from "@/components/marketing/course-faq";

describe("CourseFaq", () => {
  const items = [
    { q: "Combien de temps dure la formation ?", a: "Environ 20h." },
    { q: "Y a-t-il un certificat ?", a: "Oui, un certificat de réussite." },
  ];

  it("renders all FAQ items", () => {
    render(<CourseFaq items={items} />);
    expect(
      screen.getByText("Combien de temps dure la formation ?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Y a-t-il un certificat ?")).toBeInTheDocument();
  });

  it("renders section title", () => {
    render(<CourseFaq items={items} />);
    expect(screen.getByText("Questions fréquentes")).toBeInTheDocument();
  });

  it("returns null for empty items", () => {
    const { container } = render(<CourseFaq items={[]} />);
    expect(container.innerHTML).toBe("");
  });
});

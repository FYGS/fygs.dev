/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CourseThumbnail } from "@/components/marketing/course-thumbnail";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt as string} />
  ),
}));

import { vi } from "vitest";

describe("CourseThumbnail", () => {
  it("renders image with correct alt and sizes", () => {
    const { container } = render(
      <CourseThumbnail src="/thumb.jpg" alt="Course thumbnail" />,
    );
    const img = container.querySelector("img")!;
    expect(img).toBeTruthy();
    expect(img.alt).toBe("Course thumbnail");
  });

  it("renders fallback when src is null", () => {
    const { container } = render(
      <CourseThumbnail src={null} alt="Course thumbnail" />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("Pas de miniature");
  });

  it("applies priority prop", () => {
    const { container } = render(
      <CourseThumbnail src="/thumb.jpg" alt="Course" priority />,
    );
    const img = container.querySelector("img")!;
    expect(img.getAttribute("loading")).not.toBe("lazy");
  });
});

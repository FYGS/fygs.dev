/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton shimmer", () => {
  it("renders with shimmer animation classes", () => {
    const { container } = render(<Skeleton className="h-8 w-full" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("overflow-hidden");
    expect(el.className).toContain("shimmer");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-16 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-16");
    expect(el.className).toContain("w-32");
  });

  it("renders as a div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});

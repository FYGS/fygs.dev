/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LearningSidebar } from "@/components/learning/learning-sidebar";

// Mock next/link
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

const mockLessons = [
  {
    id: "l1",
    title: "Standalone Lesson",
    slug: "standalone",
    order: 1,
    type: "lesson" as const,
    url: "/learn/course/lessons/standalone",
  },
];

const mockModules = [
  {
    id: "m1",
    title: "Module 1 - Basics",
    items: [
      {
        id: "l2",
        title: "Variables",
        slug: "variables",
        order: 1,
        type: "lesson" as const,
        url: "/learn/course/lessons/variables",
      },
      {
        id: "l3",
        title: "Functions",
        slug: "functions",
        order: 2,
        type: "lesson" as const,
        url: "/learn/course/lessons/functions",
      },
    ],
  },
  {
    id: "m2",
    title: "Module 2 - Advanced",
    items: [
      {
        id: "l4",
        title: "Closures",
        slug: "closures",
        order: 1,
        type: "lesson" as const,
        url: "/learn/course/lessons/closures",
      },
    ],
  },
];

const mockProgress = [
  { itemId: "l1", completed: true, type: "lesson" as const },
  { itemId: "l2", completed: true, type: "lesson" as const },
];

describe("LearningSidebar", () => {
  it("renders module titles", () => {
    render(
      <LearningSidebar
        lessons={mockLessons}
        modules={mockModules}
        currentLessonId="l3"
        progressData={mockProgress}
        open={true}
      />,
    );

    expect(screen.getByText("Module 1 - Basics")).toBeTruthy();
    expect(screen.getByText("Module 2 - Advanced")).toBeTruthy();
  });

  it("renders standalone lessons", () => {
    render(
      <LearningSidebar
        lessons={mockLessons}
        modules={mockModules}
        currentLessonId="l2"
        progressData={mockProgress}
        open={true}
      />,
    );

    expect(screen.getByText("Standalone Lesson")).toBeTruthy();
  });

  it("highlights current lesson", () => {
    render(
      <LearningSidebar
        lessons={mockLessons}
        modules={mockModules}
        currentLessonId="l2"
        progressData={mockProgress}
        open={true}
      />,
    );

    // The current module should be expanded
    expect(screen.getByText("Variables")).toBeTruthy();
  });

  it("shows completion badges on modules", () => {
    render(
      <LearningSidebar
        lessons={mockLessons}
        modules={mockModules}
        currentLessonId="l3"
        progressData={mockProgress}
        open={true}
      />,
    );

    // Module 1 has 2 items, 1 completed (l2)
    expect(screen.getByText("1/2")).toBeTruthy();
    // Module 2 has 1 item, 0 completed
    expect(screen.getByText("0/1")).toBeTruthy();
  });

  it("hides sidebar when open=false", () => {
    const { container } = render(
      <LearningSidebar
        lessons={mockLessons}
        modules={mockModules}
        currentLessonId="l2"
        progressData={mockProgress}
        open={false}
      />,
    );

    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("-translate-x-full");
  });

  it("shows sidebar when open=true", () => {
    const { container } = render(
      <LearningSidebar
        lessons={mockLessons}
        modules={mockModules}
        currentLessonId="l2"
        progressData={mockProgress}
        open={true}
      />,
    );

    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("translate-x-0");
  });

  it("renders accessible lesson links", () => {
    render(
      <LearningSidebar
        lessons={mockLessons}
        modules={mockModules}
        currentLessonId="l2"
        progressData={mockProgress}
        open={true}
      />,
    );

    // l1 is completed, so l2 should be accessible
    const link = screen.getByText("Variables").closest("a");
    expect(link?.getAttribute("href")).toBe("/learn/course/lessons/variables");
  });
});

"use client";

import { usePathname } from "next/navigation";
import type { CourseOutline, OutlineItem } from "@/lib/learning/outline";
import { useLearning } from "./learning-context";

/** The outline item shown by an URL of the learning area, or null (course home, completion, supports). */
export function findCurrentItem(pathname: string, outline: CourseOutline): OutlineItem | null {
  const match = pathname.match(/\/learn\/[^/]+\/(lessons|quizzes)\/([^/?#]+)/);
  if (match) {
    const key = decodeURIComponent(match[2]);
    return (
      outline.items.find((i) =>
        match[1] === "lessons" ? i.kind === "lesson" && i.slug === key : i.kind === "quiz" && i.id === key,
      ) ?? null
    );
  }
  if (/\/learn\/[^/]+\/exam\/?$/.test(pathname)) {
    return outline.items.find((i) => i.kind === "exam") ?? null;
  }
  return null;
}

export function useCurrentItem(): OutlineItem | null {
  const { outline } = useLearning();
  return findCurrentItem(usePathname(), outline);
}

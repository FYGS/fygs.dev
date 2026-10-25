/**
 * What a course needs before learners can see it. One pure function feeds the server gate
 * (`setCoursePublished` refuses when something is missing) and the checklist in the builder, so
 * the two can never disagree.
 */

export interface ReadinessLesson {
  title: string;
  published: boolean;
  hasVideo: boolean;
  hasContent: boolean;
}

export interface ReadinessInput {
  title: string;
  description: string;
  thumbnail: string | null;
  accessTier: "FREE" | "PREMIUM";
  price: number | null;
  lessons: ReadinessLesson[];
}

export type ReadinessKey =
  | "title"
  | "description"
  | "thumbnail"
  | "lessons"
  | "materials"
  | "price";

export interface ReadinessItem {
  key: ReadinessKey;
  label: string;
  ok: boolean;
  /** What to fix, shown under a failed item. */
  hint?: string;
}

export interface Readiness {
  ready: boolean;
  items: ReadinessItem[];
  /** Labels of the failed items, in order. */
  missing: string[];
}

/** Smallest price the payment provider accepts, in euros. */
export const MIN_PREMIUM_PRICE = 0.5;

export type LessonStatus = "draft" | "incomplete" | "ready";

/** The one vocabulary of lesson states, in the list and in the lesson panel. */
export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  draft: "Brouillon",
  incomplete: "À compléter",
  ready: "Prête",
};

/** `draft`: hidden from learners. `incomplete`: published but nothing to watch or read. `ready`. */
export function lessonStatus(lesson: {
  published: boolean;
  hasVideo: boolean;
  hasContent: boolean;
}): LessonStatus {
  if (!lesson.published) return "draft";
  return lesson.hasVideo || lesson.hasContent ? "ready" : "incomplete";
}

export function checkPublishReadiness(course: ReadinessInput): Readiness {
  const published = course.lessons.filter((l) => l.published);
  const empty = published.filter((l) => !l.hasVideo && !l.hasContent);
  const paid = course.accessTier === "PREMIUM";

  const items: ReadinessItem[] = [
    {
      key: "title",
      label: "Un titre d'au moins 3 caractères",
      ok: course.title.trim().length >= 3,
    },
    {
      key: "description",
      label: "Une description d'au moins 10 caractères",
      ok: course.description.trim().length >= 10,
    },
    {
      key: "thumbnail",
      label: "Une image de couverture",
      ok: Boolean(course.thumbnail?.trim()),
    },
    {
      key: "lessons",
      label: "Au moins une leçon publiée",
      ok: published.length > 0,
      hint: "Publiez une leçon dans l'onglet Programme.",
    },
    {
      key: "materials",
      label: "Chaque leçon publiée a une vidéo ou du contenu",
      ok: empty.length === 0,
      hint:
        empty.length > 0
          ? `À compléter ou à repasser en brouillon : ${empty
              .slice(0, 5)
              .map((l) => `« ${l.title} »`)
              .join(", ")}${empty.length > 5 ? ` et ${empty.length - 5} autre(s)` : ""}.`
          : undefined,
    },
  ];
  if (paid) {
    items.push({
      key: "price",
      label: "Un prix pour une formation premium",
      ok: course.price !== null && course.price >= MIN_PREMIUM_PRICE,
      hint: "Renseignez un prix d'au moins 0,50 € dans l'onglet Page de vente, ou passez la formation en accès gratuit.",
    });
  }

  const missing = items.filter((i) => !i.ok).map((i) => i.label);
  return { ready: missing.length === 0, items, missing };
}

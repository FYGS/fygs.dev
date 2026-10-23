import { getCurriculum, type CurriculumSnapshot } from "@/lib/curriculum/curriculum";
import { revalidateCourse } from "@/lib/curriculum/revalidate";
import { logger } from "@/lib/structured-logger";

export type ActionFailure = { success: false; error: string };
export type SnapshotResult = { success: true; snapshot: CurriculumSnapshot } | ActionFailure;

export const failure = (error: string): ActionFailure => ({ success: false, error });

export const UNEXPECTED = "Une erreur est survenue. Réessayez dans un instant.";

/** Logs the real error, gives the user a sentence they can act on. */
export function unexpected(scope: string, error: unknown): ActionFailure {
  logger.error(`Course builder: ${scope}`, {
    metadata: { error: error instanceof Error ? error.message : String(error) },
  });
  return failure(UNEXPECTED);
}

/** After a change to the curriculum: drop cached pages and send back the new outline. */
export async function snapshotAfterChange(
  course: { id: string; slug: string },
  options: { lessonSlugs?: string[]; listings?: boolean } = {},
): Promise<SnapshotResult> {
  revalidateCourse({
    courseId: course.id,
    slugs: [course.slug],
    lessonSlugs: options.lessonSlugs,
    listings: options.listings,
  });
  return { success: true, snapshot: await getCurriculum(course.id) };
}

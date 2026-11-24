import { revalidatePath } from "next/cache";

const LOCALES = ["fr", "en", "es"] as const;

function localized(path: string) {
  revalidatePath(path);
  for (const locale of LOCALES) revalidatePath(`/${locale}${path}`);
}

interface RevalidateOptions {
  courseId: string;
  /** Every slug the course answered to: the current one and, after a rename, the previous one. */
  slugs: readonly (string | null | undefined)[];
  /** Lesson slugs whose page changed (old and new after a rename, or a deleted lesson). */
  lessonSlugs?: readonly (string | null | undefined)[];
  /** The catalog, home page and sitemap list the course: set when it was published, unpublished, renamed or deleted. */
  listings?: boolean;
}

/**
 * Drops the cached pages a change can affect: the admin builder, the public course page and its
 * sub-pages, the learning area, and the listings when the course appears or disappears from them.
 */
export function revalidateCourse({ courseId, slugs, lessonSlugs = [], listings = false }: RevalidateOptions) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);

  const courseSlugs = [...new Set(slugs.filter((s): s is string => Boolean(s)))];
  for (const slug of courseSlugs) {
    localized(`/formations/${slug}`);
    localized(`/formations/${slug}/details`);
    localized(`/formations/${slug}/visual-supports`);
    localized(`/learn/${slug}`);
    // The learning shell (outline, sidebar) is rendered once for every page under the course.
    revalidatePath(`/learn/${slug}`, "layout");
    for (const locale of LOCALES) revalidatePath(`/${locale}/learn/${slug}`, "layout");
    for (const lessonSlug of new Set(lessonSlugs.filter((s): s is string => Boolean(s)))) {
      localized(`/formations/${slug}/lessons/${lessonSlug}`);
      localized(`/learn/${slug}/lessons/${lessonSlug}`);
    }
  }

  if (listings) {
    localized("/formations");
    localized("/");
    revalidatePath("/sitemap.xml");
  }
}

import type { CourseSummaryDTO } from "@/types/course";
import { coursesWithPreview, getEntitlements } from "./entitlement";
import { courseOffer, primaryAction, viewerStatus, type CourseOffer, type PrimaryActionKind, type ViewerStatus } from "./offer";

/** What a course card shows (catalog, home page): the offer, where the viewer stands and where the button leads. */
export interface CourseCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  level: string;
  featured: boolean;
  /** Course duration in minutes (0 when unknown). */
  minutes: number;
  enrollmentCount: number;
  averageRating: number;
  offer: CourseOffer;
  status: ViewerStatus;
  /** Free sample lessons the viewer can watch without access. */
  hasPreview: boolean;
  action: { href: string; kind: PrimaryActionKind };
}

/** Cards for `courses`, seen by `viewer` (`null` for a visitor): entitlements and samples in a handful of queries. */
export async function toCourseCards(
  viewer: { id: string; role?: string | null } | null,
  courses: readonly CourseSummaryDTO[],
): Promise<CourseCardData[]> {
  const ids = courses.map((c) => c.id);
  const [entitlements, withPreview] = await Promise.all([
    viewer ? getEntitlements(viewer, ids) : Promise.resolve(null),
    coursesWithPreview(ids),
  ]);
  return courses.map((course) => {
    const entitlement = entitlements?.courses.get(course.id) ?? null;
    const offer = courseOffer(course.requiredTier ?? "FREE", course.price);
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      level: course.level,
      featured: course.featured,
      minutes: course.duration ?? 0,
      enrollmentCount: course.enrollmentCount,
      averageRating: course.averageRating,
      offer,
      status: viewerStatus(entitlement),
      hasPreview: withPreview.has(course.id) && !entitlement?.entitled,
      action: primaryAction(course.slug, entitlement, offer),
    };
  });
}

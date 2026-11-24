import { SITE_URL } from "@/app/_lib/constants";
import { LEVEL_LABELS } from "@/lib/courses/labels";
import { serializeJsonLd } from "@/lib/jsonld";
import type { PathDetail } from "@/lib/paths/queries";

/** schema.org description of a path: a course made of ordered courses. */
export function PathStructuredData({ path }: { path: PathDetail }) {
  const courses = path.courses.filter((c) => c.available);
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: path.title,
    description: path.description,
    url: `${SITE_URL}/fr/parcours/${path.slug}`,
    inLanguage: "fr",
    educationalLevel: LEVEL_LABELS[path.level],
    provider: { "@type": "Organization", name: "FYGS", url: SITE_URL },
    ...(path.thumbnail && { image: path.thumbnail }),
    ...(path.objectives.length > 0 && { teaches: path.objectives }),
    hasCourse: courses.map((course, index) => ({
      "@type": "Course",
      position: index + 1,
      name: course.title,
      description: course.description,
      url: `${SITE_URL}/fr/formations/${course.slug}`,
      provider: { "@type": "Organization", name: "FYGS", url: SITE_URL },
    })),
  };
  // "<" is escaped so that no text of a path can close the script element
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

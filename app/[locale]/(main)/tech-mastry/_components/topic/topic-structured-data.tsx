"use client";

import { SITE_URL } from "@/app/_lib/constants";
import { serializeJsonLd } from "@/lib/jsonld";
import { usePathname } from "next/navigation";
import { LEVEL_LABEL, getArea, getTopic } from "../../_catalog";

/** schema.org description of the lesson, for search engines: what it teaches, for whom, how long it takes. */
export function TopicStructuredData() {
  const pathname = usePathname();
  const topic = getTopic(pathname ?? "");
  const area = getArea(pathname ?? "");
  if (!topic || !area || topic.kind === "hub") return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: topic.title,
    description: topic.description,
    url: `${SITE_URL}/fr${topic.route}`,
    inLanguage: "fr",
    learningResourceType: topic.kind === "practice" ? "exercise" : "lesson",
    educationalLevel: LEVEL_LABEL[topic.level],
    timeRequired: `PT${topic.minutes}M`,
    keywords: topic.tags.join(", "),
    teaches: topic.takeaways,
    isPartOf: { "@type": "Course", name: `TechMastery : ${area.title}`, provider: { "@type": "Organization", name: "FYGS", url: SITE_URL } },
  };
  // "<" is escaped so that no text of the catalog can close the script element
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

import { AREAS, LEVEL_LABEL } from "../../_catalog";
import type { SearchIndexItem } from "./types";

/**
 * Search entries for the topics of the catalog that the hand-written groups do not cover, so that every page can be
 * found. A hand-written entry always wins: it has curated keywords and an importance.
 */
export function catalogSearchItems(covered: ReadonlySet<string>): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];
  for (const area of AREAS) {
    for (const topic of area.topics) {
      if (covered.has(topic.route)) continue;
      const words = topic.title
        .toLowerCase()
        .split(/[^a-zà-ÿ0-9+#]+/)
        .filter((word) => word.length > 3);
      items.push({
        title: topic.title,
        description: topic.description,
        href: topic.route,
        category: area.title,
        subcategory: topic.kind === "hub" ? "Vue d'ensemble" : LEVEL_LABEL[topic.level],
        keywords: [...new Set([...topic.tags, ...words, area.title.toLowerCase()])],
        importance: topic.kind === "hub" ? "high" : "medium",
      });
    }
  }
  return items;
}

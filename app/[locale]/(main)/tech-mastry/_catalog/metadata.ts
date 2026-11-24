import type { Metadata } from "next";
import { getArea, getTopic } from "./index";

/**
 * The metadata of a TechMastery page, from the catalog: one title format, one description, the tags as keywords.
 * A landing page is named after its area. Throws for a route the catalog does not know, so a new page cannot
 * ship without an entry (tests/unit/tech-mastry/catalog.test.ts checks the same thing earlier).
 */
export function topicMetadata(route: string): Metadata {
  const topic = getTopic(route);
  if (!topic) throw new Error(`TechMastery: ${route} is not in the catalog`);
  const name = topic.kind === "hub" ? (getArea(route)?.title ?? topic.title) : topic.title;
  const title = `${name} | TechMastery`;
  return {
    title,
    description: topic.description,
    keywords: topic.tags,
    openGraph: { title, description: topic.description, type: "article" },
  };
}

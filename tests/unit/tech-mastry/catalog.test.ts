import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { topics as navigation } from "@/app/[locale]/(main)/tech-mastry/_components/topics-nav/topics";
import { searchIndex } from "@/app/[locale]/(main)/tech-mastry/_utils/search-index";
import {
  AREAS,
  PATH,
  TOPICS,
  getArea,
  getTopic,
  lessonsOf,
  neighbours,
  normalizeRoute,
  relatedTo,
} from "@/app/[locale]/(main)/tech-mastry/_catalog";

const ROOT = path.resolve("app/[locale]/(main)/tech-mastry");
// the section's home and the dashboard are tools of the section, not topics to learn
const NOT_TOPICS = new Set(["/tech-mastry", "/tech-mastry/dashboard"]);

function pagesOnDisk(): string[] {
  const routes: string[] = [];
  (function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "page.tsx") {
        const relative = path.relative(ROOT, dir).split(path.sep).filter(Boolean).join("/");
        routes.push("/tech-mastry" + (relative ? "/" + relative : ""));
      }
    }
  })(ROOT);
  return routes.filter((route) => !NOT_TOPICS.has(route)).sort();
}

describe("the catalog describes every page, and only the pages", () => {
  it("has an entry for each page of the section and a page for each entry", () => {
    const disk = pagesOnDisk();
    const catalog = TOPICS.map((topic) => topic.route).sort();
    expect(catalog.filter((route) => !disk.includes(route)), "entries without a page").toEqual([]);
    expect(disk.filter((route) => !catalog.includes(route)), "pages without an entry").toEqual([]);
  });

  it("has no route twice", () => {
    const seen = new Set<string>();
    for (const topic of TOPICS) {
      expect(seen.has(topic.route), topic.route).toBe(false);
      seen.add(topic.route);
    }
  });

  it("gives every topic what the shell and the search show", () => {
    for (const topic of TOPICS) {
      expect(topic.title.trim().length, `${topic.route} title`).toBeGreaterThan(2);
      expect(topic.description.trim().length, `${topic.route} description`).toBeGreaterThan(10);
      expect(topic.minutes, `${topic.route} minutes`).toBeGreaterThanOrEqual(3);
      expect(topic.minutes, `${topic.route} minutes`).toBeLessThanOrEqual(90);
      expect(new Set(topic.tags).size, `${topic.route} tags are unique`).toBe(topic.tags.length);
      for (const tag of topic.tags) expect(tag, `${topic.route} tag`).toBe(tag.toLowerCase().trim());
    }
  });

  it("gives every lesson 3 to 5 takeaways", () => {
    for (const topic of PATH) {
      const list = topic.takeaways ?? [];
      expect(list.length, `${topic.route} takeaways`).toBeGreaterThanOrEqual(3);
      expect(list.length, `${topic.route} takeaways`).toBeLessThanOrEqual(5);
      for (const line of list) expect(line.trim().length, `${topic.route}: "${line}"`).toBeGreaterThan(15);
    }
  });

  it("has an existing landing page for each area that announces one, and that page is a hub", () => {
    for (const area of AREAS) {
      if (!area.route) continue;
      const hub = area.topics.find((topic) => topic.route === area.route);
      expect(hub?.kind, `${area.id} hub`).toBe("hub");
    }
  });

  it("only lists prerequisites that exist, that are not the topic itself and that do not loop", () => {
    for (const topic of TOPICS) {
      for (const needed of topic.prerequisites ?? []) {
        expect(getTopic(needed), `${topic.route} needs ${needed}`).toBeDefined();
        expect(needed, `${topic.route} needs itself`).not.toBe(topic.route);
      }
    }
    const visiting = new Set<string>();
    const done = new Set<string>();
    const visit = (route: string) => {
      if (done.has(route)) return;
      expect(visiting.has(route), `prerequisite loop through ${route}`).toBe(false);
      visiting.add(route);
      for (const needed of getTopic(route)?.prerequisites ?? []) visit(needed);
      visiting.delete(route);
      done.add(route);
    };
    for (const topic of TOPICS) visit(topic.route);
  });
});

describe("the navigation and the search find every topic", () => {
  it("lists every non-landing topic in the navigation", () => {
    const linked = new Set(navigation.flatMap((section) => section.items.map((item) => item.href)));
    const missing = TOPICS.filter((topic) => topic.kind !== "hub" && !linked.has(topic.route)).map((topic) => topic.route);
    expect(missing, "topics the navigation does not link").toEqual([]);
  });

  it("only links to topics of the catalog from the navigation", () => {
    const unknown = navigation.flatMap((section) => section.items.map((item) => item.href)).filter((href) => !getTopic(href) && !NOT_TOPICS.has(href));
    expect(unknown, "navigation links outside the catalog").toEqual([]);
  });

  it("makes every topic findable in the search index", () => {
    const indexed = new Set(searchIndex.map((item) => item.href));
    const missing = TOPICS.filter((topic) => !indexed.has(topic.route)).map((topic) => topic.route);
    expect(missing, "topics the search cannot find").toEqual([]);
  });
});

describe("helpers", () => {
  it("normalizes a path with a locale, a query, a hash or a trailing slash", () => {
    expect(normalizeRoute("/fr/tech-mastry/git-mastery/workflows/")).toBe("/tech-mastry/git-mastery/workflows");
    expect(normalizeRoute("/en/tech-mastry?x=1#top")).toBe("/tech-mastry");
    expect(normalizeRoute("/tech-mastry/qa")).toBe("/tech-mastry/qa");
  });

  it("finds a topic and its area from any form of the path", () => {
    expect(getTopic("/fr/tech-mastry/git-mastery/workflows")?.title).toBeTruthy();
    expect(getArea("/tech-mastry/git-mastery/workflows")?.id).toBe("git-mastery");
    expect(getTopic("/tech-mastry/nope")).toBeUndefined();
  });

  it("walks the whole path in both directions without a gap or a loop", () => {
    expect(neighbours(PATH[0].route).previous).toBeNull();
    expect(neighbours(PATH[PATH.length - 1].route).next).toBeNull();
    for (let i = 0; i < PATH.length - 1; i++) {
      expect(neighbours(PATH[i].route).next?.route).toBe(PATH[i + 1].route);
      expect(neighbours(PATH[i + 1].route).previous?.route).toBe(PATH[i].route);
    }
    expect(neighbours("/tech-mastry/dashboard")).toEqual({ previous: null, next: null });
  });

  it("never puts a landing page on the path", () => {
    expect(PATH.every((topic) => topic.kind !== "hub")).toBe(true);
    for (const area of AREAS) expect(lessonsOf(area).every((topic) => topic.kind !== "hub")).toBe(true);
  });

  it("suggests other lessons, never the topic itself, without repeating one", () => {
    for (const topic of PATH) {
      const related = relatedTo(topic.route, 3);
      expect(related.map((other) => other.route)).not.toContain(topic.route);
      expect(new Set(related.map((other) => other.route)).size).toBe(related.length);
    }
  });
});

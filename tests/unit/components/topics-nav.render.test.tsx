import { createHash } from "crypto";
import { describe, it, expect, vi } from "vitest";
import { topics, TopicsNav } from "@/app/[locale]/(main)/tech-mastry/_components/topics-nav";
import { renderWalk } from "../visualizations/render-walk";

vi.mock("next/navigation", () => ({
  usePathname: () => "/tech-mastry/algorithms/sorting",
}));

describe("topics data", () => {
  it("keeps every section, item, badge and icon in the same order", () => {
    const flat = topics.map((section) => ({
      title: section.title,
      icon: (section.icon as unknown as { displayName?: string }).displayName,
      items: section.items.map((item) => ({
        title: item.title,
        href: item.href,
        description: item.description,
        badge: "badge" in item ? item.badge : undefined,
        icon: (item.icon as unknown as { displayName?: string }).displayName,
      })),
    }));
    expect(flat.length).toBe(15);
    expect(flat.reduce((n, s) => n + s.items.length, 0)).toMatchInlineSnapshot(`105`);
    expect(flat.map((s) => [s.title, s.items.length])).toMatchInlineSnapshot(`
      [
        [
          "Outils Pratiques",
          2,
        ],
        [
          "Algorithmes",
          7,
        ],
        [
          "Structures de Données",
          8,
        ],
        [
          "Architecture & Design",
          4,
        ],
        [
          "System Design",
          6,
        ],
        [
          "Frontend",
          8,
        ],
        [
          "Backend",
          9,
        ],
        [
          "Carrière & Préparation",
          6,
        ],
        [
          "Sécurité & DevOps",
          4,
        ],
        [
          "Data Science & Engineering",
          7,
        ],
        [
          "IA & Prompt Engineering",
          7,
        ],
        [
          "Git Mastery",
          7,
        ],
        [
          "TypeScript Mastery",
          7,
        ],
        [
          "Bonnes Pratiques",
          8,
        ],
        [
          "Pratique",
          15,
        ],
      ]
    `);
    expect(createHash("md5").update(JSON.stringify(flat)).digest("hex")).toMatchInlineSnapshot(`"10899217b9c1454b9d46dab0afc121a6"`);
  });
});

describe("TopicsNav rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(TopicsNav, 2);
    expect(states).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "51c32eb5",
        "27766433",
        "9f440c0f",
        "a995bb4b",
        "61122d42",
        "df4f25f2",
        "a33eaf82",
        "12430516",
        "86875bd4",
        "82ce40ac",
        "3feb92f6",
        "b66ade52",
        "725f6367",
        "440db600",
        "9c4c662c",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
        "95cffe5e",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(TopicsNav).hashes).toEqual(renderWalk(TopicsNav).hashes);
  });
});

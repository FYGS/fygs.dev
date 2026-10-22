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
    expect(flat.reduce((n, s) => n + s.items.length, 0)).toMatchInlineSnapshot(`107`);
    expect(flat.map((s) => [s.title, s.items.length])).toMatchInlineSnapshot(`
      [
        [
          "Outils Pratiques",
          3,
        ],
        [
          "Algorithmes",
          8,
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
          7,
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
          14,
        ],
      ]
    `);
    expect(createHash("md5").update(JSON.stringify(flat)).digest("hex")).toMatchInlineSnapshot(`"dc2ab761618207961403f78c1ec19527"`);
  });
});

describe("TopicsNav rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(TopicsNav, 2);
    expect(states).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "51c32eb5",
        "516e309d",
        "89c0f247",
        "6b38af2d",
        "9ac352a5",
        "bc4ff7bf",
        "5ba39618",
        "57817015",
        "3c08521b",
        "eaab100e",
        "21dd4bca",
        "4d7d44e2",
        "1cf0d2f0",
        "2c4a0f1e",
        "b8b98b51",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
        "abd186fd",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(TopicsNav).hashes).toEqual(renderWalk(TopicsNav).hashes);
  });
});

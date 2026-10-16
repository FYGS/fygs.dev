import { createHash } from "crypto";
import { describe, it, expect } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ColumnFamilyView } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql/column-family-view";

const queryTypes = ["simple", "complex", "aggregation", "update"] as const;

function hashFor(queryType: (typeof queryTypes)[number]) {
  const { container } = render(<ColumnFamilyView queryType={queryType} />);
  const html = container.innerHTML.replace(/<svg[^>]*lucide[^>]*>[\s\S]*?<\/svg>/g, "<icon/>");
  cleanup();
  return { hash: createHash("md5").update(html).digest("hex").slice(0, 8), length: html.length };
}

describe("ColumnFamilyView rendering", () => {
  it("renders the same markup for every query type", () => {
    expect(queryTypes.map((q) => [q, hashFor(q)])).toMatchInlineSnapshot(`
      [
        [
          "simple",
          {
            "hash": "8a37623b",
            "length": 8875,
          },
        ],
        [
          "complex",
          {
            "hash": "3f681647",
            "length": 8817,
          },
        ],
        [
          "aggregation",
          {
            "hash": "270776d2",
            "length": 9102,
          },
        ],
        [
          "update",
          {
            "hash": "b2472df9",
            "length": 8738,
          },
        ],
      ]
    `);
  });

  it("is deterministic", () => {
    expect(queryTypes.map(hashFor)).toEqual(queryTypes.map(hashFor));
  });
});

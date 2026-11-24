import { describe, it, expect } from "vitest";
import { realWorldExamples } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/real-world-examples/data";

describe("real world examples data", () => {
  it("keeps the examples in order with their categories", () => {
    expect(realWorldExamples.map((e) => [e.id, e.category])).toEqual([
      ["array-1", "arrays"],
      ["linked-list-1", "linked-lists"],
      ["stack-1", "stacks"],
      ["queue-1", "queues"],
      ["hash-table-1", "hash-tables"],
      ["binary-tree-1", "binary-trees"],
    ]);
  });

  it("gives every example use cases, code and an explanation", () => {
    for (const example of realWorldExamples) {
      expect(example.useCases.length).toBeGreaterThan(0);
      expect(example.codeExample.code.length).toBeGreaterThan(50);
      expect(example.codeExample.explanation).not.toBe("");
    }
  });
});

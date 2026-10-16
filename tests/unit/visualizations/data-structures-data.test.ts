import { createHash } from "crypto";
import { describe, it, expect } from "vitest";
import { dataStructures } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/data-structures-comparison/data";

describe("data structures comparison data", () => {
  it("keeps the display order of the structures", () => {
    expect(Object.keys(dataStructures)).toEqual([
      "array",
      "linkedList",
      "stack",
      "queue",
      "hashTable",
      "binaryTree",
      "heap",
      "graph",
    ]);
  });

  it("describes every operation for every structure", () => {
    const operations = ["access", "search", "insertion", "deletion", "traversal", "sorting", "memory", "implementation"];
    for (const info of Object.values(dataStructures)) {
      expect(Object.keys(info.operations)).toEqual(operations);
      expect(info.useCases).toHaveLength(4);
      expect(info.advantages).toHaveLength(4);
      expect(info.disadvantages).toHaveLength(4);
      for (const op of Object.values(info.operations)) expect(["good", "medium", "bad"]).toContain(op.rating);
    }
  });

  it("keeps the content unchanged", () => {
    const digest = createHash("md5").update(JSON.stringify(dataStructures)).digest("hex");
    // md5 of the data object taken before the file was split
    expect(digest).toBe("e2aba9b2343d2540e20fe9f64b850c8b");
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  generateClearSteps,
  generateResizeSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/hash-table-visualization/clear-resize-steps";
import {
  generateGetSteps,
  generateRemoveSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/hash-table-visualization/get-remove-steps";
import { hashFunction } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/hash-table-visualization/hash-function";
import { generateInsertSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/hash-table-visualization/insert-steps";
import type { HashTableBucket } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/hash-table-visualization/types";

const empty = (size: number): HashTableBucket[] =>
  Array.from({ length: size }, (_, index) => ({ index, entries: [] }));
const last = <T,>(steps: T[]) => steps[steps.length - 1];

afterEach(() => vi.restoreAllMocks());

describe("hash table step generators", () => {
  it("hashes by summing char codes modulo the size", () => {
    expect(hashFunction("a", 7)).toBe(97 % 7);
    expect(hashFunction("ab", 7)).toBe((97 + 98) % 7);
    expect(hashFunction("", 7)).toBe(0);
  });

  it("insert adds an entry to the hashed bucket, then updates it on the second insert", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const input = empty(7);
    const steps = generateInsertSteps(input, "ab", "1", 7);
    expect(steps.map((s) => s.operationCount)).toEqual([0, 1, 2, 3]);
    expect(steps[1].message).toBe('Calcul de l\'index avec la fonction de hachage: hash("ab") = 6');
    const done = last(steps);
    expect(done.completed).toBe(true);
    expect(done.buckets[6].entries).toEqual([{ key: "ab", value: "1", id: "entry-1000-i" }]);
    expect(input[6].entries).toEqual([]);

    const again = generateInsertSteps(done.buckets, "ab", "2", 7);
    expect(last(again).message).toBe('Valeur mise à jour pour la clé "ab": 2');
    expect(last(again).buckets[6].entries).toHaveLength(1);
    expect(last(again).buckets[6].entries[0].value).toBe("2");
  });

  it("get finds an existing key and reports a missing one", () => {
    const buckets = empty(7);
    buckets[6].entries.push({ key: "ab", value: "1", id: "e1" });
    expect(last(generateGetSteps(buckets, "ab", 7))).toMatchObject({
      found: true,
      targetValue: "1",
      message: 'Clé "ab" trouvée dans le bucket 6. Valeur associée: 1',
    });
    expect(last(generateGetSteps(buckets, "zz", 7))).toMatchObject({ found: false });
  });

  it("remove deletes the entry without touching the input", () => {
    const buckets = empty(7);
    buckets[6].entries.push({ key: "ab", value: "1", id: "e1" });
    const steps = generateRemoveSteps(buckets, "ab", 7);
    expect(last(steps).buckets[6].entries).toEqual([]);
    expect(buckets[6].entries).toHaveLength(1);
    expect(last(generateRemoveSteps(buckets, "zz", 7)).message).toBe(
      'Clé "zz" non trouvée dans le bucket 6. Aucune suppression effectuée.',
    );
  });

  it("clear empties every bucket", () => {
    const buckets = empty(3);
    buckets[1].entries.push({ key: "k", value: "v", id: "e" });
    const steps = generateClearSteps(buckets);
    expect(steps[1].activeIndices).toEqual([0, 1, 2]);
    expect(last(steps).buckets.every((b) => b.entries.length === 0)).toBe(true);
  });

  it("resize rehashes every entry into the new table, summarising after five", () => {
    const buckets = empty(7);
    for (let i = 0; i < 8; i++) buckets[i % 7].entries.push({ key: `k${i}`, value: `${i}`, id: `e${i}` });
    const steps = generateResizeSteps(buckets, 5);
    const done = last(steps);
    expect(done.buckets).toHaveLength(5);
    expect(done.buckets.reduce((n, b) => n + b.entries.length, 0)).toBe(8);
    expect(steps.some((s) => s.message === "3 autres entrées réinsérées (étapes abrégées)")).toBe(true);
    expect(done.message).toBe("Table de hachage redimensionnée avec succès à 5 buckets");
  });
});

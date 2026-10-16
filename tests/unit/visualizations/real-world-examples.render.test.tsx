import { createHash } from "crypto";
import { describe, it, expect } from "vitest";
import { render, fireEvent, cleanup, screen } from "@testing-library/react";
import { RealWorldExamples } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/real-world-examples";

const LABELS = [
  "Tous",
  "Tableaux",
  "Listes Chaînées",
  "Piles",
  "Files",
  "Tables de Hachage",
  "Arbres Binaires",
];

function walk() {
  const { container } = render(<RealWorldExamples />);
  const hash = () =>
    createHash("md5")
      .update(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>"))
      .digest("hex")
      .slice(0, 8);
  const hashes = [hash()];
  for (const label of LABELS) {
    fireEvent.click(screen.getByText(label));
    hashes.push(hash());
    const count = container.querySelectorAll("button").length;
    // open every example in turn, then close the last one
    for (let i = 0; i < count; i++) {
      fireEvent.click(container.querySelectorAll("button")[i]);
      hashes.push(hash());
    }
    fireEvent.click(container.querySelectorAll("button")[count - 1]);
    hashes.push(hash());
  }
  cleanup();
  return hashes;
}

describe("RealWorldExamples rendering", () => {
  it("renders the same markup for every category filter and every opened example", () => {
    const hashes = walk();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "eb56f6b3",
        "eb56f6b3",
        "68a1fa4a",
        "b0470ab1",
        "979ba519",
        "064417ae",
        "e0f0fb0f",
        "962b7c78",
        "c0ce9038",
        "e3693a03",
        "26cdad36",
        "e3693a03",
        "1db34427",
        "3669e5f9",
        "a88d0bf8",
        "9628b77f",
        "1d20dc64",
        "0fca60e3",
        "4b2be7ec",
        "c4b2f69d",
        "4799d457",
        "a7e689c0",
        "e0edae0e",
        "0d4c134e",
        "b3ad9304",
        "8dacafb3",
        "142ac80f",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(walk()).toEqual(walk());
  });
});

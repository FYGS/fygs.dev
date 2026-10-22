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
        "7abae916",
        "7abae916",
        "70bf4a54",
        "2b77e200",
        "53deff9a",
        "1e4cd5c6",
        "ed0b2057",
        "bad0aadc",
        "e9d92a81",
        "f8353d93",
        "8afca7b7",
        "f8353d93",
        "bb96ba35",
        "43c51c43",
        "f0f8afdf",
        "9abcc93a",
        "28f6f539",
        "6e9fd822",
        "a50f940f",
        "0c9db8d0",
        "f8df5ee7",
        "33f4ce35",
        "ff1468e5",
        "7089159b",
        "f380924c",
        "e0b47ee2",
        "435960a2",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(walk()).toEqual(walk());
  });
});

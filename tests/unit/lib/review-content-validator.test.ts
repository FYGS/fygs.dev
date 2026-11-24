import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { ReviewContentValidator } from "@/lib/validators/review-validators";

describe("ReviewContentValidator forbidden words", () => {
  it.each([
    "This class was great and the assignment helped a lot",
    "Hello, the assistant explained the analyse step clearly",
    "Emily Dickinson is quoted in the bonus lesson about poetry",
    "The Scunthorpe example shows why naive filters fail",
    "Un cours de grande classe, une passation très claire",
    "Shellfish and the shell scripting module were excellent",
    "I passed the exam, the compass lesson was well paced",
    "Mon email est joe@example.org pour toute question",
  ])("does not flag ordinary text: %s", (text) => {
    expect(ReviewContentValidator.findForbiddenWords(text)).toEqual([]);
    const result = ReviewContentValidator.validateContent(text);
    expect(result.issues.join("|")).not.toContain("Contenu inapproprié");
    expect(result.isValid).toBe(true);
  });

  it.each([
    ["What the fuck is this course", ["fuck"]],
    ["SHIT content.", ["shit"]],
    ["go to hell!", ["hell"]],
    ["(damn) it", ["damn"]],
    ["You are an ass, really", ["ass"]],
    ["bitch,please", ["bitch"]],
    ["Please CLICK   HERE now", ["click here"]],
    ["mail me at john@gmail.com", ["@gmail.com"]],
    ["ping me on WhatsApp or Telegram", ["whatsapp", "telegram"]],
    ["Résultat garanti: free money inside", ["free money"]],
  ])("flags real violations: %s", (text, expected) => {
    expect(ReviewContentValidator.findForbiddenWords(text)).toEqual(expected);
  });

  it("still lowers confidence for real matches", () => {
    const clean = ReviewContentValidator.validateContent(
      "The class was clear and well structured"
    );
    const dirty = ReviewContentValidator.validateContent(
      "The class was shit and well structured"
    );
    expect(dirty.confidence).toBeCloseTo(clean.confidence - 0.3, 5);
    expect(dirty.issues[0]).toContain("shit");
  });

  it("does not match across a non-ASCII letter boundary", () => {
    expect(ReviewContentValidator.findForbiddenWords("éass et assé")).toEqual(
      []
    );
  });
});

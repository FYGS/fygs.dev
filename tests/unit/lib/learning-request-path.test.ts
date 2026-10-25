import { describe, expect, it } from "vitest";
import { learnPathOf, returnPathFor } from "@/lib/learning/request-path";

describe("learnPathOf", () => {
  it("keeps the learning-area path without the locale, with the query", () => {
    expect(learnPathOf("/fr/learn/react/lessons/intro", "?t=1")).toBe("/learn/react/lessons/intro?t=1");
    expect(learnPathOf("/fr/learn/react", "")).toBe("/learn/react");
  });
  it("ignores every other page", () => {
    expect(learnPathOf("/fr/formations/react", "")).toBeNull();
    expect(learnPathOf("/fr/learn", "")).toBeNull();
    expect(learnPathOf("/fr/dashboard", "")).toBeNull();
  });
});

describe("returnPathFor", () => {
  it("comes back to the step that was asked for", () => {
    expect(returnPathFor("react", "/learn/react/quizzes/q1")).toBe("/learn/react/quizzes/q1");
    expect(returnPathFor("react", "/learn/react?x=1")).toBe("/learn/react?x=1");
  });
  it("never leaves the course: another course, a prefix look-alike or nothing gives the course home", () => {
    expect(returnPathFor("react", "/learn/vue/lessons/a")).toBe("/learn/react");
    expect(returnPathFor("react", "/learn/react-advanced/lessons/a")).toBe("/learn/react");
    expect(returnPathFor("react", "https://evil.example/learn/react")).toBe("/learn/react");
    expect(returnPathFor("react", null)).toBe("/learn/react");
  });
});

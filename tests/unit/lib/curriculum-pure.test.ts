import { describe, expect, it } from "vitest";
import { checkPublishReadiness, lessonStatus, type ReadinessInput } from "@/lib/curriculum/publish";
import { applyOrder, moveId, nextOrder, sameIdSet, TEMP_ORDER_BASE } from "@/lib/curriculum/ordering";
import { isEmptyHtml, normalizeFaq, normalizeObjectives, normalizeTrailerUrl } from "@/lib/curriculum/content";
import { moveLessonInSnapshot, moveModuleInSnapshot, replaceLessonInSnapshot, allLessons } from "@/lib/curriculum/snapshot";
import type { CurriculumSnapshot, LessonSummary } from "@/lib/curriculum/curriculum";
import { validateQuestions } from "@/lib/curriculum/questions";
import { SLUG_PATTERN } from "@/lib/curriculum/slug-pattern";
import { courseMinutesFromLessons, formatMinutes, formatSeconds } from "@/lib/format-duration";
import { lessonContentToEditorHtml, looksLikeHtml } from "@/lib/curriculum/markdown";

const readyCourse = (patch: Partial<ReadinessInput> = {}): ReadinessInput => ({
  title: "Une formation",
  description: "Une description assez longue",
  thumbnail: "https://cdn.example.com/c.png",
  accessTier: "FREE",
  price: null,
  lessons: [{ title: "A", published: true, hasVideo: false, hasContent: true }],
  ...patch,
});

describe("checkPublishReadiness", () => {
  it("accepts a complete free course", () => {
    const r = checkPublishReadiness(readyCourse());
    expect(r.ready).toBe(true);
    expect(r.missing).toEqual([]);
    expect(r.items.map((i) => i.key)).toEqual(["title", "description", "thumbnail", "lessons", "materials"]);
  });

  it("lists each missing item, in order", () => {
    const r = checkPublishReadiness(readyCourse({ title: "ab", description: "court", thumbnail: null, lessons: [] }));
    expect(r.ready).toBe(false);
    expect(r.items.filter((i) => !i.ok).map((i) => i.key)).toEqual(["title", "description", "thumbnail", "lessons"]);
    expect(r.missing).toHaveLength(4);
  });

  it("ignores lessons still in draft, even empty ones", () => {
    const r = checkPublishReadiness(
      readyCourse({
        lessons: [
          { title: "Prête", published: true, hasVideo: true, hasContent: false },
          { title: "Brouillon vide", published: false, hasVideo: false, hasContent: false },
        ],
      }),
    );
    expect(r.ready).toBe(true);
  });

  it("refuses a published lesson with neither video nor content and names it", () => {
    const r = checkPublishReadiness(
      readyCourse({
        lessons: [
          { title: "Bonne", published: true, hasVideo: true, hasContent: false },
          { title: "Vide", published: true, hasVideo: false, hasContent: false },
        ],
      }),
    );
    const materials = r.items.find((i) => i.key === "materials");
    expect(materials?.ok).toBe(false);
    expect(materials?.hint).toContain("« Vide »");
    expect(materials?.hint).not.toContain("« Bonne »");
  });

  it("only requires a price for a premium course, and it must be above zero", () => {
    expect(checkPublishReadiness(readyCourse({ accessTier: "FREE", price: 0 })).ready).toBe(true);
    const zero = checkPublishReadiness(readyCourse({ accessTier: "PREMIUM", price: 0 }));
    expect(zero.items.find((i) => i.key === "price")?.ok).toBe(false);
    expect(checkPublishReadiness(readyCourse({ accessTier: "PREMIUM", price: null })).ready).toBe(false);
    expect(checkPublishReadiness(readyCourse({ accessTier: "PREMIUM", price: 49 })).ready).toBe(true);
  });

  it("trims before measuring", () => {
    expect(checkPublishReadiness(readyCourse({ title: "  a  ", description: "          x" })).ready).toBe(false);
    expect(checkPublishReadiness(readyCourse({ thumbnail: "   " })).ready).toBe(false);
  });

  it("derives a lesson status", () => {
    expect(lessonStatus({ published: false, hasVideo: true, hasContent: true })).toBe("draft");
    expect(lessonStatus({ published: true, hasVideo: false, hasContent: false })).toBe("incomplete");
    expect(lessonStatus({ published: true, hasVideo: true, hasContent: false })).toBe("ready");
    expect(lessonStatus({ published: true, hasVideo: false, hasContent: true })).toBe("ready");
  });
});

describe("ordering", () => {
  /** A table with unique(order): setting a taken order throws, like Postgres would. */
  function table(orders: Record<string, number>) {
    const rows = { ...orders };
    const writes: string[] = [];
    return {
      rows,
      writes,
      current: () => Object.entries(rows).map(([id, order]) => ({ id, order })),
      set: async (id: string, order: number) => {
        if (Object.entries(rows).some(([other, o]) => other !== id && o === order)) throw new Error(`unique violation on ${order}`);
        rows[id] = order;
        writes.push(`${id}=${order}`);
      },
    };
  }

  it("finds the next position after the highest, not the count", () => {
    expect(nextOrder([])).toBe(1);
    expect(nextOrder([1, 2, 3])).toBe(4);
    expect(nextOrder([1, 3, 7])).toBe(8);
  });

  it("moves an id with clamping", () => {
    expect(moveId(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
    expect(moveId(["a", "b", "c"], "a", 99)).toEqual(["b", "c", "a"]);
    expect(moveId(["a", "b", "c"], "b", -5)).toEqual(["b", "a", "c"]);
  });

  it("compares id sets strictly", () => {
    expect(sameIdSet(["a", "b"], ["b", "a"])).toBe(true);
    expect(sameIdSet(["a", "b"], ["a", "a"])).toBe(false);
    expect(sameIdSet(["a", "a"], ["a", "b"])).toBe(false);
    expect(sameIdSet(["a"], ["a", "b"])).toBe(false);
  });

  it("applies an order that swaps rows without ever breaking unique(order)", async () => {
    const t = table({ a: 1, b: 2, c: 3 });
    await applyOrder(t.current(), ["c", "b", "a"], t.set);
    expect(t.rows).toEqual({ c: 1, b: 2, a: 3 });
    expect(Math.max(...Object.values(t.rows))).toBeLessThan(TEMP_ORDER_BASE);
  });

  it("closes a gap and writes only the rows that moved", async () => {
    const t = table({ a: 1, c: 3, d: 4 });
    await applyOrder(t.current(), ["a", "c", "d"], t.set);
    expect(t.rows).toEqual({ a: 1, c: 2, d: 3 });
    expect(t.writes.some((w) => w.startsWith("a="))).toBe(false);
  });

  it("does nothing when nothing changes", async () => {
    const t = table({ a: 1, b: 2 });
    await applyOrder(t.current(), ["a", "b"], t.set);
    expect(t.writes).toEqual([]);
  });

  it("handles a rotation", async () => {
    const t = table({ a: 1, b: 2, c: 3, d: 4 });
    await applyOrder(t.current(), ["b", "c", "d", "a"], t.set);
    expect(t.rows).toEqual({ b: 1, c: 2, d: 3, a: 4 });
  });
});

describe("content normalization", () => {
  it("cleans a FAQ from an array or from the old JSON string", () => {
    expect(normalizeFaq([{ q: " Q ", a: " R " }, { q: "", a: "x" }, { q: "y" }, null, "z"])).toEqual([{ q: "Q", a: "R" }]);
    expect(normalizeFaq('[{"q":"A","a":"B"}]')).toEqual([{ q: "A", a: "B" }]);
    expect(normalizeFaq("not json")).toEqual([]);
    expect(normalizeFaq("")).toEqual([]);
    expect(normalizeFaq(null)).toEqual([]);
    expect(normalizeFaq({})).toEqual([]);
  });

  it("cleans objectives: trims, drops blanks and duplicates, caps the count", () => {
    expect(normalizeObjectives(["  Écrire  un   test ", "écrire un test", "", "   ", 3, "Lancer la CI"])).toEqual(["Écrire un test", "Lancer la CI"]);
    expect(normalizeObjectives(Array.from({ length: 30 }, (_, i) => `Objectif ${i}`))).toHaveLength(12);
    expect(normalizeObjectives("nope")).toEqual([]);
  });

  it("accepts http(s) trailers only", () => {
    expect(normalizeTrailerUrl("")).toBeNull();
    expect(normalizeTrailerUrl(undefined)).toBeNull();
    expect(normalizeTrailerUrl("https://cdn.example.com/t.mp4")).toBe("https://cdn.example.com/t.mp4");
    expect(normalizeTrailerUrl("javascript:alert(1)")).toBeUndefined();
    expect(normalizeTrailerUrl("pas une adresse")).toBeUndefined();
  });

  it("tells empty rich text from content", () => {
    expect(isEmptyHtml("")).toBe(true);
    expect(isEmptyHtml(null)).toBe(true);
    expect(isEmptyHtml("<p></p>")).toBe(true);
    expect(isEmptyHtml("<p>&nbsp; </p><p> </p>")).toBe(true);
    expect(isEmptyHtml("<p>Bonjour</p>")).toBe(false);
    expect(isEmptyHtml('<img src="https://x/y.png">')).toBe(false);
    expect(isEmptyHtml("<pre><code>x</code></pre>")).toBe(false);
  });

  it("checks course addresses", () => {
    for (const ok of ["react", "react-avance", "cours-2026", "a1"]) expect(SLUG_PATTERN.test(ok), ok).toBe(true);
    for (const bad of ["-react", "react-", "re--act", "React", "react avance", "réact", ""]) expect(SLUG_PATTERN.test(bad), bad).toBe(false);
  });
});

describe("questions", () => {
  const q = (patch = {}) => ({ question: "Q ?", options: ["a", "b"], correct: 0, ...patch });

  it("accepts a well-formed question and trims it", () => {
    const r = validateQuestions([q({ question: "  Q ?  ", options: [" a ", "b "], explanation: "  " })]);
    expect(r).toEqual({ ok: true, questions: [{ id: undefined, question: "Q ?", options: ["a", "b"], correct: 0, explanation: null }] });
  });

  it("names the question that is wrong", () => {
    const r = validateQuestions([q(), q({ options: ["a", "a"] })]);
    expect(r).toMatchObject({ ok: false, error: expect.stringContaining("Question 2") });
  });

  it("bounds answers and the correct index", () => {
    expect(validateQuestions([q({ options: ["a"] })]).ok).toBe(false);
    expect(validateQuestions([q({ options: ["1", "2", "3", "4", "5", "6", "7"] })]).ok).toBe(false);
    expect(validateQuestions([q({ correct: -1 })]).ok).toBe(false);
    expect(validateQuestions([q({ correct: 1.5 })]).ok).toBe(false);
    expect(validateQuestions([]).ok).toBe(true);
  });
});

describe("snapshot edits", () => {
  const lesson = (id: string, order: number, moduleId: string | null): LessonSummary => ({
    id,
    moduleId,
    title: id,
    slug: id,
    order,
    published: true,
    isPreview: false,
    duration: 60,
    hasVideo: true,
    hasContent: false,
    resourceCount: 0,
    status: "ready",
  });
  const snapshot: CurriculumSnapshot = {
    modules: [
      { id: "m1", title: "M1", slug: "m1", order: 1, quizCount: 0, supportCount: 0, lessons: [lesson("a", 1, "m1"), lesson("b", 2, "m1")] },
      { id: "m2", title: "M2", slug: "m2", order: 2, quizCount: 0, supportCount: 0, lessons: [lesson("x", 1, "m2")] },
    ],
    looseLessons: [lesson("loose", 1, null)],
  };
  const ids = (s: CurriculumSnapshot) => s.modules.map((m) => `${m.id}:${m.lessons.map((l) => `${l.id}${l.order}`).join(",")}`);

  it("reorders modules and renumbers them", () => {
    const next = moveModuleInSnapshot(snapshot, "m2", 0);
    expect(next.modules.map((m) => `${m.id}${m.order}`)).toEqual(["m21", "m12"]);
  });

  it("moves a lesson inside its module", () => {
    expect(ids(moveLessonInSnapshot(snapshot, "b", "m1", 0))).toEqual(["m1:b1,a2", "m2:x1"]);
  });

  it("moves a lesson to another module and closes the gap behind it", () => {
    expect(ids(moveLessonInSnapshot(snapshot, "a", "m2", 0))).toEqual(["m1:b1", "m2:a1,x2"]);
    const moved = moveLessonInSnapshot(snapshot, "a", "m2", 0).modules[1].lessons[0];
    expect(moved.moduleId).toBe("m2");
  });

  it("files a loose lesson into a module", () => {
    const next = moveLessonInSnapshot(snapshot, "loose", "m1", 99);
    expect(ids(next)).toEqual(["m1:a1,b2,loose3", "m2:x1"]);
    expect(next.looseLessons).toEqual([]);
  });

  it("leaves the outline alone for an unknown lesson or module", () => {
    expect(moveLessonInSnapshot(snapshot, "nope", "m1", 0)).toBe(snapshot);
    expect(moveLessonInSnapshot(snapshot, "a", "nope", 0)).toBe(snapshot);
  });

  it("merges a saved lesson without touching its position", () => {
    const next = replaceLessonInSnapshot(snapshot, { ...lesson("b", 99, "m1"), title: "Nouveau", status: "draft", published: false });
    const b = next.modules[0].lessons[1];
    expect(b).toMatchObject({ title: "Nouveau", status: "draft", order: 2 });
    expect(allLessons(next)).toHaveLength(4);
  });
});

describe("durations", () => {
  it("formats minutes and seconds in French", () => {
    expect(formatMinutes(0)).toBe("");
    expect(formatMinutes(null)).toBe("");
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(125)).toBe("2 h 05");
    expect(formatSeconds(30)).toBe("30 s");
    expect(formatSeconds(750)).toBe("13 min");
    expect(formatSeconds(3900)).toBe("1 h 05");
    expect(formatSeconds(undefined)).toBe("");
  });

  it("sums lesson seconds into course minutes", () => {
    expect(courseMinutesFromLessons([600, 1800, null])).toBe(40);
    expect(courseMinutesFromLessons([10])).toBe(1);
    expect(courseMinutesFromLessons([null, 0])).toBe(0);
  });
});

describe("lesson content for the editor", () => {
  it("leaves HTML alone", () => {
    const html = "<h2>Titre</h2><p>Texte</p>";
    expect(looksLikeHtml(html)).toBe(true);
    expect(lessonContentToEditorHtml(html)).toBe(html);
  });

  it("turns Markdown into HTML so the author never sees literal # signs", () => {
    const html = lessonContentToEditorHtml("# Titre\n\nUn **mot** et `code`.\n\n```js\nconst a = 1;\n```\n\n- un\n- deux");
    expect(html).toContain("<h1>Titre</h1>");
    expect(html).toContain("<strong>mot</strong>");
    expect(html).toContain("<code>code</code>");
    expect(html).toContain('<code class="language-js">');
    expect(html).toContain("<li>deux</li>");
    expect(html).not.toContain("# Titre");
  });

  it("returns an empty string for nothing", () => {
    expect(lessonContentToEditorHtml(null)).toBe("");
    expect(lessonContentToEditorHtml("  \n ")).toBe("");
  });
});

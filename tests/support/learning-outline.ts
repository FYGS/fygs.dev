import { buildOutline, type CourseOutline } from "@/lib/learning/outline";

/** Two modules: m1 has two lessons and a quiz, m2 one lesson; and a final exam. */
export function sampleOutline(): CourseOutline {
  return buildOutline({
    modules: [
      { id: "m1", title: "Bases", slug: "bases", order: 1 },
      { id: "m2", title: "Avancé", slug: "avance", order: 2 },
    ],
    lessons: [
      { id: "l1", slug: "variables", title: "Variables", order: 1, duration: 300, moduleId: "m1", isPreview: true },
      { id: "l2", slug: "fonctions", title: "Fonctions", order: 2, duration: 600, moduleId: "m1" },
      { id: "l3", slug: "async", title: "Asynchrone", order: 1, duration: 900, moduleId: "m2" },
    ],
    quizzes: [{ id: "q1", title: "Quiz des bases", moduleId: "m1", questionCount: 2 }],
    exam: { id: "x1", title: "Examen final", questionCount: 5 },
  });
}

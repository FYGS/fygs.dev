import {
  type PrismaClient,
} from "../../../lib/generated/prisma/client";
import { visualSupportsData } from "../data/visual-supports";

/** Visual supports and quizzes. */
export async function seedVisualSupports(
  prisma: PrismaClient,
  { courses }: { courses: any[] },
): Promise<void> {
  // 12. Create visual supports and quizzes
  console.log("🎯 Creating visual supports and interactive quizzes...");

  // Visual supports for first two courses
  const supportCourses = courses.slice(0, 2);

  for (
    let courseIndex = 0;
    courseIndex < supportCourses.length;
    courseIndex++
  ) {
    const course = supportCourses[courseIndex];

    await prisma.visualSupport.create({
      data: {
        courseId: course.id,
        moduleId: courseIndex + 1,
        title:
          courseIndex === 0
            ? "Fondamentaux JavaScript"
            : "Patterns React Avancés",
        content:
          courseIndex === 0
            ? visualSupportsData.nextjsEvolution
            : visualSupportsData.reactPatterns,
        order: 1,
      },
    });

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        moduleId: courseIndex + 1,
        title: `Quiz - Module ${courseIndex + 1}`,
      },
    });

    // Add quiz questions
    const questions =
      courseIndex === 0
        ? [
            {
              question:
                "Quelle est la principale différence entre `var` et `let` en JavaScript ?",
              options: [
                "Aucune différence",
                "La portée (scope)",
                "La syntaxe",
                "La performance",
              ],
              correct: 1,
              explanation:
                "`let` a une portée de bloc tandis que `var` a une portée de fonction.",
            },
            {
              question: "Que retourne `typeof null` en JavaScript ?",
              options: ["'null'", "'undefined'", "'object'", "'boolean'"],
              correct: 2,
              explanation:
                "C'est un bug historique de JavaScript. `typeof null` retourne 'object'.",
            },
          ]
        : [
            {
              question: "Quel hook React permet de mémoriser une fonction ?",
              options: ["useMemo", "useCallback", "useRef", "useEffect"],
              correct: 1,
              explanation:
                "`useCallback` mémorise une fonction pour éviter sa recréation inutile.",
            },
          ];

    for (let qIndex = 0; qIndex < questions.length; qIndex++) {
      const q = questions[qIndex];

      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          order: qIndex + 1,
        },
      });
    }
  }
  console.log("✅ Created visual supports and quizzes");
}

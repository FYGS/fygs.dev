import {
  type PrismaClient,
} from "../../../lib/generated/prisma/client";

/** Final exams for premium courses. */
export async function seedFinalExams(
  prisma: PrismaClient,
  { courses }: { courses: any[] },
): Promise<{ finalExams: any[] }> {
  // 13. Create final exams for premium courses
  console.log("📝 Creating final exams...");

  const premiumCourses = courses.filter((c) => c.accessTier === "PREMIUM");

  const finalExams: any[] = [];
  for (const course of premiumCourses) {
    const exam = await prisma.finalExam.create({
      data: {
        courseId: course.id,
        title: `Examen final - ${course.title}`,
        description: `Évaluez vos connaissances acquises dans ce cours avec cet examen complet.`,
        passingScore: 70,
        timeLimit: 60, // 60 minutes
        published: true,
        questions: [
          {
            id: 1,
            question:
              "Quelle est la meilleure pratique pour gérer l'état dans une application React complexe ?",
            options: [
              "Utiliser uniquement useState",
              "Combiner Context API et useReducer pour l'état global",
              "Tout mettre dans le composant racine",
              "Éviter complètement la gestion d'état",
            ],
            correct: 1,
            explanation:
              "Combiner Context API et useReducer offre une solution scalable pour l'état global.",
          },
          {
            id: 2,
            question:
              "Qu'est-ce que le code splitting et pourquoi est-il important ?",
            options: [
              "Une technique pour diviser le code en plusieurs fichiers",
              "Un pattern pour séparer la logique métier",
              "Une méthode pour charger le code uniquement quand nécessaire, améliorant les performances",
              "Une convention de nommage pour les modules",
            ],
            correct: 2,
            explanation:
              "Le code splitting permet de charger le code à la demande, réduisant le bundle initial.",
          },
          {
            id: 3,
            question:
              "Quelle est la différence principale entre SSR et SSG ?",
            options: [
              "SSR génère le HTML à chaque requête, SSG le génère au build",
              "Il n'y a aucune différence",
              "SSR est pour les blogs, SSG pour les apps",
              "SSG nécessite un serveur, pas SSR",
            ],
            correct: 0,
            explanation:
              "SSR (Server-Side Rendering) génère le HTML à la demande, SSG (Static Site Generation) le pré-génère.",
          },
          {
            id: 4,
            question: "Qu'est-ce qu'une race condition ?",
            options: [
              "Un bug de performance",
              "Une situation où le résultat dépend de l'ordre d'exécution de processus asynchrones",
              "Un type de boucle infinie",
              "Une erreur de syntaxe",
            ],
            correct: 1,
            explanation:
              "Une race condition survient quand plusieurs opérations asynchrones se terminent dans un ordre imprévisible.",
          },
          {
            id: 5,
            question:
              "Quelle est la meilleure façon de sécuriser une API REST ?",
            options: [
              "Ne pas la sécuriser",
              "Utiliser uniquement HTTPS",
              "Combiner authentification JWT, HTTPS, rate limiting et validation des entrées",
              "Masquer l'URL de l'API",
            ],
            correct: 2,
            explanation:
              "Une sécurité en profondeur combine plusieurs couches de protection.",
          },
        ],
      },
    });
    finalExams.push(exam);
  }
  console.log(`✅ Created ${finalExams.length} final exams`);

  return { finalExams };
}

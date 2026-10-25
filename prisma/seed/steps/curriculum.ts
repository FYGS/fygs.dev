import {
  type PrismaClient,
} from "../../../lib/generated/prisma/client";
import { slugify } from "../../../lib/text/slug";

/** Course modules and lessons. */
export async function seedCurriculum(
  prisma: PrismaClient,
  { courses }: { courses: any[] },
): Promise<void> {
  // 6. Create course modules and lessons
  console.log("📖 Creating course content structure...");
  const modulesAndLessons = [
    {
      courseIndex: 0, // JavaScript Fundamentals
      modules: [
        {
          title: "Fondamentaux JavaScript",
          lessons: [
            {
              title: "Introduction à JavaScript",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Variables et Types de données",
              duration: 35,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Opérateurs et Expressions",
              duration: 30,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Structures de contrôle",
              duration: 40,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
        {
          title: "Fonctions et Objets",
          lessons: [
            {
              title: "Fonctions de base",
              duration: 35,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Objets et Propriétés",
              duration: 40,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Méthodes et This",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
        {
          title: "DOM et Événements",
          lessons: [
            {
              title: "Manipulation du DOM",
              duration: 50,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Gestion des événements",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Projet : Application interactive",
              duration: 60,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
      ],
    },
    {
      courseIndex: 2, // Next.js Full-Stack
      modules: [
        {
          title: "Next.js App Router",
          lessons: [
            {
              title: "Introduction App Router",
              duration: 30,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Routing et Navigation",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Layouts et Templates",
              duration: 40,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
        {
          title: "Server Components",
          lessons: [
            {
              title: "Server vs Client Components",
              duration: 35,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Data Fetching Patterns",
              duration: 50,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Streaming et Suspense",
              duration: 40,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
      ],
    },
    {
      courseIndex: 1, // React Advanced Patterns
      modules: [
        {
          title: "Patterns de composition",
          lessons: [
            {
              title: "Composition et render props",
              duration: 40,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Hooks personnalisés",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Mémoïsation et performance",
              duration: 50,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
      ],
    },
    {
      courseIndex: 3, // TypeScript
      modules: [
        {
          title: "Typer son code",
          lessons: [
            {
              title: "Types de base et inférence",
              duration: 35,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Interfaces et alias de types",
              duration: 40,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Génériques",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
      ],
    },
    {
      courseIndex: 6, // Frontend Moderne
      modules: [
        {
          title: "Interfaces accessibles et responsives",
          lessons: [
            {
              title: "HTML sémantique et accessibilité",
              duration: 35,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "CSS moderne : grid et flexbox",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Outillage avec Vite",
              duration: 30,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
      ],
    },
    {
      courseIndex: 7, // Backend Node.js
      modules: [
        {
          title: "Fondations d'un backend Node.js",
          lessons: [
            {
              title: "Architecture d'une API Node.js",
              duration: 40,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Gestion des erreurs et journalisation",
              duration: 35,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
            {
              title: "Scalabilité horizontale",
              duration: 45,
              videoUrl: "https://player.vimeo.com/video/287094149",
            },
          ],
        },
      ],
    },
  ];

  for (const courseContent of modulesAndLessons) {
    const course = courses[courseContent.courseIndex];

    for (
      let moduleIndex = 0;
      moduleIndex < courseContent.modules.length;
      moduleIndex++
    ) {
      const moduleData = courseContent.modules[moduleIndex];

      const courseModule = await prisma.module.create({
        data: {
          courseId: course.id,
          title: moduleData.title,
          slug: slugify(moduleData.title),
          order: moduleIndex + 1,
        },
      });

      for (
        let lessonIndex = 0;
        lessonIndex < moduleData.lessons.length;
        lessonIndex++
      ) {
        const lessonData = moduleData.lessons[lessonIndex];

        await prisma.lesson.create({
          data: {
            courseId: course.id,
            moduleId: courseModule.id,
            title: lessonData.title,
            slug: slugify(lessonData.title),
            description: `Apprenez ${lessonData.title.toLowerCase()} avec des exemples pratiques et des exercices.`,
            content: `# ${lessonData.title}\n\nContenu détaillé de la leçon avec explications, exemples de code et exercices pratiques.`,
            videoUrl: lessonData.videoUrl,
            // The lesson list above is written in minutes; Lesson.duration is stored in seconds
            duration: lessonData.duration * 60,
            order: lessonIndex + 1,
            published: true,
          },
        });
      }
    }
  }
  console.log("✅ Created course modules and lessons");
}

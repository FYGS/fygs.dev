import {
  type PrismaClient,
} from "@prisma/client";

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
          slug: moduleData.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
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
            slug: lessonData.title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            description: `Apprenez ${lessonData.title.toLowerCase()} avec des exemples pratiques et des exercices.`,
            content: `# ${lessonData.title}\n\nContenu détaillé de la leçon avec explications, exemples de code et exercices pratiques.`,
            videoUrl: lessonData.videoUrl,
            duration: lessonData.duration,
            order: lessonIndex + 1,
            published: true,
          },
        });
      }
    }
  }
  console.log("✅ Created course modules and lessons");
}

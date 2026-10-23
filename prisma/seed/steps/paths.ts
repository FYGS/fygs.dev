import { CourseLevel, type PrismaClient } from "../../../lib/generated/prisma/client";

/** Learning paths built from the seeded catalog: one free path, one that mixes free and premium courses. */
export async function seedPaths(prisma: PrismaClient, { courses }: { courses: any[] }): Promise<{ paths: number }> {
  console.log("🧭 Creating learning paths...");

  const byTitle = (fragment: string) => {
    const course = courses.find((c) => String(c.title).includes(fragment));
    if (!course) throw new Error(`Seed path: no course with "${fragment}" in its title`);
    return course;
  };

  const definitions = [
    {
      slug: "bases-du-web-moderne",
      title: "Les bases du web moderne",
      description:
        "Partez de zéro : le langage JavaScript, un typage solide avec TypeScript, puis les fondations du développement frontend. Trois formations gratuites, dans l'ordre où elles se construisent les unes sur les autres.",
      level: CourseLevel.BEGINNER,
      featured: true,
      objectives: [
        "Écrire du JavaScript clair et maîtriser ses pièges classiques",
        "Typer une base de code avec TypeScript",
        "Construire une interface web accessible et responsive",
      ],
      courses: [
        { fragment: "JavaScript Fundamentals" },
        { fragment: "TypeScript pour développeurs" },
        { fragment: "Développement Frontend Moderne" },
      ],
    },
    {
      slug: "developpeur-full-stack-javascript",
      title: "Développeur full-stack JavaScript",
      description:
        "De React à Next.js puis au backend Node.js : le chemin complet pour livrer une application web de bout en bout. Les formations Premium demandent un abonnement ou un achat.",
      level: CourseLevel.INTERMEDIATE,
      featured: false,
      objectives: [
        "Structurer une application React performante",
        "Livrer une application full-stack avec Next.js",
        "Concevoir un backend Node.js qui monte en charge",
      ],
      courses: [
        { fragment: "TypeScript pour développeurs" },
        { fragment: "React Advanced Patterns" },
        { fragment: "Next.js 15 Full-Stack" },
        { fragment: "Architecture Backend Scalable", optional: true },
      ],
    },
  ];

  for (const definition of definitions) {
    const resolved = definition.courses.map((c) => ({ course: byTitle(c.fragment), optional: "optional" in c && c.optional === true }));
    await prisma.path.create({
      data: {
        slug: definition.slug,
        title: definition.title,
        description: definition.description,
        level: definition.level,
        featured: definition.featured,
        objectives: definition.objectives,
        thumbnail: resolved[0].course.thumbnail ?? null,
        published: true,
        publishedAt: new Date(),
        courses: {
          create: resolved.map(({ course, optional }, index) => ({ courseId: course.id, order: index + 1, optional })),
        },
      },
    });
  }

  console.log(`✅ Created ${definitions.length} learning paths`);
  return { paths: definitions.length };
}

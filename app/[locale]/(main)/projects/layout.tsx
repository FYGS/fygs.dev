import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for projects with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Portfolio Projets - Développement Full-Stack & Ingénierie Logicielle",
      en: "Projects Portfolio - Full-Stack Development & Software Engineering",
      es: "Portfolio de Proyectos - Desarrollo Full-Stack e Ingeniería de Software",
    },
    description: {
      fr: "Découvrez mon portfolio de projets de développement full-stack, avec des applications web construites avec Next.js, React, TypeScript et Node.js. Exemples concrets d'ingénierie logicielle moderne.",
      en: "Discover my portfolio of full-stack development projects, featuring web applications built with Next.js, React, TypeScript, and Node.js. Real-world examples of modern software engineering.",
      es: "Descubre mi portfolio de proyectos de desarrollo full-stack, con aplicaciones web construidas con Next.js, React, TypeScript y Node.js. Ejemplos reales de ingeniería de software moderna.",
    },
    keywords: [
      {
        fr: "projets ingénierie logicielle",
        en: "software engineering projects",
        es: "proyectos ingeniería software",
      },
      {
        fr: "portfolio développement web",
        en: "web development portfolio",
        es: "portfolio desarrollo web",
      },
      {
        fr: "applications full-stack",
        en: "full-stack applications",
        es: "aplicaciones full-stack",
      },
      {
        fr: "projets Next.js",
        en: "Next.js projects",
        es: "proyectos Next.js",
      },
      "React",
      "TypeScript",
      "Node.js",
      {
        fr: "développement web moderne",
        en: "modern web development",
        es: "desarrollo web moderno",
      },
    ],
    path: "/projects",
    image: "/api/og/projects",
  });
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

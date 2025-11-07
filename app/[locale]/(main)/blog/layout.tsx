import { generateRouteMetadata } from "../_lib/metadata-helpers";
import { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for blog with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Blog Technique - Insights & Bonnes Pratiques en Développement",
      en: "Technical Blog - Software Engineering Insights & Best Practices",
      es: "Blog Técnico - Insights y Mejores Prácticas en Desarrollo",
    },
    description: {
      fr: "Explorez des articles approfondis sur l'ingénierie logicielle, le développement web, l'architecture cloud et les meilleures pratiques. Apprenez React, TypeScript, Node.js et les techniques de développement moderne.",
      en: "Explore in-depth articles on software engineering, web development, cloud architecture, and best practices. Learn about React, TypeScript, Node.js, and modern development techniques.",
      es: "Explora artículos en profundidad sobre ingeniería de software, desarrollo web, arquitectura en la nube y mejores prácticas. Aprende sobre React, TypeScript, Node.js y técnicas de desarrollo moderno.",
    },
    keywords: [
      {
        fr: "blog développement",
        en: "development blog",
        es: "blog desarrollo",
      },
      {
        fr: "ingénierie logicielle",
        en: "software engineering",
        es: "ingeniería de software",
      },
      {
        fr: "tutoriels techniques",
        en: "technical tutorials",
        es: "tutoriales técnicos",
      },
      {
        fr: "bonnes pratiques programmation",
        en: "programming best practices",
        es: "mejores prácticas programación",
      },
      "React",
      "TypeScript",
      "Node.js",
      "Next.js",
      {
        fr: "développement full-stack",
        en: "full-stack development",
        es: "desarrollo full-stack",
      },
    ],
    path: "/blog",
    image: "/api/og/blog",
  });
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

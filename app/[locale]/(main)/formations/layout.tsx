import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata formations with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Formations | Plateforme d'apprentissage moderne",
      en: "Courses | Modern Learning Platform",
      es: "Cursos | Plataforma de Aprendizaje Moderna",
    },
    description: {
      fr: "Découvrez nos formations complètes en développement web moderne : JavaScript, TypeScript, React, Next.js, Node.js, Cloud et IA. Apprenez avec un expert reconnu.",
      en: "Discover our complete courses in modern web development: JavaScript, TypeScript, React, Next.js, Node.js, Cloud and AI. Learn with a recognized expert.",
      es: "Descubre nuestros cursos completos en desarrollo web moderno: JavaScript, TypeScript, React, Next.js, Node.js, Cloud e IA. Aprende con un experto reconocido.",
    },
    keywords: [
      {
        fr: "formations développement web",
        en: "web development courses",
        es: "cursos desarrollo web",
      },
      {
        fr: "cours JavaScript",
        en: "JavaScript courses",
        es: "cursos JavaScript",
      },
      {
        fr: "cours TypeScript",
        en: "TypeScript courses",
        es: "cursos TypeScript",
      },
      {
        fr: "cours React",
        en: "React courses",
        es: "cursos React",
      },
      {
        fr: "cours Next.js",
        en: "Next.js courses",
        es: "cursos Next.js",
      },
      {
        fr: "cours Node.js",
        en: "Node.js courses",
        es: "cursos Node.js",
      },
      {
        fr: "cours Cloud",
        en: "Cloud courses",
        es: "cursos Cloud",
      },
      {
        fr: "cours IA",
        en: "AI courses",
        es: "cursos IA",
      },
      {
        fr: "apprentissage programmation",
        en: "programming learning",
        es: "aprendizaje programación",
      },
    ],
    path: "/formations",
    image: "/api/og/formations",
  });
}

export default function FormationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
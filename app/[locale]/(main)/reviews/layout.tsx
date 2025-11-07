import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for reviews page with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Avis des étudiants | Académie FYGS",
      en: "Student Reviews | FYGS Academy",
      es: "Opiniones de estudiantes | Academia FYGS",
    },
    description: {
      fr: "Découvrez les avis authentiques de nos étudiants sur nos formations en développement web, programmation et technologies.",
      en: "Discover authentic reviews from our students about our courses in web development, programming, and technology.",
      es: "Descubre opiniones auténticas de nuestros estudiantes sobre nuestros cursos de desarrollo web, programación y tecnología.",
    },
    keywords: [
      {
        fr: "avis étudiants",
        en: "student reviews",
        es: "opiniones estudiantes",
      },
      {
        fr: "témoignages formation",
        en: "course testimonials",
        es: "testimonios curso",
      },
      {
        fr: "développement web",
        en: "web development",
        es: "desarrollo web",
      },
      {
        fr: "cours programmation",
        en: "programming courses",
        es: "cursos programación",
      },
      {
        fr: "avis authentiques",
        en: "authentic reviews",
        es: "opiniones auténticas",
      },
      {
        fr: "formation informatique",
        en: "computer training",
        es: "formación informática",
      },
      {
        fr: "expérience utilisateur",
        en: "user experience",
        es: "experiencia usuario",
      },
    ],
    path: "/reviews",
    image: "/api/og/reviews",
    type: "website",
  });
}

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for dashboard with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Tableau de bord | Plateforme d'apprentissage FYGS",
      en: "Dashboard | FYGS Learning Platform",
      es: "Panel de control | Plataforma de Aprendizaje FYGS",
    },
    description: {
      fr: "Suivez votre progression et gérez vos formations sur la plateforme d'apprentissage FYGS.",
      en: "Track your progress and manage your courses on the FYGS Learning Platform.",
      es: "Sigue tu progreso y gestiona tus cursos en la Plataforma de Aprendizaje FYGS.",
    },
    keywords: [
      {
        fr: "tableau de bord apprentissage",
        en: "learning dashboard",
        es: "panel de aprendizaje",
      },
      {
        fr: "suivi progression",
        en: "progress tracking",
        es: "seguimiento progreso",
      },
      {
        fr: "gestion formations",
        en: "course management",
        es: "gestión cursos",
      },
      {
        fr: "plateforme e-learning",
        en: "e-learning platform",
        es: "plataforma e-learning",
      },
      {
        fr: "cours en ligne",
        en: "online courses",
        es: "cursos online",
      },
      {
        fr: "apprentissage en ligne",
        en: "online learning",
        es: "aprendizaje online",
      },
    ],
    path: "/dashboard",
    image: "/api/og/dashboard",
  });
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
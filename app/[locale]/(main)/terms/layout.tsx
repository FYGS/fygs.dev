import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for terms of service page with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Conditions d'utilisation | Plateforme d'apprentissage FYGS",
      en: "Terms of Service | FYGS Learning Platform",
      es: "Términos de servicio | Plataforma de Aprendizaje FYGS",
    },
    description: {
      fr: "Conditions d'utilisation pour la plateforme d'apprentissage FYGS. Découvrez les règles et conditions d'utilisation de nos services.",
      en: "Terms of service for the FYGS Learning Platform. Learn about the rules and conditions for using our services.",
      es: "Términos de servicio para la Plataforma de Aprendizaje FYGS. Descubre las reglas y condiciones para usar nuestros servicios.",
    },
    keywords: [
      {
        fr: "conditions d'utilisation",
        en: "terms of service",
        es: "términos de servicio",
      },
      {
        fr: "règles plateforme",
        en: "platform rules",
        es: "reglas plataforma",
      },
      {
        fr: "utilisation service",
        en: "service usage",
        es: "uso servicio",
      },
      {
        fr: "conditions légales",
        en: "legal terms",
        es: "términos legales",
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
        fr: "contrat utilisateur",
        en: "user agreement",
        es: "acuerdo usuario",
      },
    ],
    path: "/terms",
    image: "/api/og/terms",
  });
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for pricing page with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Tarifs | Plateforme d'apprentissage FYGS",
      en: "Pricing | FYGS Learning Platform",
      es: "Precios | Plataforma de Aprendizaje FYGS",
    },
    description: {
      fr: "Choisissez le plan qui vous convient pour accéder à nos formations premium sur la plateforme d'apprentissage FYGS.",
      en: "Choose the plan that suits you to access our premium courses on the FYGS Learning Platform.",
      es: "Elige el plan que más te convenga para acceder a nuestros cursos premium en la Plataforma de Aprendizaje FYGS.",
    },
    keywords: [
      {
        fr: "tarifs formations",
        en: "course pricing",
        es: "precios cursos",
      },
      {
        fr: "abonnement e-learning",
        en: "e-learning subscription",
        es: "suscripción e-learning",
      },
      {
        fr: "formations premium",
        en: "premium courses",
        es: "cursos premium",
      },
      {
        fr: "plateforme d'apprentissage",
        en: "learning platform",
        es: "plataforma de aprendizaje",
      },
      {
        fr: "cours en ligne",
        en: "online courses",
        es: "cursos online",
      },
      {
        fr: "abonnement mensuel",
        en: "monthly subscription",
        es: "suscripción mensual",
      },
      {
        fr: "accès illimité",
        en: "unlimited access",
        es: "acceso ilimitado",
      },
    ],
    path: "/pricing",
    image: "/api/og/pricing",
  });
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for privacy policy page with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Politique de confidentialité | Plateforme d'apprentissage FYGS",
      en: "Privacy Policy | FYGS Learning Platform",
      es: "Política de privacidad | Plataforma de Aprendizaje FYGS",
    },
    description: {
      fr: "Politique de confidentialité pour la plateforme d'apprentissage FYGS. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.",
      en: "Privacy policy for the FYGS Learning Platform. Learn how we collect, use, and protect your personal data.",
      es: "Política de privacidad para la Plataforma de Aprendizaje FYGS. Descubre cómo recopilamos, usamos y protegemos sus datos personales.",
    },
    keywords: [
      {
        fr: "politique confidentialité",
        en: "privacy policy",
        es: "política privacidad",
      },
      {
        fr: "protection données",
        en: "data protection",
        es: "protección datos",
      },
      {
        fr: "RGPD",
        en: "GDPR",
        es: "RGPD",
      },
      {
        fr: "données personnelles",
        en: "personal data",
        es: "datos personales",
      },
      {
        fr: "sécurité information",
        en: "information security",
        es: "seguridad información",
      },
      {
        fr: "cookies",
        en: "cookies",
        es: "cookies",
      },
      {
        fr: "droits utilisateurs",
        en: "user rights",
        es: "derechos usuarios",
      },
    ],
    path: "/privacy",
    image: "/api/og/privacy",
  });
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
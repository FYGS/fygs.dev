import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for contact page with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Contact - Fernand SOUALO | Travaillons ensemble",
      en: "Contact - Fernand SOUALO | Let's Work Together",
      es: "Contacto - Fernand SOUALO | Trabajemos juntos",
    },
    description: {
      fr: "Contactez Fernand SOUALO pour votre prochain projet. Disponible pour du travail freelance et du conseil technique.",
      en: "Get in touch with Fernand SOUALO for your next project. Available for freelance work and technical consulting.",
      es: "Póngase en contacto con Fernand SOUALO para su próximo proyecto. Disponible para trabajo freelance y consultoría técnica.",
    },
    keywords: [
      {
        fr: "contact développeur",
        en: "contact developer",
        es: "contactar desarrollador",
      },
      {
        fr: "freelance développement",
        en: "freelance development",
        es: "desarrollo freelance",
      },
      {
        fr: "consultant technique",
        en: "technical consultant",
        es: "consultor técnico",
      },
      {
        fr: "travail à distance",
        en: "remote work",
        es: "trabajo remoto",
      },
      {
        fr: "développement web",
        en: "web development",
        es: "desarrollo web",
      },
      {
        fr: "ingénierie logicielle",
        en: "software engineering",
        es: "ingeniería de software",
      },
    ],
    path: "/contact",
    image: "/api/og/contact",
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
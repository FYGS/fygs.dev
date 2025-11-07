import { generateRouteMetadata } from "../_lib/metadata-helpers";
import type { Metadata } from "next";
import { LocalesValues } from "intlayer";

/**
 * Generate SEO-optimized metadata for me/resume page with i18n
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: LocalesValues }>;
}): Promise<Metadata> {
  return generateRouteMetadata(params, {
    title: {
      fr: "Fernand SOUALO - CV Professionnel | Ingénieur Logiciel Senior",
      en: "Fernand SOUALO - Professional Resume | Senior Software Engineer",
      es: "Fernand SOUALO - CV Profesional | Ingeniero de Software Senior",
    },
    description: {
      fr: "Consultez mon expérience professionnelle, mes compétences et mes réalisations. Téléchargez mon CV pour en savoir plus sur mon expertise en NodeJS, TypeScript, React et AWS.",
      en: "View my professional experience, skills, and achievements. Download my resume to learn more about my expertise in NodeJS, TypeScript, React, and AWS.",
      es: "Consulta mi experiencia profesional, habilidades y logros. Descarga mi CV para conocer más sobre mi experiencia en NodeJS, TypeScript, React y AWS.",
    },
    keywords: [
      {
        fr: "CV ingénieur logiciel",
        en: "software engineer resume",
        es: "currículum ingeniero de software",
      },
      {
        fr: "développeur TypeScript",
        en: "TypeScript developer",
        es: "desarrollador TypeScript",
      },
      {
        fr: "développeur React",
        en: "React developer",
        es: "desarrollador React",
      },
      {
        fr: "développeur Node.js",
        en: "Node.js developer",
        es: "desarrollador Node.js",
      },
      {
        fr: "ingénieur logiciel senior",
        en: "senior software engineer",
        es: "ingeniero de software senior",
      },
      {
        fr: "expérience professionnelle",
        en: "professional experience",
        es: "experiencia profesional",
      },
      {
        fr: "compétences techniques",
        en: "technical skills",
        es: "habilidades técnicas",
      },
    ],
    path: "/me",
    image: "/api/og/me",
    type: "profile",
  });
}

export default function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
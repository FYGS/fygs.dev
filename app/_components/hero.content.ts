import { t, type Dictionary } from "intlayer";

// Spec: docs/specs/homepage-redesign.md (es falls back to the English copy)
const heroContent = {
  key: "hero",
  content: {
    eyebrow: t({
      en: "Freelance · Custom SaaS & business web apps · AI-augmented developer",
      fr: "Freelance · SaaS sur mesure & applications web métier · Développeur augmenté par l'IA",
      es: "Freelance · Custom SaaS & business web apps · AI-augmented developer",
    }),
    title: t({
      en: "I design custom SaaS and business web applications, built on solid backends.",
      fr: "Je conçois des SaaS et des applications web métier sur mesure, sur des backends solides.",
      es: "I design custom SaaS and business web applications, built on solid backends.",
    }),
    subtitle: t({
      en: "Backend and cloud engineer (AWS, microservices, REST APIs), comfortable full-stack. I build with AI agents inside a strict flow: a frozen spec, failing tests first, systematic review. Not vibe coding.",
      fr: "Ingénieur backend et cloud (AWS, microservices, API REST), à l'aise en fullstack. Je construis avec des agents IA dans un flow strict : spec figée, tests qui échouent d'abord, revue systématique. Pas du vibe coding.",
      es: "Backend and cloud engineer (AWS, microservices, REST APIs), comfortable full-stack. I build with AI agents inside a strict flow: a frozen spec, failing tests first, systematic review. Not vibe coding.",
    }),
    primaryCta: t({
      en: "Talk about your project",
      fr: "Parler de votre projet",
      es: "Talk about your project",
    }),
    secondaryCta: t({
      en: "See my work",
      fr: "Voir mes projets",
      es: "See my work",
    }),
    techStack: ["AWS", "Node.js", "TypeScript", "NestJS", "PostgreSQL", "Next.js"],
    location: t({
      en: "Remote · France & Europe",
      fr: "Remote · France & Europe",
      es: "Remote · France & Europe",
    }),
  },
} satisfies Dictionary;

export default heroContent;

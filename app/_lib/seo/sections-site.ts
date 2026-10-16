import { COMMON_KEYWORDS, type SectionSEOConfig } from "./common";

/** Contact and pricing sections. */
export const siteSections = {
  /** Contact — /contact */
  contact: {
    title: {
      fr: "Contact | Collaborons sur votre projet",
      en: "Contact | Let's Work Together",
      es: "Contacto | Colaboremos en tu proyecto",
    },
    description: {
      fr: "Contactez Fernand SOUALO pour vos projets de développement web, consulting technique ou collaboration. Disponible pour freelance et missions techniques.",
      en: "Get in touch with Fernand SOUALO for web development projects, technical consulting or collaboration. Available for freelance and technical missions.",
      es: "Póngase en contacto con Fernand SOUALO para proyectos de desarrollo web, consultoría técnica o colaboración.",
    },
    keywords: [
      {
        fr: "contact développeur",
        en: "contact developer",
        es: "contacto desarrollador",
      },
      {
        fr: "freelance développeur web",
        en: "freelance web developer",
        es: "freelance desarrollador web",
      },
      {
        fr: "consulting technique",
        en: "technical consulting",
        es: "consultoría técnica",
      },
      {
        fr: "collaboration projet",
        en: "project collaboration",
        es: "colaboración proyecto",
      },
      ...COMMON_KEYWORDS,
    ],
    path: "/contact",
    image: "/api/og/contact",
  },

  /** Pricing — /pricing */
  pricing: {
    title: {
      fr: "Tarifs | Plans de Formation FYGS",
      en: "Pricing | FYGS Learning Plans",
      es: "Precios | Planes de Formación FYGS",
    },
    description: {
      fr: "Choisissez le plan adapté à vos besoins : accès gratuit, premium ou entreprise. Formations complètes avec certificats et support personnalisé.",
      en: "Choose the plan that fits your needs: free access, premium or enterprise. Complete courses with certificates and personalized support.",
      es: "Elige el plan adaptado a tus necesidades: acceso gratuito, premium o empresa. Cursos completos con certificados y soporte personalizado.",
    },
    keywords: [
      {
        fr: "tarifs formation",
        en: "training pricing",
        es: "precios formación",
      },
      {
        fr: "abonnement premium",
        en: "premium subscription",
        es: "suscripción premium",
      },
      {
        fr: "plan entreprise",
        en: "enterprise plan",
        es: "plan empresa",
      },
      ...COMMON_KEYWORDS,
    ],
    path: "/pricing",
    image: "/api/og/pricing",
  },
} as const satisfies Record<string, SectionSEOConfig>;

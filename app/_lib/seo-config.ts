/**
 * Centralized SEO Configuration
 * Single source of truth for all section metadata, OG images, and JSON-LD schemas
 *
 * Usage: Import section configs in layout.tsx files and pass to generateRouteMetadata()
 */

import type { I18nMetadataProps } from "./i18n-metadata";
import { SITE_URL } from "./constants";

type IConfigLocales<T> = Required<Record<"fr", T>> & Partial<Record<string, T>>;

/** Section metadata config (without locale — resolved at runtime) */
export type SectionSEOConfig = Omit<I18nMetadataProps, "locale">;

// ─── Common Keywords (appended to every section) ────────────────────────────
export const COMMON_KEYWORDS: (IConfigLocales<string> | string)[] = [
  "FYGS",
  "Fernand SOUALO",
  {
    fr: "développement web",
    en: "web development",
    es: "desarrollo web",
  },
  "TypeScript",
  "React",
  "Next.js",
];

// ─── Section Configs ────────────────────────────────────────────────────────

export const sectionSEO = {
  /** Home page — / */
  home: {
    title: {
      fr: "FYGS Learning Platform | Formations Premium pour Développeurs",
      en: "FYGS Learning Platform | Premium Courses for Developers",
      es: "FYGS Learning Platform | Cursos Premium para Desarrolladores",
    },
    description: {
      fr: "Transformez votre carrière avec nos formations premium en JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud. Rejoignez 15 000+ développeurs qui ont boosté leur carrière.",
      en: "Transform your career with our premium courses in JavaScript, TypeScript, React, Next.js, Node.js, AI and Cloud. Join 15,000+ developers who boosted their careers.",
      es: "Transforme su carrera con nuestros cursos premium en JavaScript, TypeScript, React, Next.js, Node.js, IA y Cloud. Únete a más de 15 000 desarrolladores.",
    },
    keywords: [
      {
        fr: "formation développeur",
        en: "developer training",
        es: "formación desarrollador",
      },
      {
        fr: "cours JavaScript",
        en: "JavaScript courses",
        es: "cursos JavaScript",
      },
      {
        fr: "formation premium",
        en: "premium courses",
        es: "cursos premium",
      },
      {
        fr: "apprentissage en ligne",
        en: "e-learning",
        es: "aprendizaje en línea",
      },
      "Node.js",
      "Full-Stack",
      "Cloud",
      "IA",
      ...COMMON_KEYWORDS,
    ],
    path: "/",
    image: "/images/og-image.png",
  },

  /** About / CV — /me */
  me: {
    title: {
      fr: "Fernand SOUALO - CV Professionnel | Expert Full-Stack & Cloud",
      en: "Fernand SOUALO - Professional Resume | Full-Stack & Cloud Expert",
      es: "Fernand SOUALO - CV Profesional | Experto Full-Stack & Cloud",
    },
    description: {
      fr: "Consultez mon expérience professionnelle, mes compétences techniques et mes réalisations. Expert Full-Stack JavaScript/TypeScript, architecte Cloud et formateur.",
      en: "View my professional experience, technical skills and achievements. Full-Stack JavaScript/TypeScript expert, Cloud architect and instructor.",
      es: "Consulta mi experiencia profesional, habilidades técnicas y logros. Experto Full-Stack JavaScript/TypeScript, arquitecto Cloud y formador.",
    },
    keywords: [
      {
        fr: "CV développeur",
        en: "developer resume",
        es: "CV desarrollador",
      },
      {
        fr: "ingénieur logiciel",
        en: "software engineer",
        es: "ingeniero de software",
      },
      {
        fr: "expert Full-Stack",
        en: "Full-Stack expert",
        es: "experto Full-Stack",
      },
      {
        fr: "architecte Cloud",
        en: "Cloud architect",
        es: "arquitecto Cloud",
      },
      {
        fr: "consultant technique",
        en: "technical consultant",
        es: "consultor técnico",
      },
      ...COMMON_KEYWORDS,
    ],
    path: "/me",
    image: "/api/og/me",
    type: "profile" as const,
  },

  /** Formations catalog — /formations */
  formations: {
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
      ...COMMON_KEYWORDS,
    ],
    path: "/formations",
    image: "/api/og/formations",
  },

  /** Projects portfolio — /projects */
  projects: {
    title: {
      fr: "Portfolio Projets | Applications Web & Solutions Techniques",
      en: "Projects Portfolio | Web Applications & Technical Solutions",
      es: "Portfolio de Proyectos | Aplicaciones Web & Soluciones Técnicas",
    },
    description: {
      fr: "Découvrez mon portfolio de projets : applications web modernes, solutions SaaS, APIs et architectures Cloud. Technologies : React, Next.js, Node.js, PostgreSQL.",
      en: "Discover my project portfolio: modern web applications, SaaS solutions, APIs and Cloud architectures. Technologies: React, Next.js, Node.js, PostgreSQL.",
      es: "Descubre mi portfolio de proyectos: aplicaciones web modernas, soluciones SaaS, APIs y arquitecturas Cloud. Tecnologías: React, Next.js, Node.js, PostgreSQL.",
    },
    keywords: [
      {
        fr: "portfolio développeur",
        en: "developer portfolio",
        es: "portfolio desarrollador",
      },
      {
        fr: "projets web",
        en: "web projects",
        es: "proyectos web",
      },
      {
        fr: "applications modernes",
        en: "modern applications",
        es: "aplicaciones modernas",
      },
      "SaaS",
      "PostgreSQL",
      "API REST",
      ...COMMON_KEYWORDS,
    ],
    path: "/projects",
    image: "/api/og/projects",
  },

  /** Technical blog — /blog */
  blog: {
    title: {
      fr: "Blog Technique | Articles & Bonnes Pratiques en Développement",
      en: "Technical Blog | Software Engineering Insights & Best Practices",
      es: "Blog Técnico | Artículos y Mejores Prácticas en Desarrollo",
    },
    description: {
      fr: "Explorez des articles approfondis sur l'ingénierie logicielle, le développement web, l'architecture cloud et les meilleures pratiques. React, TypeScript, Node.js et techniques modernes.",
      en: "Explore in-depth articles on software engineering, web development, cloud architecture, and best practices. React, TypeScript, Node.js, and modern techniques.",
      es: "Explora artículos en profundidad sobre ingeniería de software, desarrollo web, arquitectura en la nube y mejores prácticas.",
    },
    keywords: [
      {
        fr: "blog développement",
        en: "development blog",
        es: "blog desarrollo",
      },
      {
        fr: "ingénierie logicielle",
        en: "software engineering",
        es: "ingeniería de software",
      },
      {
        fr: "tutoriels techniques",
        en: "technical tutorials",
        es: "tutoriales técnicos",
      },
      {
        fr: "bonnes pratiques programmation",
        en: "programming best practices",
        es: "mejores prácticas programación",
      },
      {
        fr: "développement full-stack",
        en: "full-stack development",
        es: "desarrollo full-stack",
      },
      ...COMMON_KEYWORDS,
    ],
    path: "/blog",
    image: "/api/og/blog",
  },

  /** Tech Mastery — /tech-mastry */
  techMastry: {
    title: {
      fr: "TechMastery | Préparation Entretiens & Maîtrise Technique",
      en: "TechMastery | Interview Prep & Technical Mastery Platform",
      es: "TechMastery | Preparación Entrevistas & Dominio Técnico",
    },
    description: {
      fr: "Plateforme complète pour maîtriser les compétences techniques avancées : algorithmes, structures de données, systèmes distribués, architecture et préparation aux entretiens.",
      en: "Complete platform to master advanced technical skills: algorithms, data structures, distributed systems, architecture and interview preparation.",
      es: "Plataforma completa para dominar habilidades técnicas avanzadas: algoritmos, estructuras de datos, sistemas distribuidos, arquitectura y preparación para entrevistas.",
    },
    keywords: [
      {
        fr: "préparation entretien technique",
        en: "technical interview preparation",
        es: "preparación entrevista técnica",
      },
      {
        fr: "algorithmes",
        en: "algorithms",
        es: "algoritmos",
      },
      {
        fr: "structures de données",
        en: "data structures",
        es: "estructuras de datos",
      },
      {
        fr: "system design",
        en: "system design",
        es: "diseño de sistemas",
      },
      {
        fr: "architecture logicielle",
        en: "software architecture",
        es: "arquitectura de software",
      },
      "LeetCode",
      "FAANG",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry",
    image: `${SITE_URL}/tech-mastry/og.png`,
  },

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

// ─── JSON-LD Schema Generators ──────────────────────────────────────────────

/** Organization schema (shared across sections) */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "FYGS",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    sameAs: [
      "https://github.com/fernand-music",
      "https://www.linkedin.com/in/fernand-music",
    ],
    description:
      "Plateforme de formations premium en développement web moderne",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Fernand SOUALO",
      url: `${SITE_URL}/me`,
      jobTitle: "Software Engineer & Instructor",
    },
  };
}

/** WebSite schema with search action */
export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FYGS Learning Platform",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/formations?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Course catalog schema */
export function getCourseListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Formations FYGS",
    description:
      "Catalogue de formations en développement web et technologies modernes",
    url: `${SITE_URL}/formations`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: 10,
    provider: {
      "@type": "EducationalOrganization",
      name: "FYGS",
      url: SITE_URL,
    },
  };
}

/** Person schema for /me */
export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Fernand SOUALO",
    url: `${SITE_URL}/me`,
    image: `${SITE_URL}/linkedin_profile_photo.jpeg`,
    jobTitle: "Full-Stack Software Engineer",
    worksFor: {
      "@type": "EducationalOrganization",
      name: "FYGS",
    },
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Cloud Architecture",
      "PostgreSQL",
      "Docker",
    ],
    sameAs: [
      "https://github.com/fernand-music",
      "https://www.linkedin.com/in/fernand-music",
    ],
  };
}

/** Blog schema */
export function getBlogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "FYGS Technical Blog",
    url: `${SITE_URL}/blog`,
    description:
      "Articles techniques approfondis sur le développement web moderne",
    publisher: {
      "@type": "EducationalOrganization",
      name: "FYGS",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.svg`,
      },
    },
    author: {
      "@type": "Person",
      name: "Fernand SOUALO",
    },
  };
}

/** Contact page schema */
export function getContactJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacter FYGS",
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "Person",
      name: "Fernand SOUALO",
      email: "fygs.dev@gmail.com",
      url: `${SITE_URL}/me`,
    },
  };
}

/** Breadcrumb schema helper */
export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

import { COMMON_KEYWORDS, type SectionSEOConfig } from "./common";

/** Home, about, formations, projects and blog sections. */
export const mainSections = {
  /** Home page — / */
  home: {
    title: {
      fr: "Fernand Soualo | Ingénieur backend & cloud, développeur augmenté par l'IA",
      en: "Fernand Soualo | Backend & cloud engineer, AI-augmented developer",
      es: "Fernand Soualo | Backend & cloud engineer, AI-augmented developer",
    },
    description: {
      fr: "Freelance : conception de SaaS et d'applications web métier sur mesure (AWS, microservices, API REST). Je livre avec des agents IA et une méthode : spec figée, tests d'abord, revue systématique.",
      en: "Freelance: design of custom SaaS and business web applications (AWS, microservices, REST APIs). I deliver with AI agents and a method: frozen spec, tests first, systematic review.",
      es: "Freelance: design of custom SaaS and business web applications (AWS, microservices, REST APIs). I deliver with AI agents and a method: frozen spec, tests first, systematic review.",
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
} as const satisfies Record<string, SectionSEOConfig>;

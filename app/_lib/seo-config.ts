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
    image: `/api/og/tech-mastry?section=default&title=${encodeURIComponent("TechMastery")}&desc=${encodeURIComponent("Préparation Entretiens & Maîtrise Technique")}`,
  },

  // ─── Tech-Mastry Sub-Section Configs ────────────────────────────────────────

  /** AI Mastery — /tech-mastry/ai-mastery */
  techMastryAiMastery: {
    title: {
      fr: "Maîtrise de l'IA | Prompt Engineering, Agents & Outils IA",
      en: "AI Mastery | Prompt Engineering, Agents & AI Tools",
      es: "Dominio de la IA | Prompt Engineering, Agentes & Herramientas IA",
    },
    description: {
      fr: "Maîtrisez l'intelligence artificielle appliquée au développement : prompt engineering, agents autonomes, GitHub Copilot, Claude AI, et outils de productivité IA.",
      en: "Master AI applied to development: prompt engineering, autonomous agents, GitHub Copilot, Claude AI, and AI productivity tools.",
      es: "Domine la inteligencia artificial aplicada al desarrollo: prompt engineering, agentes autónomos, GitHub Copilot, Claude AI y herramientas de productividad IA.",
    },
    keywords: [
      {
        fr: "intelligence artificielle",
        en: "artificial intelligence",
        es: "inteligencia artificial",
      },
      {
        fr: "prompt engineering",
        en: "prompt engineering",
        es: "ingeniería de prompts",
      },
      {
        fr: "agents IA autonomes",
        en: "autonomous AI agents",
        es: "agentes IA autónomos",
      },
      "GitHub Copilot",
      "Claude AI",
      "ChatGPT",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/ai-mastery",
    image: `/api/og/tech-mastry?section=ai-mastery&title=${encodeURIComponent("Maîtrise de l'IA")}&desc=${encodeURIComponent("Prompt Engineering, Agents & Outils IA")}`,
  },

  /** Algorithms — /tech-mastry/algorithms */
  techMastryAlgorithms: {
    title: {
      fr: "Algorithmes | Tri, Recherche, Graphes & Programmation Dynamique",
      en: "Algorithms | Sorting, Searching, Graphs & Dynamic Programming",
      es: "Algoritmos | Ordenamiento, Búsqueda, Grafos & Programación Dinámica",
    },
    description: {
      fr: "Maîtrisez les algorithmes fondamentaux : tri, recherche, graphes, programmation dynamique, complexité algorithmique. Exercices interactifs et visualisations.",
      en: "Master fundamental algorithms: sorting, searching, graphs, dynamic programming, algorithmic complexity. Interactive exercises and visualizations.",
      es: "Domine los algoritmos fundamentales: ordenamiento, búsqueda, grafos, programación dinámica, complejidad algorítmica. Ejercicios interactivos.",
    },
    keywords: [
      {
        fr: "algorithmes tri",
        en: "sorting algorithms",
        es: "algoritmos de ordenamiento",
      },
      {
        fr: "programmation dynamique",
        en: "dynamic programming",
        es: "programación dinámica",
      },
      {
        fr: "complexité algorithmique",
        en: "algorithmic complexity",
        es: "complejidad algorítmica",
      },
      "Big O",
      "LeetCode",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/algorithms",
    image: `/api/og/tech-mastry?section=algorithms&title=${encodeURIComponent("Algorithmes")}&desc=${encodeURIComponent("Tri, Recherche, Graphes & Programmation Dynamique")}`,
  },

  /** Data Structures — /tech-mastry/data-structures */
  techMastryDataStructures: {
    title: {
      fr: "Structures de Données | Tableaux, Arbres, Graphes & Tables de Hachage",
      en: "Data Structures | Arrays, Trees, Graphs & Hash Tables",
      es: "Estructuras de Datos | Arrays, Árboles, Grafos & Tablas Hash",
    },
    description: {
      fr: "Explorez les structures de données essentielles avec des visualisations interactives : tableaux, listes chaînées, arbres, graphes, piles, files et tables de hachage.",
      en: "Explore essential data structures with interactive visualizations: arrays, linked lists, trees, graphs, stacks, queues and hash tables.",
      es: "Explore estructuras de datos esenciales con visualizaciones interactivas: arrays, listas enlazadas, árboles, grafos, pilas, colas y tablas hash.",
    },
    keywords: [
      {
        fr: "structures de données",
        en: "data structures",
        es: "estructuras de datos",
      },
      { fr: "arbres binaires", en: "binary trees", es: "árboles binarios" },
      { fr: "graphes", en: "graphs", es: "grafos" },
      { fr: "tables de hachage", en: "hash tables", es: "tablas hash" },
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/data-structures",
    image: `/api/og/tech-mastry?section=data-structures&title=${encodeURIComponent("Structures de Données")}&desc=${encodeURIComponent("Tableaux, Arbres, Graphes & Tables de Hachage")}`,
  },

  /** Data Science — /tech-mastry/data-science */
  techMastryDataScience: {
    title: {
      fr: "Data Science | Machine Learning, Deep Learning & Data Engineering",
      en: "Data Science | Machine Learning, Deep Learning & Data Engineering",
      es: "Ciencia de Datos | Machine Learning, Deep Learning & Ingeniería de Datos",
    },
    description: {
      fr: "Plongez dans la data science : statistiques, machine learning, deep learning, MLOps et data engineering. Projets pratiques avec Python, TensorFlow et PyTorch.",
      en: "Dive into data science: statistics, machine learning, deep learning, MLOps and data engineering. Hands-on projects with Python, TensorFlow and PyTorch.",
      es: "Sumérjase en la ciencia de datos: estadísticas, machine learning, deep learning, MLOps e ingeniería de datos. Proyectos prácticos con Python.",
    },
    keywords: [
      {
        fr: "machine learning",
        en: "machine learning",
        es: "aprendizaje automático",
      },
      { fr: "deep learning", en: "deep learning", es: "aprendizaje profundo" },
      {
        fr: "data engineering",
        en: "data engineering",
        es: "ingeniería de datos",
      },
      "Python",
      "TensorFlow",
      "PyTorch",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/data-science",
    image: `/api/og/tech-mastry?section=data-science&title=${encodeURIComponent("Data Science")}&desc=${encodeURIComponent("Machine Learning, Deep Learning & Data Engineering")}`,
  },

  /** System Design — /tech-mastry/system-design */
  techMastrySystemDesign: {
    title: {
      fr: "System Design | Architecture Distribuée & Conception de Systèmes",
      en: "System Design | Distributed Architecture & Systems Design",
      es: "Diseño de Sistemas | Arquitectura Distribuida & Diseño de Sistemas",
    },
    description: {
      fr: "Maîtrisez le system design : architecture distribuée, scalabilité, bases de données, monitoring, études de cas réels (Netflix, Uber, Twitter).",
      en: "Master system design: distributed architecture, scalability, databases, monitoring, real case studies (Netflix, Uber, Twitter).",
      es: "Domine el diseño de sistemas: arquitectura distribuida, escalabilidad, bases de datos, monitoreo, estudios de caso reales.",
    },
    keywords: [
      { fr: "system design", en: "system design", es: "diseño de sistemas" },
      {
        fr: "architecture distribuée",
        en: "distributed architecture",
        es: "arquitectura distribuida",
      },
      { fr: "scalabilité", en: "scalability", es: "escalabilidad" },
      "microservices",
      "FAANG",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/system-design",
    image: `/api/og/tech-mastry?section=system-design&title=${encodeURIComponent("System Design")}&desc=${encodeURIComponent("Architecture Distribuée & Conception de Systèmes")}`,
  },

  /** Frontend — /tech-mastry/frontend */
  techMastryFrontend: {
    title: {
      fr: "Frontend | React Avancé, CSS Moderne & Performance Web",
      en: "Frontend | Advanced React, Modern CSS & Web Performance",
      es: "Frontend | React Avanzado, CSS Moderno & Rendimiento Web",
    },
    description: {
      fr: "Maîtrisez le développement frontend : React patterns avancés, Next.js, CSS moderne, accessibilité, tests et optimisation des performances web.",
      en: "Master frontend development: advanced React patterns, Next.js, modern CSS, accessibility, testing and web performance optimization.",
      es: "Domine el desarrollo frontend: patrones React avanzados, Next.js, CSS moderno, accesibilidad, pruebas y optimización del rendimiento web.",
    },
    keywords: [
      { fr: "React avancé", en: "advanced React", es: "React avanzado" },
      { fr: "performance web", en: "web performance", es: "rendimiento web" },
      {
        fr: "accessibilité web",
        en: "web accessibility",
        es: "accesibilidad web",
      },
      "Next.js",
      "Tailwind CSS",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/frontend",
    image: `/api/og/tech-mastry?section=frontend&title=${encodeURIComponent("Frontend")}&desc=${encodeURIComponent("React Avancé, CSS Moderne & Performance Web")}`,
  },

  /** Backend — /tech-mastry/backend */
  techMastryBackend: {
    title: {
      fr: "Backend | Node.js, APIs, Bases de Données & Architecture Serveur",
      en: "Backend | Node.js, APIs, Databases & Server Architecture",
      es: "Backend | Node.js, APIs, Bases de Datos & Arquitectura de Servidor",
    },
    description: {
      fr: "Maîtrisez le développement backend : Node.js, APIs RESTful et GraphQL, bases de données SQL/NoSQL, authentification, performance et tests.",
      en: "Master backend development: Node.js, RESTful and GraphQL APIs, SQL/NoSQL databases, authentication, performance and testing.",
      es: "Domine el desarrollo backend: Node.js, APIs RESTful y GraphQL, bases de datos SQL/NoSQL, autenticación, rendimiento y pruebas.",
    },
    keywords: [
      { fr: "Node.js backend", en: "Node.js backend", es: "backend Node.js" },
      { fr: "API RESTful", en: "RESTful API", es: "API RESTful" },
      { fr: "bases de données", en: "databases", es: "bases de datos" },
      "GraphQL",
      "PostgreSQL",
      "MongoDB",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/backend",
    image: `/api/og/tech-mastry?section=backend&title=${encodeURIComponent("Backend")}&desc=${encodeURIComponent("Node.js, APIs, Bases de Données & Architecture")}`,
  },

  /** Best Practices — /tech-mastry/best-practices */
  techMastryBestPractices: {
    title: {
      fr: "Best Practices | Design Patterns, Clean Code & Architecture",
      en: "Best Practices | Design Patterns, Clean Code & Architecture",
      es: "Mejores Prácticas | Design Patterns, Clean Code & Arquitectura",
    },
    description: {
      fr: "Adoptez les meilleures pratiques de développement : design patterns, clean code, principes SOLID, refactoring et architecture logicielle.",
      en: "Adopt development best practices: design patterns, clean code, SOLID principles, refactoring and software architecture.",
      es: "Adopte las mejores prácticas de desarrollo: design patterns, clean code, principios SOLID, refactoring y arquitectura de software.",
    },
    keywords: [
      {
        fr: "design patterns",
        en: "design patterns",
        es: "patrones de diseño",
      },
      { fr: "clean code", en: "clean code", es: "código limpio" },
      { fr: "principes SOLID", en: "SOLID principles", es: "principios SOLID" },
      "refactoring",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/best-practices",
    image: `/api/og/tech-mastry?section=best-practices&title=${encodeURIComponent("Best Practices")}&desc=${encodeURIComponent("Design Patterns, Clean Code & Architecture")}`,
  },

  /** Coding Challenges — /tech-mastry/coding-challenges */
  techMastryCodingChallenges: {
    title: {
      fr: "Coding Challenges | Exercices Pratiques & Défis Algorithmiques",
      en: "Coding Challenges | Practice Exercises & Algorithmic Challenges",
      es: "Desafíos de Código | Ejercicios Prácticos & Retos Algorítmicos",
    },
    description: {
      fr: "Entraînez-vous avec des challenges de code progressifs : arrays, strings, arbres, graphes, programmation dynamique et system design.",
      en: "Practice with progressive coding challenges: arrays, strings, trees, graphs, dynamic programming and system design.",
      es: "Practique con desafíos de código progresivos: arrays, strings, árboles, grafos, programación dinámica y diseño de sistemas.",
    },
    keywords: [
      {
        fr: "challenges code",
        en: "coding challenges",
        es: "desafíos de código",
      },
      {
        fr: "exercices algorithmiques",
        en: "algorithm exercises",
        es: "ejercicios algorítmicos",
      },
      "LeetCode",
      "HackerRank",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/coding-challenges",
    image: `/api/og/tech-mastry?section=coding-challenges&title=${encodeURIComponent("Coding Challenges")}&desc=${encodeURIComponent("Exercices Pratiques & Défis Algorithmiques")}`,
  },

  /** Security & DevOps — /tech-mastry/security-devops */
  techMastrySecurityDevops: {
    title: {
      fr: "Sécurité & DevOps | OWASP, Docker, Kubernetes & CI/CD",
      en: "Security & DevOps | OWASP, Docker, Kubernetes & CI/CD",
      es: "Seguridad & DevOps | OWASP, Docker, Kubernetes & CI/CD",
    },
    description: {
      fr: "Maîtrisez la sécurité applicative (OWASP Top 10) et le DevOps : Docker, Kubernetes, pipelines CI/CD, cloud-native et monitoring.",
      en: "Master application security (OWASP Top 10) and DevOps: Docker, Kubernetes, CI/CD pipelines, cloud-native and monitoring.",
      es: "Domine la seguridad de aplicaciones (OWASP Top 10) y DevOps: Docker, Kubernetes, pipelines CI/CD, cloud-native y monitoreo.",
    },
    keywords: [
      { fr: "sécurité web", en: "web security", es: "seguridad web" },
      "OWASP",
      "Docker",
      "Kubernetes",
      "CI/CD",
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/security-devops",
    image: `/api/og/tech-mastry?section=security&title=${encodeURIComponent("Sécurité & DevOps")}&desc=${encodeURIComponent("OWASP, Docker, Kubernetes & CI/CD")}`,
  },

  /** Career — /tech-mastry/career */
  techMastryCareer: {
    title: {
      fr: "Carrière | Négociation Salariale, Progression & Entretiens",
      en: "Career | Salary Negotiation, Career Growth & Interviews",
      es: "Carrera | Negociación Salarial, Crecimiento & Entrevistas",
    },
    description: {
      fr: "Accélérez votre carrière de développeur : négociation salariale, progression de carrière, préparation aux entretiens et personal branding.",
      en: "Accelerate your developer career: salary negotiation, career progression, interview preparation and personal branding.",
      es: "Acelere su carrera de desarrollador: negociación salarial, progresión profesional, preparación para entrevistas y marca personal.",
    },
    keywords: [
      {
        fr: "carrière développeur",
        en: "developer career",
        es: "carrera desarrollador",
      },
      {
        fr: "négociation salariale",
        en: "salary negotiation",
        es: "negociación salarial",
      },
      {
        fr: "entretien technique",
        en: "technical interview",
        es: "entrevista técnica",
      },
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/career",
    image: `/api/og/tech-mastry?section=career&title=${encodeURIComponent("Carrière")}&desc=${encodeURIComponent("Négociation Salariale, Progression & Entretiens")}`,
  },

  /** Git Mastery — /tech-mastry/git-mastery */
  techMastryGitMastery: {
    title: {
      fr: "Git Mastery | Maîtrisez Git de A à Z",
      en: "Git Mastery | Master Git from A to Z",
      es: "Git Mastery | Domina Git de la A a la Z",
    },
    description: {
      fr: "Maîtrisez Git en profondeur : branching strategies, commandes avancées, internals, workflows, résolution de conflits et hooks.",
      en: "Master Git in depth: branching strategies, advanced commands, internals, workflows, conflict resolution and hooks.",
      es: "Domine Git en profundidad: estrategias de branching, comandos avanzados, internals, workflows, resolución de conflictos y hooks.",
    },
    keywords: [
      { fr: "git avancé", en: "advanced git", es: "git avanzado" },
      {
        fr: "branching strategy",
        en: "branching strategy",
        es: "estrategia de branching",
      },
      { fr: "git rebase", en: "git rebase", es: "git rebase" },
      { fr: "git internals", en: "git internals", es: "git internals" },
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/git-mastery",
    image: `/api/og/tech-mastry?section=git-mastery&title=${encodeURIComponent("Git Mastery")}&desc=${encodeURIComponent("Branching, Commandes Avancées, Internals & Hooks")}`,
  },

  /** TypeScript Mastery — /tech-mastry/typescript-mastery */
  techMastryTypeScriptMastery: {
    title: {
      fr: "TypeScript Mastery | Types Avancés, Generics & Patterns",
      en: "TypeScript Mastery | Advanced Types, Generics & Patterns",
      es: "TypeScript Mastery | Tipos Avanzados, Generics & Patterns",
    },
    description: {
      fr: "Maîtrisez TypeScript en profondeur : types avancés, generics, type challenges, design patterns typés, sécurité runtime et API du compilateur.",
      en: "Master TypeScript in depth: advanced types, generics, type challenges, typed design patterns, runtime safety and compiler API.",
      es: "Domine TypeScript en profundidad: tipos avanzados, generics, type challenges, patrones de diseño tipados, seguridad runtime y API del compilador.",
    },
    keywords: [
      {
        fr: "typescript avancé",
        en: "advanced typescript",
        es: "typescript avanzado",
      },
      { fr: "types génériques", en: "generic types", es: "tipos genéricos" },
      { fr: "type challenges", en: "type challenges", es: "type challenges" },
      {
        fr: "design patterns typescript",
        en: "typescript design patterns",
        es: "patrones diseño typescript",
      },
      ...COMMON_KEYWORDS,
    ],
    path: "/tech-mastry/typescript-mastery",
    image: `/api/og/tech-mastry?section=typescript-mastery&title=${encodeURIComponent("TypeScript Mastery")}&desc=${encodeURIComponent("Types Avancés, Generics, Patterns & Compiler API")}`,
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

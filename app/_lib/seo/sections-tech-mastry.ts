import { COMMON_KEYWORDS, type SectionSEOConfig } from "./common";

/** Tech Mastery section and its sub-sections. */
export const techMasterySections = {
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
} as const satisfies Record<string, SectionSEOConfig>;

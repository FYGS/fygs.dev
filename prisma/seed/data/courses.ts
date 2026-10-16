import { CourseCategory, CourseLevel, CourseAccessTier } from "@prisma/client";

export const comprehensiveCourses = [
  {
    title: "JavaScript Fundamentals : De zéro à héros",
    slug: "javascript-fundamentals-zero-hero",
    description:
      "Maîtrisez JavaScript de A à Z avec cette formation complète. Apprenez les concepts fondamentaux, la programmation orientée objet, les fonctions avancées, et les dernières fonctionnalités ES6+. Parfait pour débuter en programmation web ou consolider vos bases.",
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop",
    price: 0,
    category: CourseCategory.JAVASCRIPT,
    level: CourseLevel.BEGINNER,
    duration: 480,
    accessTier: CourseAccessTier.FREE,
    featured: true,
    publicEvaluation:
      "Cette formation vous permettra de maîtriser JavaScript et de créer vos premières applications web interactives.",
    publicPrerequisites:
      "Aucun prérequis. Cette formation s'adresse aux débutants complets.",
    publicResources:
      "Exercices pratiques, projets réels, documentation complète, communauté d'entraide",
    publicStructure:
      "4 modules progressifs : Bases du langage, Manipulation du DOM, Programmation asynchrone, Projets pratiques",
  },
  {
    title: "React Advanced Patterns & Performance",
    slug: "react-advanced-patterns-performance",
    description:
      "Devenez un expert React avec les patterns avancés et les techniques d'optimisation. Explorez les hooks personnalisés, la gestion d'état complexe, les patterns de composants, le code splitting, et les meilleures pratiques pour des applications performantes et maintenables.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
    price: 199.99,
    category: CourseCategory.FRONTEND,
    level: CourseLevel.ADVANCED,
    duration: 720,
    accessTier: CourseAccessTier.PREMIUM,
    featured: true,
    publicEvaluation:
      "Formation avancée pour développeurs React souhaitant maîtriser les patterns professionnels et l'optimisation.",
    publicPrerequisites:
      "Solides bases en React, JavaScript ES6+, hooks de base. 6 mois d'expérience minimum.",
    publicResources:
      "Projets complexes, code reviews, benchmarks de performance, patterns library",
    publicStructure:
      "6 modules spécialisés : Hooks avancés, State management, Performance, Patterns, Testing, Production",
  },
  {
    title: "Next.js 15 Full-Stack Development Masterclass",
    slug: "nextjs-15-fullstack-masterclass",
    description:
      "Construisez des applications web complètes avec Next.js 15, l'App Router, et les dernières innovations. Maîtrisez SSR, SSG, ISR, les Server Components, l'authentification, les bases de données, et le déploiement. De l'idée à la production.",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    price: 299.99,
    category: CourseCategory.FULLSTACK,
    level: CourseLevel.INTERMEDIATE,
    duration: 1200,
    accessTier: CourseAccessTier.PREMIUM,
    featured: true,
    publicEvaluation:
      "Formation complète pour créer des applications Next.js modernes et performantes.",
    publicPrerequisites:
      "Bonnes bases en React, JavaScript/TypeScript, notions de backend. 3 mois d'expérience React.",
    publicResources:
      "3 projets full-stack, déploiement automatisé, monitoring, documentation détaillée",
    publicStructure:
      "8 modules : App Router, Server Components, Authentication, Database, API, Deployment, Monitoring, Projects",
  },
  {
    title: "TypeScript pour développeurs JavaScript",
    slug: "typescript-javascript-developers",
    description:
      "Transformez votre code JavaScript en TypeScript robuste et maintenable. Apprenez le typage statique, les interfaces, les génériques, la configuration avancée, et l'intégration dans vos projets existants. Gagnez en productivité et réduisez les bugs.",
    thumbnail:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=600&fit=crop",
    price: 0,
    category: CourseCategory.TYPESCRIPT,
    level: CourseLevel.BEGINNER,
    duration: 360,
    accessTier: CourseAccessTier.FREE,
    featured: false,
    publicEvaluation:
      "Transition en douceur de JavaScript vers TypeScript avec des exemples concrets.",
    publicPrerequisites:
      "Bonnes bases en JavaScript ES6+. Expérience avec les modules et les outils de build.",
    publicResources:
      "Migration guides, templates TypeScript, exercices de refactoring, best practices",
    publicStructure:
      "5 modules : Types de base, Interfaces, Génériques, Configuration, Migration",
  },
  {
    title: "Intelligence Artificielle et Applications Web",
    slug: "ai-web-applications-development",
    description:
      "Intégrez l'IA dans vos applications web avec OpenAI, LangChain, et les LLMs. Créez des chatbots intelligents, des systèmes de recommandation, des générateurs de contenu, et explorez RAG, fine-tuning, et déploiement d'applications IA.",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    price: 399.99,
    category: CourseCategory.AI,
    level: CourseLevel.ADVANCED,
    duration: 960,
    accessTier: CourseAccessTier.PREMIUM,
    featured: true,
    publicEvaluation:
      "Formation cutting-edge pour intégrer l'IA dans le développement web moderne.",
    publicPrerequisites:
      "Expérience en développement web, APIs REST, bases de données. Connaissances en Python un plus.",
    publicResources:
      "Projets IA, accès aux APIs, notebooks Jupyter, veille technologique",
    publicStructure:
      "7 modules : Fondamentaux IA, OpenAI APIs, LangChain, RAG, Chatbots, Déploiement, Éthique",
  },
  {
    title: "DevOps Moderne : Docker, Kubernetes, AWS",
    slug: "devops-docker-kubernetes-aws",
    description:
      "Maîtrisez la chaîne DevOps complète pour le développement web moderne. Containerisation avec Docker, orchestration Kubernetes, déploiement cloud AWS, CI/CD, monitoring, et infrastructure as code. Automatisez et sécurisez vos déploiements.",
    thumbnail:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    price: 249.99,
    category: CourseCategory.DEVOPS,
    level: CourseLevel.INTERMEDIATE,
    duration: 840,
    accessTier: CourseAccessTier.PREMIUM,
    featured: true,
    publicEvaluation:
      "Formation pratique pour automatiser vos déploiements et gérer l'infrastructure cloud.",
    publicPrerequisites:
      "Expérience en développement web, ligne de commande Linux/Unix, bases des réseaux.",
    publicResources:
      "Environnements cloud, scripts d'automatisation, templates IaC, monitoring dashboards",
    publicStructure:
      "6 modules : Docker, Kubernetes, AWS, CI/CD, Monitoring, Infrastructure as Code",
  },
  {
    title: "Développement Frontend Moderne",
    slug: "frontend-development-moderne",
    description:
      "Créez des interfaces utilisateur exceptionnelles avec HTML5, CSS3, JavaScript moderne, et les outils de build actuels. Responsive design, animations, performance, accessibilité, et workflow moderne avec Vite, PostCSS, et les dernières techniques.",
    thumbnail:
      "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=600&fit=crop",
    price: 0,
    category: CourseCategory.FRONTEND,
    level: CourseLevel.BEGINNER,
    duration: 400,
    accessTier: CourseAccessTier.FREE,
    featured: false,
    publicEvaluation:
      "Bases solides du développement frontend avec les technologies et outils modernes.",
    publicPrerequisites:
      "Aucun prérequis. Formation accessible aux débutants complets.",
    publicResources:
      "Projets responsive, code playground, design system, outils de debug",
    publicStructure:
      "5 modules : HTML5 sémantique, CSS moderne, JavaScript ES6+, Outils de build, Projets",
  },
  {
    title: "Architecture Backend Scalable avec Node.js",
    slug: "backend-architecture-nodejs-scalable",
    description:
      "Concevez et développez des APIs robustes et scalables avec Node.js, Express, microservices, et patterns d'architecture enterprise. Gestion des données, sécurité, performance, tests, documentation, et déploiement à grande échelle.",
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
    price: 199.99,
    category: CourseCategory.BACKEND,
    level: CourseLevel.ADVANCED,
    duration: 720,
    accessTier: CourseAccessTier.PREMIUM,
    featured: false,
    publicEvaluation:
      "Formation avancée pour architectes et développeurs backend expérimentés.",
    publicPrerequisites:
      "Expérience solide en JavaScript/Node.js, APIs REST, bases de données relationnelles et NoSQL.",
    publicResources:
      "Architectures de référence, patterns library, outils de monitoring, code reviews",
    publicStructure:
      "7 modules : Architecture, Microservices, Sécurité, Performance, Testing, Documentation, Production",
  },
];

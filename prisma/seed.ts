#!/usr/bin/env node

/**
 * FYGS Academy - Comprehensive Database Seed
 *
 * This script creates realistic, production-ready seed data for testing and development.
 * Includes all models with authentic content, proper relationships, and varied scenarios.
 *
 * Features:
 * - Real-world user profiles with Unsplash avatars
 * - Complete course catalog with detailed content
 * - Comprehensive review system with interactions
 * - Payment and subscription scenarios
 * - Rich progress tracking data
 * - Visual supports and quiz content
 * - Analytics-ready data patterns
 */

import { PrismaClient } from "@prisma/client";
import {
  Role,
  CourseCategory,
  CourseLevel,
  CourseAccessTier,
  SubscriptionStatus,
  SubscriptionPlan,
  PaymentStatus,
  PaymentKind,
  ReviewStatus,
  ReportReason,
  ReportStatus,
  BadgeType,
  NotificationType,
  MentorRequestStatus,
  VoteType,
} from "@prisma/client";

const prisma = new PrismaClient();

// Utility functions for realistic data generation
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Realistic seed data
const realisticUsers = [
  {
    name: "Fernand Soualo",
    email: "fernand@fygs.dev",
    role: Role.INSTRUCTOR,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur Full-Stack avec 8 ans d'expérience, passionné par l'enseignement et les technologies modernes.",
  },
  {
    name: "Admin FYGS",
    email: "fygs.dev@gmail.com",
    role: Role.ADMIN,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Équipe d'administration de FYGS Academy",
  },
  // Premium students
  {
    name: "Alice Martin",
    email: "alice.martin@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Designer UX/UI en reconversion vers le développement Full-Stack",
  },
  {
    name: "Pierre Dubois",
    email: "pierre.dubois@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: "Ingénieur en informatique, spécialisé en développement web moderne",
  },
  {
    name: "Sophie Leroy",
    email: "sophie.leroy@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    bio: "Développeuse junior passionnée par React et l'écosystème JavaScript",
  },
  // Regular students
  {
    name: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face",
    bio: "Étudiant en informatique, futur développeur web",
  },
  {
    name: "Marie Petit",
    email: "marie.petit@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    bio: "Freelance en marketing digital, apprend le développement pour créer ses propres outils",
  },
  {
    name: "Lucas Moreau",
    email: "lucas.moreau@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur backend Python en transition vers JavaScript/TypeScript",
  },
  {
    name: "Emma Rousseau",
    email: "emma.rousseau@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    bio: "Ancienne chef de projet, se forme au développement web pour créer sa startup",
  },
  {
    name: "Hugo Garcia",
    email: "hugo.garcia@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur mobile React Native, élargit ses compétences au web",
  },
  {
    name: "Léa Martinez",
    email: "lea.martinez@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    bio: "Data scientist qui s'intéresse au développement d'applications web",
  },
  {
    name: "Nathan Wilson",
    email: "nathan.wilson@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur Java Enterprise cherchant à moderniser ses compétences",
  },
  {
    name: "Chloé Johnson",
    email: "chloe.johnson@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1526346698789-22fd84314424?w=150&h=150&fit=crop&crop=face",
    bio: "Designer graphique qui apprend le code pour créer des expériences interactives",
  },
];

const comprehensiveCourses = [
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

// Reviews with realistic content
const authenticReviews = [
  {
    rating: 5,
    comment:
      "Formation excellente ! Les explications sont claires et les projets pratiques permettent vraiment de maîtriser les concepts. Fernand est un excellent pédagogue qui sait rendre accessible des sujets complexes. Je recommande vivement !",
    verified: true,
  },
  {
    rating: 5,
    comment:
      "Enfin une formation qui va à l'essentiel ! J'ai appris plus en quelques semaines qu'en plusieurs mois d'auto-formation. Les exercices sont progressifs et bien pensés. Support technique très réactif.",
    verified: true,
  },
  {
    rating: 4,
    comment:
      "Très bonne formation, contenu de qualité et bien structuré. Parfois un peu dense mais c'est normal vu la richesse du programme. Les projets finaux sont particulièrement enrichissants.",
    verified: true,
  },
  {
    rating: 5,
    comment:
      "Formation complète qui m'a permis de passer d'un niveau débutant à un niveau confirmé. Les concepts avancés sont très bien expliqués avec de nombreux exemples pratiques. Excellent investissement !",
    verified: true,
  },
  {
    rating: 4,
    comment:
      "Contenu très riche et à jour avec les dernières pratiques. J'aurais aimé plus d'exercices intermédiaires mais dans l'ensemble c'est une excellente formation. Le format vidéo + exercices fonctionne bien.",
    verified: false,
  },
  {
    rating: 5,
    comment:
      "Perfect course for developers wanting to level up! Clear explanations, great projects, and excellent community support. The practical approach really helps understanding complex concepts.",
    verified: true,
  },
  {
    rating: 3,
    comment:
      "Formation correcte mais j'ai trouvé certaines parties un peu trop rapides. Il faut déjà avoir quelques bases contrairement à ce qui est annoncé. Néanmoins, le contenu est de qualité.",
    verified: false,
  },
  {
    rating: 5,
    comment:
      "Extraordinaire ! Cette formation a changé ma carrière. J'ai pu décrocher un poste de développeur senior grâce aux compétences acquises. Merci FYGS Academy !",
    verified: true,
  },
  {
    rating: 4,
    comment:
      "Très bonne formation avec un contenu moderne et pertinent. Les projets sont proches de la réalité professionnelle. Seul bémol : j'aurais aimé plus de feedback personnalisé sur les exercices.",
    verified: true,
  },
  {
    rating: 5,
    comment:
      "Formation de haut niveau ! L'approche pédagogique est excellente, les ressources nombreuses et la communauté très active. Je recommande à tous les développeurs qui veulent progresser.",
    verified: true,
  },
];

// Visual supports content
const visualSupportsData = {
  nextjsEvolution: {
    type: "presentation",
    slides: [
      {
        title: "L'Évolution du Rendu Web",
        content: {
          sections: [
            {
              title: "Client-Side Rendering (CSR)",
              description: "Applications entièrement rendues côté client",
              pros: ["Interactivité riche", "UX fluide après chargement"],
              cons: ["SEO difficile", "Performance initiale lente"],
            },
            {
              title: "Server-Side Rendering (SSR)",
              description: "Rendu côté serveur à chaque requête",
              pros: ["SEO optimal", "Performance initiale rapide"],
              cons: ["Charge serveur élevée", "Hydratation complexe"],
            },
            {
              title: "Static Site Generation (SSG)",
              description: "Pré-génération de pages statiques",
              pros: ["Performance maximale", "Évolutivité excellente"],
              cons: ["Données statiques", "Rebuild pour mise à jour"],
            },
          ],
        },
      },
    ],
  },
  reactPatterns: {
    type: "code-demonstration",
    examples: [
      {
        title: "Custom Hooks Pattern",
        description: "Réutilisation de logique avec des hooks personnalisés",
        code: `
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}
        `,
      },
    ],
  },
};

async function main() {
  console.log("🌱 Starting comprehensive FYGS Academy database seed...");

  const startTime = Date.now();

  try {
    // 1. Create users with realistic profiles
    console.log("👥 Creating realistic user profiles...");
    const users = [];

    for (const userData of realisticUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          emailVerified: true,
          image: userData.image,
        },
      });
      users.push(user);
    }

    const [instructor, , ...students] = users;
    console.log(
      `✅ Created ${users.length} users (1 instructor, 1 admin, ${students.length} students)`
    );

    // 2. Create subscriptions with various statuses
    console.log("💳 Setting up subscription scenarios...");
    const subscriptionScenarios = [
      {
        userId: students[0].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.PREMIUM,
        stripeId: "sub_premium_alice",
      },
      {
        userId: students[1].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.PREMIUM,
        stripeId: "sub_premium_pierre",
      },
      {
        userId: students[2].id,
        status: SubscriptionStatus.CANCELED,
        plan: SubscriptionPlan.PREMIUM,
        stripeId: "sub_canceled_sophie",
      },
      {
        userId: students[3].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.FREE,
      },
      {
        userId: students[4].id,
        status: SubscriptionStatus.PAST_DUE,
        plan: SubscriptionPlan.PREMIUM,
        stripeId: "sub_pastdue_marie",
      },
      {
        userId: students[5].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.FREE,
      },
      {
        userId: students[6].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.FREE,
      },
      {
        userId: students[7].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.PREMIUM,
        stripeId: "sub_premium_emma",
      },
      {
        userId: students[8].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.FREE,
      },
      {
        userId: students[9].id,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.FREE,
      },
    ];

    for (const sub of subscriptionScenarios) {
      await prisma.subscription.upsert({
        where: { userId: sub.userId },
        update: {},
        create: {
          userId: sub.userId,
          status: sub.status,
          plan: sub.plan,
          stripeCustomerId: sub.stripeId ? `cus_${sub.stripeId}` : undefined,
          stripeSubscriptionId: sub.stripeId,
          priceId:
            sub.plan === SubscriptionPlan.PREMIUM
              ? "price_premium_monthly"
              : undefined,
          currentPeriodStart:
            sub.plan === SubscriptionPlan.PREMIUM
              ? new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
              : undefined,
          currentPeriodEnd:
            sub.plan === SubscriptionPlan.PREMIUM
              ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              : undefined,
        },
      });
    }
    console.log(
      `✅ Created ${subscriptionScenarios.length} subscription records`
    );

    // 3. Create comprehensive tag system
    console.log("🏷️ Building tag ecosystem...");
    const tagCategories = [
      // Technologies
      { name: "JavaScript", color: "#F7DF1E" },
      { name: "TypeScript", color: "#3178C6" },
      { name: "React", color: "#61DAFB" },
      { name: "Next.js", color: "#000000" },
      { name: "Node.js", color: "#339933" },
      { name: "Express", color: "#000000" },
      { name: "Prisma", color: "#2D3748" },
      { name: "PostgreSQL", color: "#4169E1" },
      { name: "Docker", color: "#2496ED" },
      { name: "Kubernetes", color: "#326CE5" },
      { name: "AWS", color: "#FF9900" },
      { name: "Tailwind CSS", color: "#06B6D4" },
      // Levels
      { name: "Beginner", color: "#22C55E" },
      { name: "Intermediate", color: "#F59E0B" },
      { name: "Advanced", color: "#EF4444" },
      { name: "Expert", color: "#8B5A2B" },
      // Types
      { name: "Full-Stack", color: "#F97316" },
      { name: "Frontend", color: "#EC4899" },
      { name: "Backend", color: "#8B5CF6" },
      { name: "DevOps", color: "#6366F1" },
      { name: "AI/ML", color: "#FF6B6B" },
      // Approaches
      { name: "Hands-On", color: "#10B981" },
      { name: "Project-Based", color: "#84CC16" },
      { name: "Interview Prep", color: "#A855F7" },
      { name: "Best Practices", color: "#06B6D4" },
    ];

    const tags = [];
    for (const tag of tagCategories) {
      const createdTag = await prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: tag,
      });
      tags.push(createdTag);
    }
    console.log(`✅ Created ${tags.length} tags`);

    // 4. Create comprehensive course catalog
    console.log("📚 Building course catalog...");
    const courses: any[] = [];

    for (const courseData of comprehensiveCourses) {
      const course = await prisma.course.create({
        data: {
          ...courseData,
          instructorId: instructor.id,
          published: true,
          createdAt: randomDate(
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            new Date()
          ),
          updatedAt: new Date(),
        },
      });
      courses.push(course);
    }
    console.log(`✅ Created ${courses.length} courses`);

    // 5. Create course tags relationships
    console.log("🔗 Linking courses with tags...");
    const courseTagMappings = [
      {
        courseIndex: 0,
        tagNames: ["JavaScript", "Beginner", "Hands-On", "Frontend"],
      },
      {
        courseIndex: 1,
        tagNames: ["React", "Advanced", "Frontend", "Best Practices"],
      },
      {
        courseIndex: 2,
        tagNames: [
          "Next.js",
          "React",
          "Full-Stack",
          "Intermediate",
          "TypeScript",
        ],
      },
      {
        courseIndex: 3,
        tagNames: ["TypeScript", "JavaScript", "Beginner", "Best Practices"],
      },
      {
        courseIndex: 4,
        tagNames: ["AI/ML", "Advanced", "JavaScript", "Project-Based"],
      },
      {
        courseIndex: 5,
        tagNames: ["DevOps", "Docker", "Kubernetes", "AWS", "Intermediate"],
      },
      {
        courseIndex: 6,
        tagNames: ["Frontend", "Beginner", "Hands-On", "Tailwind CSS"],
      },
      {
        courseIndex: 7,
        tagNames: ["Backend", "Node.js", "Advanced", "Express"],
      },
    ];

    for (const mapping of courseTagMappings) {
      const course = courses[mapping.courseIndex];
      for (const tagName of mapping.tagNames) {
        const tag = tags.find((t) => t.name === tagName);
        if (tag && course) {
          await prisma.courseTag.create({
            data: {
              courseId: course.id,
              tagId: tag.id,
            },
          });
        }
      }
    }
    console.log("✅ Linked courses with relevant tags");

    // 6. Create course modules and lessons
    console.log("📖 Creating course content structure...");
    const modulesAndLessons = [
      {
        courseIndex: 0, // JavaScript Fundamentals
        modules: [
          {
            title: "Fondamentaux JavaScript",
            lessons: [
              {
                title: "Introduction à JavaScript",
                duration: 45,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Variables et Types de données",
                duration: 35,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Opérateurs et Expressions",
                duration: 30,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Structures de contrôle",
                duration: 40,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
            ],
          },
          {
            title: "Fonctions et Objets",
            lessons: [
              {
                title: "Fonctions de base",
                duration: 35,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Objets et Propriétés",
                duration: 40,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Méthodes et This",
                duration: 45,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
            ],
          },
          {
            title: "DOM et Événements",
            lessons: [
              {
                title: "Manipulation du DOM",
                duration: 50,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Gestion des événements",
                duration: 45,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Projet : Application interactive",
                duration: 60,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
            ],
          },
        ],
      },
      {
        courseIndex: 2, // Next.js Full-Stack
        modules: [
          {
            title: "Next.js App Router",
            lessons: [
              {
                title: "Introduction App Router",
                duration: 30,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Routing et Navigation",
                duration: 45,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Layouts et Templates",
                duration: 40,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
            ],
          },
          {
            title: "Server Components",
            lessons: [
              {
                title: "Server vs Client Components",
                duration: 35,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Data Fetching Patterns",
                duration: 50,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
              {
                title: "Streaming et Suspense",
                duration: 40,
                videoUrl: "https://player.vimeo.com/video/287094149",
              },
            ],
          },
        ],
      },
    ];

    for (const courseContent of modulesAndLessons) {
      const course = courses[courseContent.courseIndex];

      for (
        let moduleIndex = 0;
        moduleIndex < courseContent.modules.length;
        moduleIndex++
      ) {
        const moduleData = courseContent.modules[moduleIndex];

        const courseModule = await prisma.module.create({
          data: {
            courseId: course.id,
            title: moduleData.title,
            slug: moduleData.title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            order: moduleIndex + 1,
          },
        });

        for (
          let lessonIndex = 0;
          lessonIndex < moduleData.lessons.length;
          lessonIndex++
        ) {
          const lessonData = moduleData.lessons[lessonIndex];

          await prisma.lesson.create({
            data: {
              courseId: course.id,
              moduleId: courseModule.id,
              title: lessonData.title,
              slug: lessonData.title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              description: `Apprenez ${lessonData.title.toLowerCase()} avec des exemples pratiques et des exercices.`,
              content: `# ${lessonData.title}\n\nContenu détaillé de la leçon avec explications, exemples de code et exercices pratiques.`,
              videoUrl: lessonData.videoUrl,
              duration: lessonData.duration,
              order: lessonIndex + 1,
              published: true,
            },
          });
        }
      }
    }
    console.log("✅ Created course modules and lessons");

    // 7. Create enrollments with realistic patterns
    console.log("🎓 Creating enrollment patterns...");
    const enrollmentPatterns = [
      // Free courses - multiple enrollments
      { courseIndex: 0, studentIndexes: [0, 1, 2, 3, 4, 5, 6, 7] }, // JavaScript Fundamentals
      { courseIndex: 3, studentIndexes: [1, 2, 4, 5, 7, 8] }, // TypeScript
      { courseIndex: 6, studentIndexes: [0, 3, 5, 6, 9] }, // Frontend Fundamentals
      // Premium courses - fewer enrollments (premium students only)
      { courseIndex: 1, studentIndexes: [0, 1, 7] }, // React Advanced
      { courseIndex: 2, studentIndexes: [0, 1, 2, 7] }, // Next.js Full-Stack
      { courseIndex: 4, studentIndexes: [0, 1, 7] }, // AI Applications
      { courseIndex: 5, studentIndexes: [1, 7] }, // DevOps
      { courseIndex: 7, studentIndexes: [0, 1] }, // Backend Architecture
    ];

    for (const pattern of enrollmentPatterns) {
      const course = courses[pattern.courseIndex];

      for (const studentIndex of pattern.studentIndexes) {
        const student = students[studentIndex];

        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            enrolledAt: randomDate(
              new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              new Date()
            ),
            completedAt:
              Math.random() < 0.3
                ? randomDate(
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    new Date()
                  )
                : null,
          },
        });
      }
    }
    console.log("✅ Created realistic enrollment patterns");

    // 8. Create comprehensive community system
    console.log("🏛️ Building community forum system...");

    // Create community topics
    const communityTopics = [
      {
        name: "Général",
        slug: "general",
        description: "Discussions générales sur le développement web",
        color: "#3B82F6",
        icon: "MessageSquare",
        order: 1,
        isDefault: true,
      },
      {
        name: "JavaScript",
        slug: "javascript",
        description: "Questions et discussions autour de JavaScript",
        color: "#F7DF1E",
        icon: "Code",
        order: 2,
        courseId: courses[0].id,
      },
      {
        name: "React",
        slug: "react",
        description: "Tout sur React et son écosystème",
        color: "#61DAFB",
        icon: "Atom",
        order: 3,
        courseId: courses[1].id,
      },
      {
        name: "Next.js",
        slug: "nextjs",
        description: "Framework Next.js et développement full-stack",
        color: "#000000",
        icon: "Zap",
        order: 4,
        courseId: courses[2].id,
      },
      {
        name: "Aide & Support",
        slug: "help-support",
        description: "Demandez de l'aide à la communauté",
        color: "#10B981",
        icon: "HelpCircle",
        order: 5,
        isDefault: true,
      },
      {
        name: "Projets & Showcases",
        slug: "projects-showcases",
        description: "Partagez vos projets et réalisations",
        color: "#F59E0B",
        icon: "Star",
        order: 6,
        isDefault: true,
      },
      {
        name: "Career & Jobs",
        slug: "career-jobs",
        description: "Conseils carrière et opportunités d'emploi",
        color: "#8B5CF6",
        icon: "Briefcase",
        order: 7,
        isDefault: true,
      },
    ];

    const topics = [];
    for (const topicData of communityTopics) {
      const topic = await prisma.topic.create({
        data: topicData,
      });
      topics.push(topic);
    }
    console.log(`✅ Created ${topics.length} community topics`);

    // Create community badges
    const communityBadges = [
      {
        name: "Premier Pas",
        description: "Première connexion à la communauté",
        icon: "User",
        color: "#22C55E",
        points: 0,
        type: "PARTICIPATION" as const,
        condition: JSON.stringify({ type: "first_login" }),
      },
      {
        name: "Conversationnel",
        description: "Première discussion créée",
        icon: "MessageSquare",
        color: "#3B82F6",
        points: 10,
        type: "PARTICIPATION" as const,
        condition: JSON.stringify({ type: "first_discussion" }),
      },
      {
        name: "Serviable",
        description: "Première réponse utile",
        icon: "Heart",
        color: "#EF4444",
        points: 25,
        type: "PARTICIPATION" as const,
        condition: JSON.stringify({ type: "first_helpful_reply" }),
      },
      {
        name: "Expert",
        description: "100 réponses acceptées",
        icon: "Award",
        color: "#F59E0B",
        points: 500,
        type: "ACHIEVEMENT" as const,
        condition: JSON.stringify({ type: "accepted_replies", count: 100 }),
      },
      {
        name: "Mentor",
        description: "Guide et aide les nouveaux membres",
        icon: "Users",
        color: "#8B5CF6",
        points: 1000,
        type: "SPECIAL" as const,
        condition: JSON.stringify({ type: "mentor_activity" }),
      },
      {
        name: "Modérateur",
        description: "Équipe de modération",
        icon: "Shield",
        color: "#6366F1",
        points: 0,
        type: "MODERATOR" as const,
        condition: JSON.stringify({ type: "staff_role" }),
      },
    ];

    const badges = [];
    for (const badgeData of communityBadges) {
      const badge = await prisma.badge.create({
        data: badgeData,
      });
      badges.push(badge);
    }
    console.log(`✅ Created ${badges.length} community badges`);

    // Create community discussions
    const discussionTemplates = [
      {
        title: "Bienvenue dans la communauté FYGS Academy !",
        content: `# Bienvenue ! 👋

Nous sommes ravis de vous accueillir dans la communauté FYGS Academy !

## Comment utiliser ce forum ?

- **Posez vos questions** dans la section appropriée
- **Partagez vos projets** pour recevoir des retours
- **Aidez les autres** en répondant aux questions
- **Suivez les bonnes pratiques** de communication

## Règles de la communauté

1. Soyez respectueux et bienveillant
2. Utilisez un titre descriptif pour vos posts
3. Incluez le code et les détails pertinents
4. Recherchez avant de poster une nouvelle question

Bonne découverte ! 🚀`,
        topicIndex: 0,
        authorIndex: 0,
        isPinned: true,
        tags: ["bienvenue", "règles", "guide"],
      },
      {
        title: "Comment optimiser les performances de mes composants React ?",
        content: `Bonjour la communauté !

J'ai une application React qui commence à avoir des problèmes de performance. Mes composants se re-rendent trop souvent et l'interface devient lente.

## Mon problème

\`\`\`jsx
function MyComponent({ items, onSelect }) {
  return (
    <div>
      {items.map(item => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
\`\`\`

Avez-vous des conseils pour optimiser cela ? J'ai entendu parler de \`useMemo\` et \`useCallback\` mais je ne sais pas comment les utiliser efficacement.

Merci d'avance ! 🙏`,
        topicIndex: 2,
        authorIndex: 3,
        tags: ["react", "performance", "optimisation"],
      },
      {
        title: "Projet Portfolio - Demande de feedback",
        content: `Salut tout le monde !

Je viens de terminer mon portfolio en Next.js et j'aimerais avoir vos retours ! 

🔗 **Lien** : https://mon-portfolio.vercel.app
💻 **Code** : https://github.com/user/portfolio

## Technologies utilisées

- Next.js 15 avec App Router
- TypeScript
- Tailwind CSS
- Framer Motion pour les animations
- Prisma + PostgreSQL

## Points sur lesquels j'aimerais des retours

1. Design général et UX
2. Performance et optimisations
3. Code quality
4. Accessibilité

Merci pour votre temps ! 🚀`,
        topicIndex: 5,
        authorIndex: 4,
        tags: ["portfolio", "nextjs", "feedback"],
      },
      {
        title: "Erreur TypeScript avec Next.js 15 - Params Promise",
        content: `Bonjour !

Depuis la migration vers Next.js 15, j'ai des erreurs TypeScript avec les params des pages dynamiques.

## Erreur

\`\`\`
Type '{ id: string }' is missing the following properties from type 'Promise<any>': then, catch, finally
\`\`\`

## Code actuel

\`\`\`tsx
export default function Page({ params }: { params: { id: string } }) {
  return <div>Post ID: {params.id}</div>
}
\`\`\`

Comment je dois adapter mon code pour Next.js 15 ? J'ai lu quelque chose sur les params qui deviennent des Promises mais je ne comprends pas bien.

Merci ! 🤔`,
        topicIndex: 3,
        authorIndex: 5,
        tags: ["nextjs", "typescript", "migration"],
      },
      {
        title: "Conseils pour décrocher un premier job de développeur React ?",
        content: `Salut la communauté !

Je suis en reconversion et je termine bientôt la formation React Advanced Patterns. J'aimerais avoir vos conseils pour décrocher mon premier poste de développeur React.

## Mon profil

- 6 mois de formation intensive
- Plusieurs projets personnels (portfolio, e-commerce, blog)
- Ancien background en marketing
- Très motivé ! 💪

## Mes questions

1. Quel type de poste viser en premier ? (junior, stage, freelance ?)
2. Comment valoriser mon profil atypique ?
3. Quelles sont les compétences les plus demandées actuellement ?
4. Des conseils pour les entretiens techniques ?

Merci pour vos témoignages et conseils ! 🙏`,
        topicIndex: 6,
        authorIndex: 6,
        tags: ["career", "junior", "reconversion"],
      },
      {
        title: "Comprendre les closures en JavaScript",
        content: `Bonjour !

Je galère un peu avec le concept des closures en JavaScript. J'ai lu plusieurs articles mais j'ai du mal à saisir l'utilité pratique.

## Ce que je comprends

\`\`\`javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  }
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

## Mes questions

1. Dans quels cas concrets utilise-t-on les closures ?
2. Y a-t-il des pièges à éviter ?
3. Lien avec les modules et l'encapsulation ?

Merci pour vos explications ! 🤓`,
        topicIndex: 1,
        authorIndex: 7,
        tags: ["javascript", "closures", "concepts"],
      },
    ];

    const discussions = [];
    for (let i = 0; i < discussionTemplates.length; i++) {
      const template = discussionTemplates[i];
      const discussion = await prisma.discussion.create({
        data: {
          title: template.title,
          slug: template.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          content: template.content,
          authorId: users[template.authorIndex].id,
          topicId: topics[template.topicIndex].id,
          courseId:
            template.topicIndex > 0 && template.topicIndex < 4
              ? courses[template.topicIndex - 1]?.id
              : null,
          isPinned: template.isPinned || false,
          tags: template.tags,
          viewCount: randomBetween(50, 500),
          lastActivityAt: randomDate(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            new Date()
          ),
        },
      });
      discussions.push(discussion);
    }
    console.log(`✅ Created ${discussions.length} community discussions`);

    // Create discussion replies
    const replyTemplates = [
      {
        discussionIndex: 1, // React performance question
        authorIndex: 1, // Expert user
        content: `Excellente question ! Voici plusieurs techniques pour optimiser tes composants React :

## 1. React.memo pour éviter les re-renders inutiles

\`\`\`jsx
const ItemCard = React.memo(({ item, onClick }) => {
  return <div onClick={onClick}>{item.name}</div>;
});
\`\`\`

## 2. useCallback pour stabiliser les fonctions

\`\`\`jsx
function MyComponent({ items, onSelect }) {
  const handleSelect = useCallback((item) => {
    onSelect(item);
  }, [onSelect]);

  return (
    <div>
      {items.map(item => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={() => handleSelect(item)}
        />
      ))}
    </div>
  );
}
\`\`\`

## 3. useMemo pour les calculs coûteux

Si tu as des transformations de données coûteuses, utilise \`useMemo\` !

Tu peux aussi regarder les React DevTools Profiler pour identifier les composants problématiques. 🔍`,
        isAccepted: true,
      },
      {
        discussionIndex: 1,
        authorIndex: 8,
        content: `+1 pour les conseils de @${users[1].name} ! 

J'ajouterais aussi de faire attention aux props qui changent à chaque render. Par exemple :

❌ **À éviter :**
\`\`\`jsx
<Component style={{ margin: 10 }} />
\`\`\`

✅ **Mieux :**
\`\`\`jsx
const styles = { margin: 10 };
<Component style={styles} />
\`\`\`

La règle d'or : toujours penser à la référence des objets ! 👍`,
      },
      {
        discussionIndex: 2, // Portfolio feedback
        authorIndex: 2,
        content: `Super portfolio ! 🎉 Voici mes retours :

## ✅ Points forts
- Design moderne et épuré
- Animations fluides avec Framer Motion
- Code bien structuré sur GitHub
- Performance excellente (99/100 sur Lighthouse)

## 💡 Suggestions d'amélioration
1. **Accessibilité** : Ajouter plus de labels ARIA
2. **SEO** : Optimiser les meta descriptions
3. **Contact** : Ajouter un formulaire de contact
4. **Blog** : Section blog pour montrer tes connaissances

## 🚀 Recommandations pour décrocher un job
Avec ce niveau, tu peux viser des postes junior/mid-level ! N'hésite pas à postuler. 

Bravo pour le travail ! 👏`,
      },
      {
        discussionIndex: 3, // Next.js 15 TypeScript
        authorIndex: 0, // Instructor
        content: `Salut ! C'est effectivement un changement important dans Next.js 15. 

## Solution

Depuis Next.js 15, les \`params\` et \`searchParams\` sont des Promises. Voici comment adapter ton code :

\`\`\`tsx
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <div>Post ID: {id}</div>
}
\`\`\`

## Pourquoi ce changement ?

Cela permet une meilleure optimisation des performances et prépare Next.js pour les futures fonctionnalités de streaming.

## Pour generateMetadata aussi

\`\`\`tsx
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: \`Post \${id}\` };
}
\`\`\`

J'ai prévu de faire une vidéo sur ce sujet dans la formation Next.js ! 📹`,
        isModerator: true,
      },
      {
        discussionIndex: 4, // Career advice
        authorIndex: 9,
        content: `Salut ! Moi aussi je suis en reconversion (ancien comptable) et j'ai décroché mon premier poste il y a 6 mois. Voici mes conseils :

## 🎯 Type de poste à viser
- **Stage de fin d'études** (même en reconversion)
- **Poste junior avec formation** 
- **Missions courtes en freelance** pour se faire la main

## 💪 Valoriser ton profil atypique
- Met en avant tes **soft skills** du marketing
- Montre ta **capacité d'apprentissage**
- Parle de tes **projets concrets**

## 📚 Compétences demandées actuellement
1. React/Next.js (tu es bon là-dessus !)
2. TypeScript
3. Tests (Jest/Testing Library)
4. Git en équipe
5. Méthodes agiles

## 🎤 Entretiens techniques
- **Prépare des exercices** sur CodeWars/LeetCode
- **Explique ton code** à voix haute
- **Pose des questions** sur leur stack technique

Tu as déjà un bon profil, continue ! 🚀`,
      },
      {
        discussionIndex: 5, // JavaScript closures
        authorIndex: 1,
        content: `Les closures sont super utiles ! Voici des cas concrets :

## 🏭 Factory pattern
\`\`\`javascript
function createValidator(rules) {
  return function(data) {
    return rules.every(rule => rule(data));
  };
}

const emailValidator = createValidator([
  data => data.includes('@'),
  data => data.length > 5
]);
\`\`\`

## 🔒 Variables privées (avant les classes)
\`\`\`javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;
  
  return {
    deposit: (amount) => balance += amount,
    withdraw: (amount) => balance -= amount,
    getBalance: () => balance
  };
}
\`\`\`

## ⚡ Throttle/Debounce
\`\`\`javascript
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
\`\`\`

Les closures permettent de créer des "environnements persistants" ! 🧠`,
      },
    ];

    const replies = [];
    for (const template of replyTemplates) {
      const reply = await prisma.discussionReply.create({
        data: {
          content: template.content,
          authorId: users[template.authorIndex].id,
          discussionId: discussions[template.discussionIndex].id,
          isAccepted: template.isAccepted || false,
          isModerator: template.isModerator || false,
          upvoteCount: randomBetween(0, 25),
          downvoteCount: randomBetween(0, 3),
        },
      });
      replies.push(reply);
    }
    console.log(`✅ Created ${replies.length} discussion replies`);

    // Create discussion votes
    const votingUsers = students.slice(0, 8);
    for (const discussion of discussions) {
      const voteCount = randomBetween(2, 10);
      const votingSubset = votingUsers.slice(0, voteCount);

      for (const voter of votingSubset) {
        if (voter.id !== discussion.authorId) {
          await prisma.discussionVote.create({
            data: {
              userId: voter.id,
              discussionId: discussion.id,
              voteType: Math.random() > 0.8 ? "DOWNVOTE" : "UPVOTE",
            },
          });
        }
      }
    }

    // Create reply votes
    for (const reply of replies) {
      const voteCount = randomBetween(1, 8);
      const votingSubset = votingUsers.slice(0, voteCount);

      for (const voter of votingSubset) {
        if (voter.id !== reply.authorId) {
          await prisma.discussionVote.create({
            data: {
              userId: voter.id,
              replyId: reply.id,
              voteType: Math.random() > 0.9 ? "DOWNVOTE" : "UPVOTE",
            },
          });
        }
      }
    }
    console.log("✅ Created discussion and reply votes");

    // Create topic follows
    for (const student of students.slice(0, 6)) {
      const followCount = randomBetween(2, 4);
      const topicsToFollow = topics.slice(0, followCount);

      for (const topic of topicsToFollow) {
        await prisma.topicFollow.create({
          data: {
            userId: student.id,
            topicId: topic.id,
          },
        });
      }
    }
    console.log("✅ Created topic follows");

    // Create discussion bookmarks
    for (const student of students.slice(0, 5)) {
      const bookmarkCount = randomBetween(1, 3);
      const discussionsToBookmark = discussions.slice(0, bookmarkCount);

      for (const discussion of discussionsToBookmark) {
        await prisma.discussionBookmark.create({
          data: {
            userId: student.id,
            discussionId: discussion.id,
          },
        });
      }
    }
    console.log("✅ Created discussion bookmarks");

    // Award community badges to active users
    const activeUsers = [instructor, ...students.slice(0, 5)];
    for (const user of activeUsers) {
      // Everyone gets "Premier Pas"
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badges[0].id, // Premier Pas
        },
      });

      // Some get more badges based on activity
      if (user.role === Role.INSTRUCTOR) {
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badges[5].id, // Modérateur
          },
        });
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badges[4].id, // Mentor
          },
        });
      } else if (students.indexOf(user) < 3) {
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badges[1].id, // Conversationnel
          },
        });
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badges[2].id, // Serviable
          },
        });
      }
    }
    console.log("✅ Awarded community badges");

    // Create community notifications
    const notificationTypes = [
      {
        recipientId: students[2].id,
        senderId: users[1].id,
        type: "DISCUSSION_REPLY" as const,
        title: "Nouvelle réponse à votre discussion",
        message: "Votre question sur React a reçu une nouvelle réponse",
        data: { discussionId: discussions[1].id },
      },
      {
        recipientId: students[3].id,
        type: "BADGE_EARNED" as const,
        title: "Nouveau badge débloqué !",
        message: "Vous avez gagné le badge 'Conversationnel'",
        data: { badgeId: badges[1].id },
      },
      {
        recipientId: students[4].id,
        senderId: instructor.id,
        type: "DISCUSSION_MENTION" as const,
        title: "Vous avez été mentionné",
        message: "Fernand vous a mentionné dans une discussion",
        data: { discussionId: discussions[0].id },
      },
    ];

    for (const notification of notificationTypes) {
      await prisma.notification.create({
        data: notification,
      });
    }
    console.log("✅ Created community notifications");

    // Create mentor requests
    const mentorRequests = [
      {
        studentId: students[5].id,
        mentorId: instructor.id,
        courseId: courses[2].id, // Next.js course
        message:
          "Bonjour ! J'aimerais avoir des conseils personnalisés pour progresser en Next.js et améliorer mon code. Serait-il possible d'avoir un mentorat ?",
        status: "PENDING" as const,
      },
      {
        studentId: students[7].id,
        mentorId: instructor.id,
        courseId: courses[1].id, // React course
        message:
          "Salut Fernand ! Je galère un peu avec les patterns avancés React. Peux-tu m'aider à structurer mon apprentissage ?",
        status: "ACCEPTED" as const,
      },
    ];

    for (const request of mentorRequests) {
      await prisma.mentorRequest.create({
        data: request,
      });
    }
    console.log("✅ Created mentor requests");

    // Update user community data
    await prisma.user.update({
      where: { id: instructor.id },
      data: {
        communityPoints: 1500,
        communityLevel: 5,
        lastActiveAt: new Date(),
      },
    });

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      await prisma.user.update({
        where: { id: student.id },
        data: {
          communityPoints: randomBetween(50, 500),
          communityLevel: randomBetween(1, 3),
          lastActiveAt: randomDate(
            new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            new Date()
          ),
        },
      });
    }
    console.log("✅ Updated user community data");

    // 9. Create comprehensive review system with interactions
    console.log("⭐ Building comprehensive review system...");

    // Get all enrollments to create reviews
    const enrollments = await prisma.enrollment.findMany({
      include: {
        course: true,
        user: true,
      },
    });

    const createdReviews = [];

    for (
      let i = 0;
      i < Math.min(enrollments.length, authenticReviews.length * 2);
      i++
    ) {
      const enrollment = enrollments[i];
      const reviewTemplate = authenticReviews[i % authenticReviews.length];

      // Only create reviews for completed enrollments or random chance
      if (enrollment.completedAt || Math.random() < 0.4) {
        const review = await prisma.review.create({
          data: {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            rating: reviewTemplate.rating,
            comment: reviewTemplate.comment,
            verified: reviewTemplate.verified && !!enrollment.completedAt,
            helpfulCount: randomBetween(0, 15),
            status:
              Math.random() < 0.95
                ? ReviewStatus.APPROVED
                : ReviewStatus.PENDING,
            createdAt: randomDate(
              enrollment.enrolledAt,
              enrollment.completedAt || new Date()
            ),
          },
        });
        createdReviews.push(review);
      }
    }
    console.log(`✅ Created ${createdReviews.length} authentic reviews`);

    // 9. Add review interactions (votes, replies, reports)
    console.log("💬 Adding review interactions...");

    // Create review votes
    const votingStudents = students.slice(0, 6); // First 6 students vote on reviews

    for (const review of createdReviews.slice(0, 8)) {
      // Vote on first 8 reviews
      const numVotes = randomBetween(1, 4);
      const votersSubset = votingStudents.slice(0, numVotes);

      for (const voter of votersSubset) {
        // Don't vote on your own review
        if (voter.id !== review.userId) {
          await prisma.reviewVote.create({
            data: {
              userId: voter.id,
              reviewId: review.id,
              helpful: Math.random() < 0.8, // 80% helpful votes
              createdAt: randomDate(new Date(review.createdAt), new Date()),
            },
          });
        }
      }
    }

    // Create instructor replies to some reviews
    const repliedReviews = createdReviews.slice(0, 5); // Reply to first 5 reviews

    const instructorReplies = [
      "Merci beaucoup pour ce retour positif ! Je suis ravi que la formation vous ait apporté les compétences recherchées. N'hésitez pas si vous avez des questions.",
      "Merci pour votre avis constructif. Je prends note de vos suggestions pour améliorer le contenu. La prochaine mise à jour inclura plus d'exercices intermédiaires.",
      "Excellent ! Félicitations pour votre progression. C'est exactement l'objectif de cette formation : vous donner les outils pour évoluer dans votre carrière.",
      "Merci pour ce feedback détaillé. Je suis heureux que l'approche pratique vous ait convenu. Bonne continuation dans vos projets !",
      "Merci ! C'est formidable de voir que la formation a eu un impact concret sur votre carrière. Continuez comme ça !",
    ];

    for (let i = 0; i < repliedReviews.length; i++) {
      const review = repliedReviews[i];

      await prisma.reviewReply.create({
        data: {
          reviewId: review.id,
          userId: instructor.id, // Instructor replies
          content: instructorReplies[i],
          createdAt: randomDate(new Date(review.createdAt), new Date()),
        },
      });
    }

    // Create a few review reports (for moderation testing)
    const reportedReviews = createdReviews.slice(-2); // Report last 2 reviews

    for (const review of reportedReviews) {
      const reporter = randomChoice(
        students.filter((s) => s.id !== review.userId)
      );

      await prisma.reviewReport.create({
        data: {
          reviewId: review.id,
          userId: reporter.id,
          reason: randomChoice([
            ReportReason.SPAM,
            ReportReason.INAPPROPRIATE,
            ReportReason.FAKE,
          ]),
          details:
            "Ce commentaire semble suspect ou non pertinent pour la formation.",
          status: ReportStatus.PENDING,
        },
      });
    }

    console.log("✅ Added review interactions (votes, replies, reports)");

    // 10. Create progress tracking data
    console.log("📊 Creating progress tracking data...");

    const progressEnrollments = enrollments.filter(() => Math.random() < 0.7); // 70% have progress

    for (const enrollment of progressEnrollments) {
      // Get lessons for this course
      const lessons = await prisma.lesson.findMany({
        where: { courseId: enrollment.courseId },
        orderBy: { order: "asc" },
      });

      // Create progress for a portion of lessons
      const progressPercentage = Math.random();
      const lessonsToComplete = Math.floor(lessons.length * progressPercentage);

      for (let i = 0; i < lessonsToComplete; i++) {
        const lesson = lessons[i];
        const isCompleted = i < lessonsToComplete - 1 || Math.random() < 0.8;

        await prisma.progress.create({
          data: {
            userId: enrollment.userId,
            lessonId: lesson.id,
            completed: isCompleted,
            watchTime: Math.floor(
              (lesson.duration || 30) * (0.7 + Math.random() * 0.5)
            ), // 70-120% of lesson duration
            completedAt: isCompleted
              ? randomDate(enrollment.enrolledAt, new Date())
              : null,
            createdAt: enrollment.enrolledAt,
          },
        });
      }
    }
    console.log("✅ Created realistic progress tracking data");

    // 11. Create payments for premium courses
    console.log("💰 Creating payment records...");

    const premiumEnrollments = enrollments.filter(
      (e) =>
        courses.find((c) => c.id === e.courseId)?.accessTier ===
        CourseAccessTier.PREMIUM
    );

    for (const enrollment of premiumEnrollments) {
      const course = courses.find((c) => c.id === enrollment.courseId);

      await prisma.payment.create({
        data: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          amount: course?.price || 99.99,
          currency: "eur",
          status: PaymentStatus.COMPLETED,
          kind: PaymentKind.COURSE,
          description: `Achat du cours: ${course?.title}`,
          stripePaymentIntentId: `pi_${Math.random()
            .toString(36)
            .substring(7)}`,
          createdAt: enrollment.enrolledAt,
        },
      });
    }
    console.log(`✅ Created ${premiumEnrollments.length} payment records`);

    // 12. Create visual supports and quizzes
    console.log("🎯 Creating visual supports and interactive quizzes...");

    // Visual supports for first two courses
    const supportCourses = courses.slice(0, 2);

    for (
      let courseIndex = 0;
      courseIndex < supportCourses.length;
      courseIndex++
    ) {
      const course = supportCourses[courseIndex];

      await prisma.visualSupport.create({
        data: {
          courseId: course.id,
          moduleId: courseIndex + 1,
          title:
            courseIndex === 0
              ? "Fondamentaux JavaScript"
              : "Patterns React Avancés",
          content:
            courseIndex === 0
              ? visualSupportsData.nextjsEvolution
              : visualSupportsData.reactPatterns,
          order: 1,
        },
      });

      // Create quiz
      const quiz = await prisma.quiz.create({
        data: {
          courseId: course.id,
          moduleId: courseIndex + 1,
          title: `Quiz - Module ${courseIndex + 1}`,
        },
      });

      // Add quiz questions
      const questions =
        courseIndex === 0
          ? [
              {
                question:
                  "Quelle est la principale différence entre `var` et `let` en JavaScript ?",
                options: [
                  "Aucune différence",
                  "La portée (scope)",
                  "La syntaxe",
                  "La performance",
                ],
                correct: 1,
                explanation:
                  "`let` a une portée de bloc tandis que `var` a une portée de fonction.",
              },
              {
                question: "Que retourne `typeof null` en JavaScript ?",
                options: ["'null'", "'undefined'", "'object'", "'boolean'"],
                correct: 2,
                explanation:
                  "C'est un bug historique de JavaScript. `typeof null` retourne 'object'.",
              },
            ]
          : [
              {
                question: "Quel hook React permet de mémoriser une fonction ?",
                options: ["useMemo", "useCallback", "useRef", "useEffect"],
                correct: 1,
                explanation:
                  "`useCallback` mémorise une fonction pour éviter sa recréation inutile.",
              },
            ];

      for (let qIndex = 0; qIndex < questions.length; qIndex++) {
        const q = questions[qIndex];

        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            order: qIndex + 1,
          },
        });
      }
    }
    console.log("✅ Created visual supports and quizzes");

    // 13. Create certificates for completed courses
    console.log("🏆 Issuing certificates...");

    const completedEnrollments = enrollments.filter((e) => e.completedAt);

    for (const enrollment of completedEnrollments) {
      await prisma.certificate.create({
        data: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          issuedAt: enrollment.completedAt!,
        },
      });
    }
    console.log(`✅ Issued ${completedEnrollments.length} certificates`);

    // 14. Create analytics events
    console.log("📈 Creating analytics data...");

    const eventTypes = [
      "course_view",
      "lesson_start",
      "lesson_complete",
      "quiz_attempt",
      "review_submit",
      "payment_success",
      "enrollment_create",
    ];

    // Create 500 analytics events over the last 30 days
    for (let i = 0; i < 500; i++) {
      const randomUser = randomChoice(users);
      const randomCourse = randomChoice(courses);

      await prisma.analyticsEvent.create({
        data: {
          userId: randomUser.id,
          type: randomChoice(eventTypes),
          source: randomChoice(["web", "mobile", "api"]),
          createdAt: randomDate(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            new Date()
          ),
          properties: {
            courseId: randomCourse.id,
            userAgent: "Mozilla/5.0 (compatible)",
            platform: randomChoice(["desktop", "mobile", "tablet"]),
          },
        },
      });
    }
    console.log("✅ Created analytics events");

    // 15. Final statistics
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n🎉 FYGS Academy seed completed successfully!");
    console.log("═".repeat(50));
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`⭐ Reviews: ${createdReviews.length}`);
    console.log(`🎓 Enrollments: ${enrollments.length}`);
    console.log(`💰 Payments: ${premiumEnrollments.length}`);
    console.log(`🏆 Certificates: ${completedEnrollments.length}`);
    console.log(`🏷️  Tags: ${tags.length}`);
    console.log(`🏛️  Topics: ${topics.length}`);
    console.log(`💬 Discussions: ${discussions.length}`);
    console.log(`↩️  Replies: ${replies.length}`);
    console.log(`🎖️  Badges: ${badges.length}`);
    console.log(`📊 Analytics events: 500`);
    console.log("═".repeat(50));
    console.log(
      "🚀 Ready for development and testing with full community system!"
    );
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("💥 Fatal error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

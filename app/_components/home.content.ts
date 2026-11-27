import { t, type Dictionary } from "intlayer";

// Spec: docs/specs/homepage-redesign.md
// Rule: no claim without proof (spec §4). es falls back to the English copy.
const homeContent = {
  key: "home",
  content: {
    method: {
      badge: t({ en: "Method", fr: "Méthode", es: "Method" }),
      title: t({
        en: "AI-augmented developer, rigorous flow. Not vibe coding.",
        fr: "Développeur augmenté par l'IA, flow rigoureux. Pas du vibe coding.",
        es: "AI-augmented developer, rigorous flow. Not vibe coding.",
      }),
      intro: t({
        en: "AI agents write code fast. What makes the result reliable is the frame around them. Every mission follows the same six steps.",
        fr: "Les agents IA écrivent du code vite. Ce qui rend le résultat fiable, c'est le cadre autour d'eux. Chaque mission suit les mêmes six étapes.",
        es: "AI agents write code fast. What makes the result reliable is the frame around them. Every mission follows the same six steps.",
      }),
      steps: [
        {
          title: t({
            en: "Onboard the codebase",
            fr: "Prendre en main la base de code",
            es: "Onboard the codebase",
          }),
          text: t({
            en: "Read the code, fix the dev rules: the existing ones, or define them if there are none.",
            fr: "Lire le code, fixer les règles de développement : celles qui existent, ou les définir s'il n'y en a pas.",
            es: "Read the code, fix the dev rules: the existing ones, or define them if there are none.",
          }),
        },
        {
          title: t({
            en: "Frame and freeze the spec",
            fr: "Cadrer et figer la spec",
            es: "Frame and freeze the spec",
          }),
          text: t({
            en: "We leave the framing with a written spec. No spec, no code.",
            fr: "On sort du cadrage avec une spec écrite. Pas de spec, pas de code.",
            es: "We leave the framing with a written spec. No spec, no code.",
          }),
        },
        {
          title: t({
            en: "Failing tests first",
            fr: "Les tests qui échouent d'abord",
            es: "Failing tests first",
          }),
          text: t({
            en: "The expected behavior is written as tests that fail before any implementation.",
            fr: "Le comportement attendu s'écrit en tests qui échouent avant toute implémentation.",
            es: "The expected behavior is written as tests that fail before any implementation.",
          }),
        },
        {
          title: t({
            en: "Implement the feature",
            fr: "Implémenter la fonctionnalité",
            es: "Implement the feature",
          }),
          text: t({
            en: "The agents code until the tests pass, inside the rules fixed in step one.",
            fr: "Les agents codent jusqu'à ce que les tests passent, dans les règles fixées à l'étape 1.",
            es: "The agents code until the tests pass, inside the rules fixed in step one.",
          }),
        },
        {
          title: t({
            en: "Review and fix",
            fr: "Revue et corrections",
            es: "Review and fix",
          }),
          text: t({
            en: "Independent review of the result against the spec, then corrections if needed.",
            fr: "Revue indépendante du résultat par rapport à la spec, puis corrections si nécessaire.",
            es: "Independent review of the result against the spec, then corrections if needed.",
          }),
        },
        {
          title: t({
            en: "Pull request",
            fr: "Pull request",
            es: "Pull request",
          }),
          text: t({
            en: "A small, readable PR that you can review and merge.",
            fr: "Une PR petite et lisible, que vous pouvez relire et fusionner.",
            es: "A small, readable PR that you can review and merge.",
          }),
        },
      ],
    },
    projects: {
      badge: t({ en: "Work", fr: "Réalisations", es: "Work" }),
      title: t({
        en: "Shipped projects",
        fr: "Projets livrés",
        es: "Shipped projects",
      }),
      visit: t({ en: "Visit the site", fr: "Voir le site", es: "Visit the site" }),
      all: t({
        en: "All projects",
        fr: "Tous les projets",
        es: "All projects",
      }),
      items: [
        {
          name: t({
            en: "Large European insurance group",
            fr: "Grand groupe d'assurance européen",
            es: "Large European insurance group",
          }),
          text: t({
            en: "REST APIs for document management on AWS (Lambda, microservices architecture). Under confidentiality.",
            fr: "API REST de gestion documentaire sur AWS (Lambda, architecture microservices). Sous confidentialité.",
            es: "REST APIs for document management on AWS (Lambda, microservices architecture). Under confidentiality.",
          }),
          stack: ["AWS Lambda", "REST API", "Microservices"],
          link: "",
        },
        {
          name: t({
            en: "NCR · Residence certificates",
            fr: "NCR · Certificats de résidence",
            es: "NCR · Residence certificates",
          }),
          text: t({
            en: "Digitizing residence certificates in Guinea. Multi-tenant, role-based access, Orange Money payment.",
            fr: "Numérisation des certificats de résidence en Guinée. Multi-tenant, accès par rôles, paiement Orange Money.",
            es: "Digitizing residence certificates in Guinea. Multi-tenant, role-based access, Orange Money payment.",
          }),
          stack: ["Next.js", "Prisma", "Appwrite", "Docker"],
          link: "https://ncr.ouestech.com",
        },
        {
          name: t({ en: "QuizZen", fr: "QuizZen", es: "QuizZen" }),
          text: t({
            en: "Preparation for the French naturalization interview. 1,000+ questions, spaced repetition, Stripe payment.",
            fr: "Préparation à l'entretien de naturalisation française. Plus de 1 000 questions, répétition espacée, paiement Stripe.",
            es: "Preparation for the French naturalization interview. 1,000+ questions, spaced repetition, Stripe payment.",
          }),
          stack: ["Next.js", "Prisma", "PostgreSQL", "Stripe"],
          link: "https://quizzen.fr/fr",
        },
        {
          name: t({ en: "A'Numérique", fr: "A'Numérique", es: "A'Numérique" }),
          text: t({
            en: "Website of an association fighting digital illiteracy. Booking through Google Calendar, custom CRM.",
            fr: "Site d'une association qui lutte contre l'illectronisme. Réservation via Google Calendar, CRM sur mesure.",
            es: "Website of an association fighting digital illiteracy. Booking through Google Calendar, custom CRM.",
          }),
          stack: ["Next.js", "PostgreSQL", "Google Calendar"],
          link: "https://www.anumerique.com",
        },
        {
          name: t({
            en: "Les Délices de la Rachetée",
            fr: "Les Délices de la Rachetée",
            es: "Les Délices de la Rachetée",
          }),
          text: t({
            en: "Pastry showcase and ordering with a custom cake configurator and Stripe payment.",
            fr: "Vitrine et commande de pâtisseries avec configurateur de gâteaux et paiement Stripe.",
            es: "Pastry showcase and ordering with a custom cake configurator and Stripe payment.",
          }),
          stack: ["Next.js", "Prisma", "PostgreSQL", "Stripe"],
          link: "https://lesdelicesdelarachetee.vercel.app",
        },
        {
          name: t({ en: "Ouestech", fr: "Ouestech", es: "Ouestech" }),
          text: t({
            en: "Website of the company I co-founded: training, consulting and software studio.",
            fr: "Site de la société que j'ai co-fondée : formation, conseil et studio logiciel.",
            es: "Website of the company I co-founded: training, consulting and software studio.",
          }),
          stack: ["Next.js", "TypeScript"],
          link: "https://ouestech.com",
        },
      ],
    },
    work: {
      badge: t({
        en: "Working together",
        fr: "Travailler ensemble",
        es: "Working together",
      }),
      title: t({
        en: "Three ways to work with me",
        fr: "Trois façons de travailler avec moi",
        es: "Three ways to work with me",
      }),
      formats: [
        {
          title: t({
            en: "Audit & framing",
            fr: "Audit & cadrage",
            es: "Audit & framing",
          }),
          text: t({
            en: "I read your codebase, fix the dev rules and hand you a written spec you can build from.",
            fr: "Je lis votre base de code, je fixe les règles de développement et je vous remets une spec écrite exploitable.",
            es: "I read your codebase, fix the dev rules and hand you a written spec you can build from.",
          }),
        },
        {
          title: t({
            en: "Custom SaaS & business apps",
            fr: "SaaS & applications métier sur mesure",
            es: "Custom SaaS & business apps",
          }),
          text: t({
            en: "Design and delivery of a SaaS or a business web application built around your processes, from the frozen spec to the merged PR: tests first, implementation, review.",
            fr: "Conception et livraison d'un SaaS ou d'une application web métier construite autour de vos processus, de la spec figée à la PR fusionnée : tests d'abord, implémentation, revue.",
            es: "Design and delivery of a SaaS or a business web application built around your processes, from the frozen spec to the merged PR: tests first, implementation, review.",
          }),
        },
        {
          title: t({
            en: "Team reinforcement",
            fr: "Renfort d'équipe",
            es: "Team reinforcement",
          }),
          text: t({
            en: "I join your team on its own rules and bring the AI-augmented flow with me.",
            fr: "Je rejoins votre équipe selon ses propres règles et j'y apporte le flow augmenté par l'IA.",
            es: "I join your team on its own rules and bring the AI-augmented flow with me.",
          }),
        },
      ],
      notTitle: t({
        en: "What I don't do",
        fr: "Ce que je ne fais pas",
        es: "What I don't do",
      }),
      notItems: [
        t({ en: "Design work", fr: "Du design", es: "Design work" }),
        t({
          en: "Missions without a framing",
          fr: "Des missions sans cadrage",
          es: "Missions without a framing",
        }),
      ],
    },
    about: {
      badge: t({ en: "About", fr: "À propos", es: "About" }),
      title: t({
        en: "A tech gem",
        fr: "Une pépite de la tech",
        es: "A tech gem",
      }),
      text: t({
        en: "Software engineer with 9 years of experience, backend-minded, full-stack when a project needs it. I design custom SaaS and business web applications, and I co-founded Ouestech, where I deliver client projects. I use agentic AI every day, always inside the same strict flow.",
        fr: "Ingénieur logiciel avec 9 ans d'expérience, à dominante backend, fullstack quand un projet l'exige. Je conçois des SaaS et des applications web métier sur mesure, et j'ai co-fondé Ouestech, où je livre des projets clients. J'utilise l'IA agentique au quotidien, toujours dans le même flow strict.",
        es: "Software engineer with 9 years of experience, backend-minded, full-stack when a project needs it. I design custom SaaS and business web applications, and I co-founded Ouestech, where I deliver client projects. I use agentic AI every day, always inside the same strict flow.",
      }),
      stackTitle: t({ en: "Stack", fr: "Stack", es: "Stack" }),
      stackGroups: [
        {
          title: t({
            en: "Backend & cloud",
            fr: "Backend & cloud",
            es: "Backend & cloud",
          }),
          items: [
            "AWS (Lambda)",
            "Microservices",
            "REST APIs",
            "Node.js",
            "TypeScript",
            "NestJS",
            "PostgreSQL",
            "Prisma",
            "Docker",
          ],
        },
        {
          title: t({
            en: "Web & product",
            fr: "Web & produit",
            es: "Web & product",
          }),
          items: ["Next.js", "React", "Tailwind CSS", "Stripe"],
        },
        {
          title: t({
            en: "Agentic AI engineering",
            fr: "Ingénierie IA agentique",
            es: "Agentic AI engineering",
          }),
          items: [
            "Claude Code",
            t({
              en: "Agent harness: rules, skills, sub-agents",
              fr: "Harnais d'agents : règles, skills, sous-agents",
              es: "Agent harness: rules, skills, sub-agents",
            }),
            t({
              en: "Spec-driven development",
              fr: "Développement piloté par la spec",
              es: "Spec-driven development",
            }),
            t({
              en: "Test-first with agents",
              fr: "Tests d'abord avec les agents",
              es: "Test-first with agents",
            }),
            t({
              en: "Independent AI review",
              fr: "Revue IA indépendante",
              es: "Independent AI review",
            }),
          ],
        },
      ],
      stackNote: t({
        en: "The harness is what keeps the agents inside the project's rules: they follow the dev rules, the frozen spec and the tests, and nothing ships without review.",
        fr: "Le harnais garde les agents dans les règles du projet : ils suivent les dev rules, la spec figée et les tests, et rien ne part sans revue.",
        es: "The harness is what keeps the agents inside the project's rules: they follow the dev rules, the frozen spec and the tests, and nothing ships without review.",
      }),
      ouestech: t({
        en: "See Ouestech",
        fr: "Voir Ouestech",
        es: "See Ouestech",
      }),
      formations: t({
        en: "I also teach: bootcamp and agentic AI",
        fr: "Je forme aussi : bootcamp et IA agentique",
        es: "I also teach: bootcamp and agentic AI",
      }),
    },
  },
} satisfies Dictionary;

export default homeContent;

import { t, type Dictionary } from "intlayer";

const footerContent = {
  key: "footer",
  content: {
    description: t({
      en: "Premium learning platform for modern developers. Courses in JavaScript, TypeScript, React, Next.js, Node.js, AI, and Cloud.",
      fr: "Plateforme d'apprentissage premium pour les développeurs modernes. Cours en JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud.",
      es: "Plataforma de aprendizaje premium para desarrolladores modernos. Cursos de JavaScript, TypeScript, React, Next.js, Node.js, IA y Cloud.",
    }),
    information: {
      label: t({
        en: "Information",
        fr: "Information",
        es: "Información",
      }),
      links: [
        {
          href: "/me",
          label: t({
            en: "CV",
            fr: "CV",
            es: "CV",
          }),
          description: t({
            en: "My professional background",
            fr: "Mon parcours professionnel",
            es: "Mi trayectoria profesional",
          }),
        },
        {
          href: "/projects",
          label: t({
            en: "Projects",
            fr: "Projets",
            es: "Proyectos",
          }),
          description: t({
            en: "Technical portfolio",
            fr: "Portfolio technique",
            es: "Portafolio técnico",
          }),
        },
        {
          href: "/blog",
          label: t({
            en: "Blog",
            fr: "Blog",
            es: "Blog",
          }),
          description: t({
            en: "Articles & tutorials",
            fr: "Articles & tutoriels",
            es: "Artículos y tutoriales",
          }),
        },
        {
          href: "/contact",
          label: t({
            en: "Contact",
            fr: "Contact",
            es: "Contacto",
          }),
          description: t({
            en: "Get in touch",
            fr: "Entrer en contact",
            es: "Ponerse en contacto",
          }),
        },
      ],
    },
    learning: {
      label: t({
        en: "Learning",
        fr: "Apprentissage",
        es: "Aprendizaje",
      }),
      links: [
        {
          href: "/formations",
          label: t({
            en: "Formations",
            fr: "Formations",
            es: "Formaciones",
          }),
          description: t({
            en: "Premium courses",
            fr: "Cours premium",
            es: "Cursos premium",
          }),
        },
        {
          href: "/pricing",
          label: t({
            en: "Plans",
            fr: "Formules",
            es: "Planes",
          }),
          description: t({
            en: "Plans & subscriptions",
            fr: "Formules & abonnements",
            es: "Planes y suscripciones",
          }),
        },
        {
          href: "/tech-mastry",
          label: t({
            en: "TechMastry",
            fr: "TechMastry",
            es: "TechMastry",
          }),
          description: t({
            en: "Interview preparation",
            fr: "Préparation aux entretiens",
            es: "Preparación para entrevistas",
          }),
        },
        {
          href: "/dashboard",
          label: t({
            en: "Dashboard",
            fr: "Tableau de bord",
            es: "Panel de control",
          }),
          description: t({
            en: "Learner space",
            fr: "Espace apprenant",
            es: "Espacio del estudiante",
          }),
        },
        {
          href: "/community",
          label: t({
            en: "Community",
            fr: "Communauté",
            es: "Comunidad",
          }),
          description: t({
            en: "Join the community",
            fr: "Rejoindre la communauté",
            es: "Únete a la comunidad",
          }),
        },
      ],
    },
    legal: {
      links: [
        {
          href: "/terms",
          label: t({
            en: "Terms of Service",
            fr: "Conditions d'utilisation",
            es: "Términos de Servicio",
          }),
        },
        {
          href: "/privacy",
          label: t({
            en: "Privacy Policy",
            fr: "Politique de confidentialité",
            es: "Política de Privacidad",
          }),
        },
        {
          href: "/me",
          label: t({
            en: "CV",
            fr: "CV",
            es: "CV",
          }),
        },
      ],
    },
    projects: {
      label: t({
        en: "Featured Projects",
        fr: "Projets Phares",
        es: "Proyectos Destacados",
      }),
      items: [
        {
          href: "https://evopur.ca",
          label: "Evopur",
          description: t({
            en: "Ecological Household Cleaning Services in Montreal",
            fr: "Services de nettoyage écologique pour les ménages à Montréal",
            es: "Servicios de limpieza ecológica para hogares en Montreal",
          }),
        },
        {
          href: "https://ncr.ouestech.com",
          label: "NCR",
          description: t({
            en: "Administrative processes Platform",
            fr: "Plateforme de processus administratifs",
            es: "Plataforma de procesos administrativos",
          }),
        },
        {
          href: "https://quizzen.fr",
          label: "Quizzen",
          description: t({
            en: "AI-Powered Quiz Platform",
            fr: "Plateforme de quiz alimentée par l'IA",
            es: "Plataforma de cuestionarios impulsada por IA",
          }),
        },
        {
          href: "https://anumerique.com",
          label: "A'Numerique",
          description: t({
            en: "An innovative service bridging the digital divide",
            fr: "Un service innovant pour combler la fracture numérique",
            es: "Un servicio innovador para cerrar la brecha digital",
          }),
        },
      ],
    },
    contact: {
      items: [
        {
          href: "mailto:fygs.dev@gmail.com",
          label: "fygs.dev@gmail.com",
        },
        {
          href: "tel:+33644808530",
          label: "+33 6 44 80 85 30",
        },
        {
          href: "https://github.com/fygs",
          label: "GitHub",
        },
        {
          href: "https://linkedin.com/in/fernandsoualo",
          label: "LinkedIn",
        },
      ],
    },
    copyright: {
      text: t({
        en: "All rights reserved.",
        fr: "Tous droits réservés.",
        es: "Todos los derechos reservados.",
      }),
      builtWith: {
        text: t({
          en: "Crafted with",
          fr: "Conçu avec",
          es: "Elaborado con",
        }),
        nextjs: "Next.js 15",
        tailwind: "Tailwind CSS",
        shadcn: "Shadcn UI",
      },
    },
  },
} satisfies Dictionary;

export default footerContent;

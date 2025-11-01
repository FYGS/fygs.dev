import { t, type Dictionary } from "intlayer";

const contactPageContent = {
  key: "contact-page",
  content: {
    metadata: {
      title: t({
        en: "Contact - Fernand SOUALO | Let's Work Together",
        fr: "Contact - Fernand SOUALO | Travaillons Ensemble",
        es: "Contacto - Fernand SOUALO | Trabajemos Juntos",
      }),
      description: t({
        en: "Get in touch with Fernand SOUALO for your next project. Available for freelance work and technical consulting.",
        fr: "Contactez Fernand SOUALO pour votre prochain projet. Disponible pour du travail indépendant et du conseil technique.",
        es: "Póngase en contacto con Fernand SOUALO para su próximo proyecto. Disponible para trabajo freelance y consultoría técnica.",
      }),
    },
    contactInfo: [
      {
        icon: "MapPin",
        title: t({
          en: "Location",
          fr: "Emplacement",
          es: "Ubicación",
        }),
        description: t({
          en: "France, Remote Worldwide",
          fr: "France, Télétravail à Distance",
          es: "Francia, Trabajo Remoto Mundial",
        }),
      },
      {
        icon: "Mail",
        title: t({
          en: "Email",
          fr: "Email",
          es: "Correo electrónico",
        }),
        description: "fygs.dev@gmail.com",
      },
      {
        icon: "Calendar",
        title: t({
          en: "Availability",
          fr: "Disponibilité",
          es: "Disponibilidad",
        }),
        description: t({
          en: "Open for projects",
          fr: "Ouvert aux projets",
          es: "Abierto a proyectos",
        }),
      },
      {
        icon: "MessageSquare",
        title: t({
          en: "Response Time",
          fr: "Délai de Réponse",
          es: "Tiempo de Respuesta",
        }),
        description: t({
          en: "Within 24 hours",
          fr: "Dans les 24 heures",
          es: "Dentro de las 24 horas",
        }),
      },
    ],
    page: {
      title: t({
        en: "Let's Work Together",
        fr: "Travaillons Ensemble",
        es: "Trabajemos Juntos",
      }),
      description: t({
        en: "I'm always interested in hearing about new projects and opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
        fr: "Je suis toujours intéressé à entendre parler de nouveaux projets et opportunités. Que vous ayez une question ou que vous vouliez simplement dire bonjour, je ferai de mon mieux pour vous répondre !",
        es: "Siempre me interesa conocer nuevos proyectos y oportunidades. Ya sea que tenga una pregunta o simplemente quiera saludar, haré lo posible por responderle.",
      }),
      whyWorkWithMe: {
        title: t({
          en: "Why Work With Me?",
          fr: "Pourquoi Travailler Avec Moi ?",
          es: "¿Por qué Trabajar Conmigo?",
        }),
        points: [
          t({
            en: "✓ 5+ years of professional experience",
            fr: "✓ 5+ ans d'expérience professionnelle",
            es: "✓ 5+ años de experiencia profesional",
          }),
          t({
            en: "✓ Expertise in modern web technologies",
            fr: "✓ Expertise dans les technologies web modernes",
            es: "✓ Experiencia en tecnologías web modernas",
          }),
          t({
            en: "✓ Strong focus on code quality and best practices",
            fr: "✓ Forte concentration sur la qualité du code et les meilleures pratiques",
            es: "✓ Fuerte enfoque en calidad de código y mejores prácticas",
          }),
          t({
            en: "✓ Clear communication and regular updates",
            fr: "✓ Communication claire et mises à jour régulières",
            es: "✓ Comunicación clara y actualizaciones regulares",
          }),
          t({
            en: "✓ Scalable and maintainable solutions",
            fr: "✓ Solutions évolutives et maintenables",
            es: "✓ Soluciones escalables y mantenibles",
          }),
        ],
      },
    },
  },
} satisfies Dictionary;

export default contactPageContent;
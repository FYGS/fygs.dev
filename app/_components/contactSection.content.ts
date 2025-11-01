import { t, type Dictionary } from "intlayer";

const contactSectionContent = {
  key: "contact-section",
  content: {
    badge: t({
      en: "Contact Me",
      fr: "Contactez-moi",
      es: "Contáctame",
    }),
    title: {
      part1: t({
        en: "Let's Work Together on Your",
        fr: "Travaillons Ensemble sur Votre",
        es: "Trabajemos Juntos en Tu",
      }),
      highlight: t({
        en: "Next Project",
        fr: "Prochain Projet",
        es: "Próximo Proyecto",
      }),
    },
    description: t({
      en: "Whether it's for a custom course, web development, or technical consultation, I'm here to help you bring your most ambitious projects to life.",
      fr: "Que ce soit pour un cours personnalisé, du développement web ou une consultation technique, je suis là pour vous aider à concrétiser vos projets les plus ambitieux.",
      es: "Ya sea para un curso personalizado, desarrollo web o consultoría técnica, estoy aquí para ayudarte a dar vida a tus proyectos más ambiciosos.",
    }),
    otherWays: t({
      en: "Other ways to reach me",
      fr: "Autres moyens de me contacter",
      es: "Otras formas de contactarme",
    }),
    directEmail: t({
      en: "Direct Email",
      fr: "Email Direct",
      es: "Correo Directo",
    }),
    quickResponse: {
      value: t({
        en: "Quick Response",
        fr: "Réponse Rapide",
        es: "Respuesta Rápida",
      }),
      description: t({
        en: "Usually within 24 hours",
        fr: "Généralement dans les 24 heures",
        es: "Generalmente dentro de 24 horas",
      }),
    },
    scheduledCall: {
      value: t({
        en: "Free Consultation",
        fr: "Consultation Gratuite",
        es: "Consulta Gratuita",
      }),
      description: t({
        en: "30 min to discuss your project",
        fr: "30 min pour discuter de votre projet",
        es: "30 min para discutir tu proyecto",
      }),
    },
    findMeOn: t({
      en: "Find me also on",
      fr: "Retrouvez-moi aussi sur",
      es: "Encuéntrame también en",
    }),
    cta: {
      title: t({
        en: "Ready to start?",
        fr: "Prêt à commencer ?",
        es: "¿Listo para comenzar?",
      }),
      description: t({
        en: "Describe your project in the form and receive a personalized response with a free estimate.",
        fr: "Décrivez votre projet dans le formulaire et recevez une réponse personnalisée avec un devis gratuit.",
        es: "Describe tu proyecto en el formulario y recibe una respuesta personalizada con un presupuesto gratuito.",
      }),
      features: [
        t({
          en: "Quick response",
          fr: "Réponse rapide",
          es: "Respuesta rápida",
        }),
        t({
          en: "Free consultation",
          fr: "Consultation gratuite",
          es: "Consulta gratuita",
        }),
        t({
          en: "Custom solutions",
          fr: "Solutions personnalisées",
          es: "Soluciones personalizadas",
        }),
      ],
    },
    linkedIn: {
      name: "@fernandsoualo",
      description: t({
        en: "Follow me on LinkedIn",
        fr: "Suivez-moi sur LinkedIn",
        es: "Sígueme en LinkedIn",
      }),
    },
    github: {
      name: "@fygsdev",
      description: t({
        en: "Discover my projects on GitHub",
        fr: "Découvrez mes projets sur GitHub",
        es: "Descubre mis proyectos en GitHub",
      }),
    },
    email: {
      name: "me@contact.com",
      description: t({
        en: "Email me for any inquiries",
        fr: "Envoyez-moi un email pour toute demande",
        es: "Envíame un correo para cualquier consulta",
      }),
    },
  },
} satisfies Dictionary;

export default contactSectionContent;

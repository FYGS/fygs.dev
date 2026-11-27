import { t, type Dictionary } from "intlayer";

const contactFormContent = {
  key: "contact-form",
  content: {
    title: t({
      en: "Contact Me",
      fr: "Contactez-moi",
      es: "Contáctame",
    }),
    description: t({
      en: "Choose the contact type for a personalized response",
      fr: "Choisissez le type de contact pour une réponse personnalisée",
      es: "Elija el tipo de contacto para una respuesta personalizada",
    }),
    contactType: {
      label: t({
        en: "Contact type",
        fr: "Type de contact",
        es: "Tipo de contacto",
      }),
      placeholder: t({
        en: "Select contact type",
        fr: "Sélectionnez le type de contact",
        es: "Seleccionar tipo de contacto",
      }),
    },
    contactTypes: {
      project: {
        label: t({
          en: "A project or a mission",
          fr: "Un projet ou une mission",
          es: "A project or a mission",
        }),
        title: t({
          en: "A project or a mission",
          fr: "Un projet ou une mission",
          es: "A project or a mission",
        }),
        description: t({
          en: "A custom SaaS, a business web application, an audit or a team reinforcement.",
          fr: "Un SaaS sur mesure, une application web métier, un audit ou un renfort d'équipe.",
          es: "A custom SaaS, a business web application, an audit or a team reinforcement.",
        }),
        placeholder: t({
          en: "Describe the need, the users, the constraints and what already exists...",
          fr: "Décrivez le besoin, les utilisateurs, les contraintes et ce qui existe déjà...",
          es: "Describe the need, the users, the constraints and what already exists...",
        }),
      },
      general: {
        label: t({
          en: "General Contact",
          fr: "Contact général",
          es: "Contacto general",
        }),
        title: t({
          en: "General Contact",
          fr: "Contact général",
          es: "Contacto general",
        }),
        description: t({
          en: "A question? A request for information?",
          fr: "Une question ? Une demande d'information ?",
          es: "¿Una pregunta? ¿Una solicitud de información?",
        }),
        placeholder: t({
          en: "Describe your request, ask your question...",
          fr: "Décrivez votre demande, posez votre question...",
          es: "Describa su solicitud, haga su pregunta...",
        }),
      },
      recruitment: {
        label: t({
          en: "Recruitment Opportunity",
          fr: "Opportunité de recrutement",
          es: "Oportunidad de reclutamiento",
        }),
        title: t({
          en: "Recruitment Opportunity",
          fr: "Opportunité de recrutement",
          es: "Oportunidad de reclutamiento",
        }),
        description: t({
          en: "Are you looking for an experienced Full-Stack developer?",
          fr: "Recherchez-vous un développeur Full-Stack expérimenté ?",
          es: "¿Está buscando un desarrollador Full-Stack experimentado?",
        }),
        placeholder: t({
          en: "Describe the position, required technologies, mission context...",
          fr: "Décrivez le poste, les technologies requises, le contexte de la mission...",
          es: "Describa el puesto, las tecnologías requeridas, el contexto de la misión...",
        }),
      },
      collaboration: {
        label: t({
          en: "Collaboration Proposal",
          fr: "Proposition de collaboration",
          es: "Propuesta de colaboración",
        }),
        title: t({
          en: "Collaboration Proposal",
          fr: "Proposition de collaboration",
          es: "Propuesta de colaboración",
        }),
        description: t({
          en: "Do you have a project and are looking for a technical partner?",
          fr: "Avez-vous un projet et recherchez-vous un partenaire technique ?",
          es: "¿Tiene un proyecto y busca un socio técnico?",
        }),
        placeholder: t({
          en: "Present your project, objectives, type of collaboration...",
          fr: "Présentez votre projet, vos objectifs, le type de collaboration...",
          es: "Presente su proyecto, objetivos, tipo de colaboración...",
        }),
      },
      training: {
        label: t({
          en: "Training Request",
          fr: "Demande de formation",
          es: "Solicitud de formación",
        }),
        title: t({
          en: "Training Request",
          fr: "Demande de formation",
          es: "Solicitud de formación",
        }),
        description: t({
          en: "Would you like to train yourself or your team?",
          fr: "Souhaitez-vous vous former ou former votre équipe ?",
          es: "¿Le gustaría capacitarse usted o a su equipo?",
        }),
        placeholder: t({
          en: "Describe your training needs, current level, objectives...",
          fr: "Décrivez vos besoins de formation, votre niveau actuel, vos objectifs...",
          es: "Describa sus necesidades de formación, nivel actual, objetivos...",
        }),
      },
    },
    formFields: {
      name: {
        label: t({
          en: "Full name",
          fr: "Nom complet",
          es: "Nombre completo",
        }),
        placeholder: t({
          en: "Your name",
          fr: "Votre nom",
          es: "Su nombre",
        }),
        error: t({
          en: "Name must contain at least 2 characters",
          fr: "Le nom doit contenir au moins 2 caractères",
          es: "El nombre debe contener al menos 2 caracteres",
        }),
      },
      email: {
        label: t({
          en: "Email",
          fr: "Email",
          es: "Correo electrónico",
        }),
        placeholder: t({
          en: "your@email.com",
          fr: "votre@email.com",
          es: "su@correo.com",
        }),
        error: t({
          en: "Invalid email address",
          fr: "Adresse email invalide",
          es: "Dirección de correo electrónico inválida",
        }),
      },
      company: {
        label: t({
          en: "Company",
          fr: "Entreprise",
          es: "Empresa",
        }),
        placeholder: t({
          en: "Your company name",
          fr: "Nom de votre entreprise",
          es: "Nombre de su empresa",
        }),
      },
      position: {
        label: t({
          en: "Your position",
          fr: "Votre poste",
          es: "Su posición",
        }),
        placeholder: t({
          en: "Your role",
          fr: "Votre rôle",
          es: "Su rol",
        }),
      },
      timeline: {
        label: t({
          en: "Timeline",
          fr: "Délai",
          es: "Timeline",
        }),
        placeholder: t({
          en: "When should it start?",
          fr: "Pour quand ?",
          es: "When should it start?",
        }),
        options: {
          asap: t({ en: "As soon as possible", fr: "Dès que possible", es: "As soon as possible" }),
          oneToThreeMonths: t({ en: "In 1 to 3 months", fr: "Dans 1 à 3 mois", es: "In 1 to 3 months" }),
          later: t({ en: "Later", fr: "Plus tard", es: "Later" }),
          exploring: t({ en: "Just exploring", fr: "Je me renseigne", es: "Just exploring" }),
        },
      },
      framing: {
        label: t({
          en: "Framing",
          fr: "Cadrage",
          es: "Framing",
        }),
        placeholder: t({
          en: "Is the need already framed?",
          fr: "Le besoin est-il déjà cadré ?",
          es: "Is the need already framed?",
        }),
        options: {
          writtenSpec: t({
            en: "Yes, a written spec exists",
            fr: "Oui, une spec écrite existe",
            es: "Yes, a written spec exists",
          }),
          partial: t({
            en: "Partly framed",
            fr: "Partiellement cadré",
            es: "Partly framed",
          }),
          none: t({
            en: "Not yet: I need help to frame it",
            fr: "Pas encore : j'ai besoin d'aide pour le cadrer",
            es: "Not yet: I need help to frame it",
          }),
        },
      },
      subject: {
        label: t({
          en: "Subject",
          fr: "Sujet",
          es: "Asunto",
        }),
        placeholder: {
          project: t({
            en: "Ex: Custom SaaS for managing our appointments",
            fr: "Ex: SaaS sur mesure pour gérer nos rendez-vous",
            es: "Ex: Custom SaaS for managing our appointments",
          }),
          recruitment: t({
            en: "Ex: Full-Stack Developer - 6 month mission",
            fr: "Ex: Développeur Full-Stack - Mission de 6 mois",
            es: "Ej: Desarrollador Full-Stack - Misión de 6 meses",
          }),
          collaboration: t({
            en: "Ex: Technical partnership for startup",
            fr: "Ex: Partenariat technique pour startup",
            es: "Ej: Asociación técnica para startup",
          }),
          training: t({
            en: "Ex: React/Next.js training for team",
            fr: "Ex: Formation React/Next.js pour l'équipe",
            es: "Ej: Capacitación en React/Next.js para equipo",
          }),
          general: t({
            en: "What would you like to discuss?",
            fr: "Qu'aimeriez-vous discuter ?",
            es: "¿De qué le gustaría hablar?",
          }),
        },
        error: t({
          en: "Subject must contain at least 5 characters",
          fr: "Le sujet doit contenir au moins 5 caractères",
          es: "El asunto debe contener al menos 5 caracteres",
        }),
      },
      message: {
        label: t({
          en: "Message",
          fr: "Message",
          es: "Mensaje",
        }),
        error: t({
          en: "Message must contain at least 10 characters",
          fr: "Le message doit contenir au moins 10 caractères",
          es: "El mensaje debe contener al menos 10 caracteres",
        }),
      },
    },
    submitButton: {
      sending: t({
        en: "Sending...",
        fr: "Envoi en cours...",
        es: "Enviando...",
      }),
      send: t({
        en: "Send message",
        fr: "Envoyer le message",
        es: "Enviar mensaje",
      }),
    },
    notifications: {
      success: {
        title: t({
          en: "Message sent successfully!",
          fr: "Message envoyé avec succès !",
          es: "¡Mensaje enviado con éxito!",
        }),
        description: t({
          en: "I will respond to you as soon as possible.",
          fr: "Je vous répondrai dans les plus brefs délais.",
          es: "Le responderé lo antes posible.",
        }),
      },
      error: {
        title: t({
          en: "Error sending message",
          fr: "Erreur lors de l'envoi",
          es: "Error al enviar el mensaje",
        }),
        description: t({
          en: "Please try again later.",
          fr: "Veuillez réessayer plus tard.",
          es: "Por favor, inténtelo de nuevo más tarde.",
        }),
      },
    },
 },
} satisfies Dictionary;

export default contactFormContent;
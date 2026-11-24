import { t, type Dictionary } from "intlayer";

/** Wording of the course card. The card also appears on the home page, which is translated. */
const courseCardSharedContent = {
  key: "course-card-shared",
  content: {
    levels: {
      BEGINNER: t({ en: "Beginner", es: "Principiante", fr: "Débutant" }),
      INTERMEDIATE: t({ en: "Intermediate", es: "Intermedio", fr: "Intermédiaire" }),
      ADVANCED: t({ en: "Advanced", es: "Avanzado", fr: "Avancé" }),
      EXPERT: t({ en: "Expert", es: "Experto", fr: "Expert" }),
    },
    badges: {
      popular: t({ en: "Featured", es: "Destacado", fr: "À la une" }),
      premium: t({ en: "Premium", es: "Premium", fr: "Premium" }),
      free: t({ en: "Free", es: "Gratis", fr: "Gratuite" }),
    },
    status: {
      enrolled: t({ en: "Enrolled", es: "Inscrito", fr: "Inscrit" }),
      purchased: t({ en: "Purchased", es: "Comprado", fr: "Acheté" }),
      subscription: t({ en: "In your subscription", es: "En tu suscripción", fr: "Inclus dans votre abonnement" }),
      granted: t({ en: "Access granted", es: "Acceso concedido", fr: "Accès offert" }),
      lapsed: t({ en: "Access expired", es: "Acceso caducado", fr: "Accès expiré" }),
      staff: t({ en: "Your course", es: "Tu curso", fr: "Votre formation" }),
    },
    cta: {
      continue: t({ en: "Continue", es: "Continuar", fr: "Continuer" }),
      start: t({ en: "Start", es: "Empezar", fr: "Commencer" }),
      renew: t({ en: "Get access again", es: "Recuperar el acceso", fr: "Reprendre l’accès" }),
      enroll: t({ en: "Enroll", es: "Inscribirse", fr: "S’inscrire" }),
      discover: t({ en: "Discover", es: "Descubrir", fr: "Découvrir" }),
      preview: t({ en: "Free preview", es: "Vista previa gratuita", fr: "Aperçu gratuit" }),
    },
    price: {
      free: t({ en: "Free", es: "Gratis", fr: "Gratuite" }),
      subscriptionOnly: t({ en: "Included in Premium", es: "Incluido en Premium", fr: "Inclus dans Premium" }),
      orPremium: t({ en: "or included in Premium", es: "o incluido en Premium", fr: "ou inclus dans Premium" }),
    },
    a11y: {
      duration: t({ en: "Duration", es: "Duración", fr: "Durée" }),
      learners: t({ en: "Learners", es: "Estudiantes", fr: "Apprenants" }),
      rating: t({ en: "Average rating", es: "Valoración media", fr: "Note moyenne" }),
    },
  },
} satisfies Dictionary;

export default courseCardSharedContent;

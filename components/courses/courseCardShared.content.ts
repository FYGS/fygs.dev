import { t, type Dictionary } from "intlayer";

const courseCardSharedContent = {
  key: "course-card-shared",
  content: {
    // Level labels
    levels: {
      BEGINNER: t({
        en: "Beginner",
        es: "Principiante",
        fr: "Débutant",
      }),
      INTERMEDIATE: t({
        en: "Intermediate",
        es: "Intermedio",
        fr: "Intermédiaire",
      }),
      ADVANCED: t({
        en: "Advanced",
        es: "Avanzado",
        fr: "Avancé",
      }),
      EXPERT: t({
        en: "Expert",
        es: "Experto",
        fr: "Expert",
      }),
    },
    // Access state badges
    badges: {
      enrolled: t({
        en: "Enrolled",
        es: "Inscrito",
        fr: "Inscrit",
      }),
      free: t({
        en: "Free",
        es: "Gratis",
        fr: "Gratuit",
      }),
      popular: t({
        en: "Popular",
        es: "Popular",
        fr: "Populaire",
      }),
      premium: t({
        en: "Premium",
        es: "Premium",
        fr: "Premium",
      }),
    },
    // CTA labels
    cta: {
      continue: t({
        en: "Continue",
        es: "Continuar",
        fr: "Continuer",
      }),
      enroll: t({
        en: "Enroll",
        es: "Inscribirse",
        fr: "S'inscrire",
      }),
      discover: t({
        en: "Discover",
        es: "Descubrir",
        fr: "Découvrir",
      }),
      preview: t({
        en: "Preview",
        es: "Vista previa",
        fr: "Prévisualiser",
      }),
    },
    // Price
    freePrice: t({
      en: "Free",
      es: "Gratis",
      fr: "Gratuit",
    }),
    // Premium inclusion text
    includedWith: t({
      en: "Included with",
      es: "Incluido con",
      fr: "Inclus avec",
    }),
  },
} satisfies Dictionary;

export default courseCardSharedContent;

import { t, type DeclarationContent } from "intlayer";

export default {
  key: "status-error",
  content: {
    title: t({
      fr: "Erreur",
      en: "Error",
      es: "Error",
    }),
    heading: t({
      fr: "Oups ! Quelque chose s'est mal passé",
      en: "Oops! Something Went Wrong",
      es: "¡Ups! Algo salió mal",
    }),
    description: t({
      fr: "Une erreur inattendue s'est produite. Nos équipes ont été notifiées.",
      en: "An unexpected error occurred. Our teams have been notified.",
      es: "Se produjo un error inesperado. Nuestros equipos han sido notificados.",
    }),
    errorDetailsTitle: t({
      fr: "Détails de l'erreur :",
      en: "Error details:",
      es: "Detalles del error:",
    }),
    errorIdLabel: t({
      fr: "ID de l'erreur:",
      en: "Error ID:",
      es: "ID de error:",
    }),
    unknownError: t({
      fr: "Une erreur inconnue s'est produite",
      en: "An unknown error occurred",
      es: "Se produjo un error desconocido",
    }),
    retryButton: t({
      fr: "Réessayer",
      en: "Retry",
      es: "Reintentar",
    }),
    homeButton: t({
      fr: "Accueil",
      en: "Home",
      es: "Inicio",
    }),
  },
} satisfies DeclarationContent;

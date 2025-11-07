import { t, type DeclarationContent } from "intlayer";

export default {
  key: "status-unauthorized",
  content: {
    title: t({
      fr: "Accès non autorisé",
      en: "Unauthorized Access",
      es: "Acceso no autorizado",
    }),
    heading: t({
      fr: "Accès non autorisé",
      en: "Unauthorized Access",
      es: "Acceso no autorizado",
    }),
    description: t({
      fr: "Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.",
      en: "Sorry, you don't have the necessary permissions to access this page.",
      es: "Lo sentimos, no tienes los permisos necesarios para acceder a esta página.",
    }),
    accessTitle: t({
      fr: "Pour accéder à cette page :",
      en: "To access this page:",
      es: "Para acceder a esta página:",
    }),
    loginRequired: t({
      fr: "Connectez-vous avec un compte valide",
      en: "Sign in with a valid account",
      es: "Inicia sesión con una cuenta válida",
    }),
    goBackSuggestion: t({
      fr: "Retournez à la page précédente",
      en: "Go back to the previous page",
      es: "Vuelve a la página anterior",
    }),
    loginButton: t({
      fr: "Se connecter",
      en: "Sign In",
      es: "Iniciar sesión",
    }),
    backButton: t({
      fr: "Retour",
      en: "Back",
      es: "Volver",
    }),
  },
} satisfies DeclarationContent;

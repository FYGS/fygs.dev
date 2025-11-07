import { t, type DeclarationContent } from "intlayer";

export default {
  key: "status-not-found",
  content: {
    title: t({
      fr: "Page introuvable",
      en: "Page Not Found",
      es: "Página no encontrada",
    }),
    heading: t({
      fr: "Oups ! Page introuvable",
      en: "Oops! Page Not Found",
      es: "¡Ups! Página no encontrada",
    }),
    description: t({
      fr: "Il semble que vous ayez pris un mauvais tournant. La page que vous recherchez n'existe pas ou a été déplacée.",
      en: "It seems you've taken a wrong turn. The page you're looking for doesn't exist or has been moved.",
      es: "Parece que has tomado un camino equivocado. La página que buscas no existe o ha sido movida.",
    }),
    suggestionsTitle: t({
      fr: "Suggestions utiles :",
      en: "Helpful suggestions:",
      es: "Sugerencias útiles:",
    }),
    checkUrl: t({
      fr: "Vérifiez l'URL pour les fautes de frappe",
      en: "Check the URL for typos",
      es: "Verifica la URL por errores tipográficos",
    }),
    goBack: t({
      fr: "Retournez à la page précédente",
      en: "Go back to the previous page",
      es: "Vuelve a la página anterior",
    }),
    goHome: t({
      fr: "Naviguez vers la page d'accueil",
      en: "Navigate to the home page",
      es: "Navega a la página de inicio",
    }),
    backButton: t({
      fr: "Retour",
      en: "Back",
      es: "Volver",
    }),
    homeButton: t({
      fr: "Accueil",
      en: "Home",
      es: "Inicio",
    }),
  },
} satisfies DeclarationContent;
